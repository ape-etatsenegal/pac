// lib/supabase-admin.ts
import { createClient } from '@supabase/supabase-js';

// ⚠️ Client serveur avec clé SERVICE ROLE — ne jamais importer côté client.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);