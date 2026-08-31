/**
 * Sending identity. Pure and Deno-free so Vitest covers the same file the functions use.
 * The address itself comes from env (MAIL_FROM_ADDRESS / MAIL_DOMAIN) so changing it is
 * a `supabase secrets set`, not a source edit in three places.
 */

export function buildFrom(name: string, address: string): string {
  if (!name) return address;
  const needsQuoting = /[,;:<>@"]/.test(name);
  return `${needsQuoting ? `"${name}"` : name} <${address}>`;
}

/** Must stay in lockstep with extract_submission_id_from_email() in the migration. */
export function buildReplyAddress(submissionId: string, domain: string): string {
  return `reply+${submissionId}@${domain}`;
}

export function buildThreadMessageId(
  submissionId: string,
  domain: string,
  now: number = Date.now()
): string {
  return `<${submissionId}.${now}@${domain}>`;
}
