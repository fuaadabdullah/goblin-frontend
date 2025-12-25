#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

  console.log('Supabase URL:', supabaseUrl ? supabaseUrl : '(missing)');
  console.log('Supabase ANON Key:', supabaseAnonKey ? 'present' : '(missing)');
  console.log('Supabase SERVICE Role Key:', supabaseServiceKey ? 'present' : '(missing)');
  console.log('Env vars check: SUPABASE_URL set?', !!process.env.SUPABASE_URL, 'SUPABASE_ANON_KEY set?', !!process.env.SUPABASE_ANON_KEY);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('\nMissing required Supabase environment variables. Create apps/goblin-assistant/.env.local or export SUPABASE_URL and SUPABASE_ANON_KEY.');
    process.exit(1);
  }

  console.log('\nAttempting a simple read from the database using the Supabase client...');

  // Create a lightweight client here to avoid importing the app's database module
  const client = createClient(supabaseUrl, supabaseServiceKey ?? supabaseAnonKey);

  try {
    const { data, error } = await client.from('provider_health').select('*').limit(1);
    if (error) {
      console.error('Query error (could be permission, table missing, or network):', error.message || error);
      process.exit(2);
    }

    console.log('Success: fetched', Array.isArray(data) ? data.length : 'unknown', 'rows. Sample:');
    console.log(JSON.stringify((data as any[]).slice(0, 3), null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error while querying Supabase:', err);
    process.exit(3);
  }
}

main();
