import { SupabaseClient } from '@supabase/supabase-js';

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
