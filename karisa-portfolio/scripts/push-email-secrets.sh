#!/usr/bin/env bash
#
# Push the server-side email secrets from .env.local into Supabase.
#
# Reads .env.local rather than taking arguments, so no secret ever lands in
# shell history. .env.local is gitignored; .env.example is the committed
# template listing every name.
#
#   ./scripts/push-email-secrets.sh
#
set -euo pipefail

cd "$(dirname "$0")/.."

ENV_FILE=".env.local"

if [ ! -f "$ENV_FILE" ]; then
  echo "error: $ENV_FILE not found." >&2
  echo "       cp .env.example .env.local, then fill in section 2." >&2
  exit 1
fi

# Only these names are pushed. VITE_* are frontend build vars and belong in
# Vercel, not in function secrets. SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
# are injected by the platform and must not be set by hand.
KEYS=(
  RESEND_API_KEY
  RESEND_WEBHOOK_SECRET
  RESEND_STATUS_WEBHOOK_SECRET
  ADMIN_EMAIL
  MAIL_DOMAIN
  MAIL_FROM_ADDRESS
  MAIL_FROM_NAME
  PORTFOLIO_URL
  DASHBOARD_URL
  DENO_ENV
)

# Read a KEY=value line from the env file, tolerating surrounding quotes.
read_var() {
  sed -n "s/^$1=//p" "$ENV_FILE" | tail -n 1 | sed -e 's/^"\(.*\)"$/\1/' -e "s/^'\(.*\)'\$/\1/"
}

PROJECT_REF="$(read_var SUPABASE_PROJECT_REF)"
if [ -z "$PROJECT_REF" ]; then
  echo "error: SUPABASE_PROJECT_REF is empty in $ENV_FILE" >&2
  exit 1
fi

args=()
missing=()
for key in "${KEYS[@]}"; do
  value="$(read_var "$key")"
  if [ -z "$value" ]; then
    missing+=("$key")
    continue
  fi
  args+=("$key=$value")
done

if [ ${#missing[@]} -gt 0 ]; then
  echo "error: these are empty in $ENV_FILE:" >&2
  printf '       %s\n' "${missing[@]}" >&2
  exit 1
fi

# Sanity check before spending a round trip: the From address must sit on the
# sending domain, or Resend rejects every send with a 422.
FROM_ADDR="$(read_var MAIL_FROM_ADDRESS)"
MAIL_DOM="$(read_var MAIL_DOMAIN)"
if [ "${FROM_ADDR##*@}" != "$MAIL_DOM" ]; then
  echo "error: MAIL_FROM_ADDRESS ($FROM_ADDR) is not on MAIL_DOMAIN ($MAIL_DOM)." >&2
  exit 1
fi

echo "Linking to project $PROJECT_REF ..."
npx --yes supabase@latest link --project-ref "$PROJECT_REF"

echo "Pushing ${#args[@]} secrets ..."
npx --yes supabase@latest secrets set "${args[@]}"

echo
echo "Done. Verify with:  npx supabase@latest secrets list"
