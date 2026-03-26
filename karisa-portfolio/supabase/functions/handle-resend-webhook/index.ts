import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.0";
import * as Sentry from "https://npm.skypack.dev/@sentry/deno";

// Initialize Sentry
Sentry.init({
  dsn: Deno.env.get("SENTRY_DSN_URL"),
  tracesSampleRate: 1.0,
});

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const resendWebhookSecret = Deno.env.get("RESEND_WEBHOOK_SECRET") || "";

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

    // Verify webhook signature (optional but recommended)
    const signature = req.headers.get("x-resend-signature");
    if (!signature && resendWebhookSecret) {
      Sentry.captureException(new Error("Missing webhook signature"));
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
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
      Sentry.captureException(findError);
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
      Sentry.captureException(updateError);
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
      Sentry.captureException(analyticsError);
      // Don't fail the webhook if analytics logging fails
    }

    console.log(`Successfully tracked email event: ${type} for ${emailId}`);

    return new Response(
      JSON.stringify({ success: true, message: "Email event tracked" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    Sentry.captureException(error);

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
