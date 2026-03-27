import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const resendWebhookSecret = Deno.env.get("RESEND_WEBHOOK_SECRET") || "";

// Verify webhook signature using HMAC-SHA256
async function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  if (!secret) {
    console.warn("No webhook secret configured - skipping signature verification");
    return true; // Allow if no secret configured (development mode)
  }

  try {
    // Resend sends signature as: v1,<timestamp>:<signature_hex>
    const parts = signature.split(',');
    if (parts.length < 2 || !parts[1].includes(':')) {
      console.error("[Webhook] Invalid signature format");
      return false;
    }

    const [timestamp, signatureHex] = parts[1].split(':');
    const signedPayload = `${timestamp}.${body}`;

    // Create HMAC-SHA256 using Web Crypto API
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBytes = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(signedPayload)
    );

    // Convert to hex
    const expectedHex = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Constant-time comparison to prevent timing attacks
    if (expectedHex.length !== signatureHex.length) {
      console.error("[Webhook] Signature length mismatch");
      return false;
    }

    let result = 0;
    for (let i = 0; i < expectedHex.length; i++) {
      result |= expectedHex.charCodeAt(i) ^ signatureHex.charCodeAt(i);
    }

    const isValid = result === 0;
    if (!isValid) {
      console.error("[Webhook] Signature mismatch - possible tampering");
    }
    return isValid;
  } catch (error) {
    console.error("[Webhook] Signature verification error:", error);
    return false;
  }
}

// Map Resend event types to our email_status values
const EVENT_TYPE_MAP: Record<string, string> = {
  "email.sent": "sent",
  "email.delivered": "delivered",
  "email.opened": "opened",
  "email.clicked": "clicked",
  "email.bounced": "bounced",
  "email.complained": "failed",
  "email.failed": "failed",
};

serve(async (req) => {
  try {
    // Only accept POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      );
    }

    // Read raw body for signature verification
    const rawBody = await req.text();

    // Verify webhook signature
    const signature = req.headers.get("x-resend-signature");
    if (!signature) {
      console.error("[Webhook] Missing x-resend-signature header");
      return new Response(
        JSON.stringify({ error: "Unauthorized - missing signature" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const isValidSignature = await verifyWebhookSignature(rawBody, signature, resendWebhookSecret);
    if (!isValidSignature) {
      console.error("[Webhook] Invalid signature");
      return new Response(
        JSON.stringify({ error: "Unauthorized - invalid signature" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse JSON from raw body
    const body = JSON.parse(rawBody);
    const { type, data } = body;

    // Extract email ID (Resend uses 'id' field in the email object)
    const emailId = data?.email?.id || data?.id;
    if (!emailId) {
      console.warn("No email ID found in webhook payload");
      return new Response(
        JSON.stringify({ error: "No email ID" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Map event type to status
    const status = EVENT_TYPE_MAP[type];
    if (!status) {
      console.warn(`Unknown event type: ${type}`);
      return new Response(
        JSON.stringify({ success: true, message: "Event logged" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the reply record by resend_email_id
    const { data: reply, error: findError } = await supabase
      .from("submission_replies")
      .select("id, submission_id, email_metadata")
      .eq("resend_email_id", emailId)
      .single();

    if (findError) {
      console.error("Error finding reply:", findError);
      return new Response(
        JSON.stringify({ error: "Reply not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Prepare metadata update
    const currentMetadata = reply.email_metadata || {};
    const updatedMetadata = {
      ...currentMetadata,
      [status]: new Date().toISOString(),
      last_event: type,
      last_update: new Date().toISOString(),
    };

    // Add specific event data
    if (type === "email.opened") {
      updatedMetadata.opened_at = new Date().toISOString();
      updatedMetadata.user_agent = data?.user_agent || null;
      updatedMetadata.ip_address = data?.ip_address || null;
    } else if (type === "email.clicked") {
      updatedMetadata.clicked_at = new Date().toISOString();
      updatedMetadata.clicked_link = data?.click?.url || null;
      updatedMetadata.user_agent = data?.user_agent || null;
      updatedMetadata.ip_address = data?.ip_address || null;
    } else if (type === "email.bounced") {
      updatedMetadata.bounce_type = data?.bounce?.type || "permanent";
      updatedMetadata.bounce_reason = data?.bounce?.diagnostic_code || "Unknown";
    } else if (type === "email.failed") {
      updatedMetadata.failure_reason = data?.error?.message || "Unknown error";
    }

    // Update the reply record with new status and metadata
    const { error: updateError } = await supabase
      .from("submission_replies")
      .update({
        email_status: status,
        email_metadata: updatedMetadata,
      })
      .eq("id", reply.id);

    if (updateError) {
      console.error("Error updating reply:", updateError);
      // Error already logged via console.error
      return new Response(
        JSON.stringify({ error: "Failed to update reply" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Log successful tracking event
    const { error: analyticsError } = await supabase
      .from("analytics_events")
      .insert({
        submission_id: reply.submission_id,
        event_type: `email_${status}`,
        event_data: {
          resend_email_id: emailId,
          webhook_type: type,
          ...updatedMetadata,
        },
      });

    if (analyticsError) {
      console.error("Error logging analytics:", analyticsError);
      // Don't fail the webhook if analytics logging fails
    }

    console.log(`Successfully tracked email event: ${type} for ${emailId}`);

    return new Response(
      JSON.stringify({ success: true, message: "Email event tracked" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
