import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Participant = {
  id: string;
  nom: string;
  prenom: string;
  entreprise: string;
  poste: string;
  email: string | null;
  telephone: string | null;
  pays: string;
  date_participation: string;
  thematique_panel: string;
  created_at: string;
};

export type ParticipantInsert = Omit<Participant, 'id' | 'created_at'>;
