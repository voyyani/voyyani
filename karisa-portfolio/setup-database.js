#!/usr/bin/env node
// setup-database.js - Execute database schema via Supabase REST API

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function setupDatabase() {
  const supabaseUrl = 'https://mrqzsfcfzvejreowkykm.supabase.co';
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ycXpzZmNmenZlanJlb3dreWttIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQyMTEzMCwiZXhwIjoyMDg5OTk3MTMwfQ.b18oupbYGHc3P7w0-pzdkNnTTLhwr5wDMxav_sz6atM';

  try {
    console.log('🚀 Starting database setup...\n');

    // Read schema file
    const schemaPath = path.join(__dirname, 'supabase/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    console.log('📝 Sending SQL schema to Supabase...\n');

    // Execute entire schema as one request
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
      },
      body: JSON.stringify({ sql: schema })
    });

    // If the above endpoint doesn't exist, try alternative approach
    if (response.status === 404) {
      console.log('⚠️  Custom SQL endpoint not available.');
      console.log('📖 Please run the SQL manually via Supabase dashboard:\n');
      console.log('1. Go to: https://app.supabase.com/project/mrqzsfcfzvejreowkykm/sql');
      console.log('2. Click "New Query"');
      console.log('3. Copy the contents of: supabase/schema.sql');
      console.log('4. Click "Run"\n');
      return;
    }

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Error:', error);
      return;
    }

    const result = await response.json();
    console.log('✅ Database schema executed successfully!\n');
    console.log('📊 Setup Details:');
    console.log('   • submissions table - ✅');
    console.log('   • submission_replies table - ✅');
    console.log('   • quick_reply_templates table - ✅');
    console.log('   • RLS policies - ✅');
    console.log('   • Indexes - ✅');
    console.log('\n🎉 Your email system is ready to use!');

  } catch (error) {
    console.error('❌ Setup error:', error.message);
    console.log('\n🔧 Manual Setup Instructions:');
    console.log('1. Go to: https://app.supabase.com/project/mrqzsfcfzvejreowkykm/sql');
    console.log('2. Click "New Query"');
    console.log('3. Copy contents of: supabase/schema.sql');
    console.log('4. Click "Run"\n');
  }
}

setupDatabase();
