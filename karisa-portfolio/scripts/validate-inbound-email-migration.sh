#!/bin/bash
# ============================================================
# Migration Validation Script
# ============================================================
# Tests the inbound email migration for syntax errors
# and provides a deployment checklist
# ============================================================

set -e

echo "🔍 Validating Inbound Email Migration..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

MIGRATION_FILE="supabase/migrations/20260328000000_inbound_email_system.sql"

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
  echo -e "${RED}❌ Migration file not found: $MIGRATION_FILE${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Migration file exists${NC}"
echo ""

# Check file size
FILE_SIZE=$(wc -l < "$MIGRATION_FILE")
echo -e "${BLUE}📄 Migration file: $FILE_SIZE lines${NC}"
echo ""

# Validate SQL syntax (basic checks)
echo "🔍 Checking SQL syntax..."

# Check for common SQL errors
if grep -q "CREATE TABLE.*CREATE TABLE" "$MIGRATION_FILE"; then
  echo -e "${RED}❌ Possible duplicate CREATE TABLE statements${NC}"
  exit 1
fi

if grep -q "CREAT TABLE" "$MIGRATION_FILE"; then
  echo -e "${RED}❌ Typo found: CREAT TABLE (missing E)${NC}"
  exit 1
fi

# Check for balanced parentheses (basic check)
OPEN_PARENS=$(grep -o "(" "$MIGRATION_FILE" | wc -l)
CLOSE_PARENS=$(grep -o ")" "$MIGRATION_FILE" | wc -l)

if [ "$OPEN_PARENS" -ne "$CLOSE_PARENS" ]; then
  echo -e "${YELLOW}⚠️  Warning: Unbalanced parentheses (${OPEN_PARENS} open, ${CLOSE_PARENS} close)${NC}"
  echo -e "${YELLOW}   This may be in comments or strings - manual review recommended${NC}"
else
  echo -e "${GREEN}✅ Parentheses balanced${NC}"
fi

# Count key components
echo ""
echo "📊 Migration Statistics:"
echo "---------------------------------------------------"

TABLES=$(grep -c "CREATE TABLE" "$MIGRATION_FILE" || true)
echo -e "  Tables:        ${BLUE}$TABLES${NC}"

INDEXES=$(grep -c "CREATE INDEX" "$MIGRATION_FILE" || true)
echo -e "  Indexes:       ${BLUE}$INDEXES${NC}"

FUNCTIONS=$(grep -c "CREATE OR REPLACE FUNCTION" "$MIGRATION_FILE" || true)
echo -e "  Functions:     ${BLUE}$FUNCTIONS${NC}"

TRIGGERS=$(grep -c "CREATE TRIGGER" "$MIGRATION_FILE" || true)
echo -e "  Triggers:      ${BLUE}$TRIGGERS${NC}"

VIEWS=$(grep -c "CREATE OR REPLACE VIEW" "$MIGRATION_FILE" || true)
echo -e "  Views:         ${BLUE}$VIEWS${NC}"

POLICIES=$(grep -c "CREATE POLICY" "$MIGRATION_FILE" || true)
echo -e "  RLS Policies:  ${BLUE}$POLICIES${NC}"

COMMENTS=$(grep -c "COMMENT ON" "$MIGRATION_FILE" || true)
echo -e "  Comments:      ${BLUE}$COMMENTS${NC}"

echo "---------------------------------------------------"
echo ""

# Check for required components
echo "🔍 Checking required components..."

REQUIRED_TABLES=("inbound_replies" "inbound_attachments" "spam_patterns")
for table in "${REQUIRED_TABLES[@]}"; do
  if grep -q "CREATE TABLE.*$table" "$MIGRATION_FILE"; then
    echo -e "${GREEN}  ✅ Table: $table${NC}"
  else
    echo -e "${RED}  ❌ Missing table: $table${NC}"
    exit 1
  fi
done

REQUIRED_FUNCTIONS=("extract_submission_id_from_email" "calculate_spam_score" "verify_sender_email")
for func in "${REQUIRED_FUNCTIONS[@]}"; do
  if grep -q "CREATE OR REPLACE FUNCTION.*$func" "$MIGRATION_FILE"; then
    echo -e "${GREEN}  ✅ Function: $func${NC}"
  else
    echo -e "${RED}  ❌ Missing function: $func${NC}"
    exit 1
  fi
done

REQUIRED_VIEWS=("submission_conversation_timeline" "inbound_spam_quarantine")
for view in "${REQUIRED_VIEWS[@]}"; do
  if grep -q "CREATE OR REPLACE VIEW.*$view" "$MIGRATION_FILE"; then
    echo -e "${GREEN}  ✅ View: $view${NC}"
  else
    echo -e "${RED}  ❌ Missing view: $view${NC}"
    exit 1
  fi
done

echo ""
echo -e "${GREEN}✅ All required components present!${NC}"
echo ""

# Deployment checklist
echo "📋 Deployment Checklist"
echo "---------------------------------------------------"
echo ""
echo "Before deploying, ensure you have:"
echo ""
echo "  1. ⬜ Reviewed the migration file"
echo "  2. ⬜ Backed up your database"
echo "  3. ⬜ Set RESEND_INBOUND_WEBHOOK_SECRET in Supabase secrets"
echo "  4. ⬜ Tested in local/staging environment first"
echo "  5. ⬜ Created inbound-attachments storage bucket"
echo "  6. ⬜ Updated send-reply function with reply_to header"
echo "  7. ⬜ Configured MX records in DNS"
echo "  8. ⬜ Set up Resend inbound route"
echo ""
echo "To deploy:"
echo ""
echo -e "${BLUE}  cd karisa-portfolio${NC}"
echo -e "${BLUE}  supabase db push${NC}"
echo ""
echo "---------------------------------------------------"
echo ""
echo -e "${GREEN}🎉 Migration validation complete!${NC}"
echo ""
