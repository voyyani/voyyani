import { useEffect, useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { InboundReply, InboundAttachment } from '@/utils/emailValidation';

/**
 * Hook to fetch and subscribe to inbound emails for a submission
 */
export function useInboundEmails(submissionId: string | undefined, client: SupabaseClient) {
  const [emails, setEmails] = useState<InboundReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!submissionId || !client) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    let subscription: any;

    const fetchEmails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Initial fetch of inbound emails with attachments
        const { data, error: fetchError } = await client
          .from('inbound_replies')
          .select('*, inbound_attachments(*)')
          .eq('submission_id', submissionId)
          .order('received_at', { ascending: true });

        if (fetchError) throw fetchError;

        if (isMounted) {
          setEmails(data || []);
          setLoading(false);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch emails';
        if (isMounted) {
          setError(message);
          setLoading(false);
        }
      }
    };

    // Fetch initial data
    fetchEmails();

    // Subscribe to real-time updates for new inbound emails
    subscription = client
      .channel(`inbound-${submissionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'inbound_replies',
          filter: `submission_id=eq.${submissionId}`,
        },
        (payload) => {
          if (isMounted) {
            // Add new email to list
            const newEmail = payload.new as InboundReply;
            setEmails((prev) => [...prev, newEmail]);
            console.log('[useInboundEmails] New email received:', newEmail.id);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'inbound_replies',
          filter: `submission_id=eq.${submissionId}`,
        },
        (payload) => {
          if (isMounted) {
            // Update existing email (e.g., mark as read)
            const updatedEmail = payload.new as InboundReply;
            setEmails((prev) =>
              prev.map((email) =>
                email.id === updatedEmail.id ? updatedEmail : email
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [submissionId, client]);

  return { emails, loading, error };
}

/**
 * Hook to mark an inbound email as read
 */
export async function markEmailAsRead(
  emailId: string,
  userId: string | undefined,
  client: SupabaseClient
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId) {
      return { success: false, error: 'User ID required' };
    }

    const { error } = await client.rpc('mark_inbound_reply_read', {
      p_reply_id: emailId,
      p_user_id: userId,
    });

    if (error) throw error;

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to mark email as read';
    return { success: false, error: message };
  }
}

/**
 * Hook to add or update admin notes on an email
 */
export async function updateEmailNotes(
  emailId: string,
  notes: string,
  client: SupabaseClient
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await client
      .from('inbound_replies')
      .update({ admin_notes: notes })
      .eq('id', emailId);

    if (error) throw error;

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update notes';
    return { success: false, error: message };
  }
}

/**
 * Hook to toggle star/important flag on an email
 */
export async function toggleEmailImportant(
  emailId: string,
  isImportant: boolean,
  client: SupabaseClient
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await client
      .from('inbound_replies')
      .update({ is_important: isImportant })
      .eq('id', emailId);

    if (error) throw error;

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update email';
    return { success: false, error: message };
  }
}

/**
 * Hook to fetch a signed download URL for an attachment
 */
export async function getAttachmentDownloadUrl(
  storagePath: string,
  client: SupabaseClient
): Promise<{ url?: string; error?: string }> {
  try {
    const { data, error } = await client.storage
      .from('inbound-attachments')
      .createSignedUrl(storagePath, 3600); // 1 hour expiry

    if (error) throw error;

    return { url: data?.signedUrl };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get download URL';
    return { error: message };
  }
}

/**
 * Hook to log download analytics
 */
export async function logAttachmentDownload(
  attachmentId: string,
  userId: string,
  client: SupabaseClient
): Promise<{ success: boolean }> {
  try {
    // Increment download count
    const { data: attachment, error: fetchError } = await client
      .from('inbound_attachments')
      .select('download_count')
      .eq('id', attachmentId)
      .single();

    if (fetchError) throw fetchError;

    const newCount = (attachment?.download_count || 0) + 1;

    const { error: updateError } = await client
      .from('inbound_attachments')
      .update({
        download_count: newCount,
        last_downloaded_at: new Date().toISOString(),
        last_downloaded_by: userId,
      })
      .eq('id', attachmentId);

    if (updateError) throw updateError;

    return { success: true };
  } catch (err) {
    console.error('Failed to log attachment download:', err);
    return { success: false };
  }
}
