/*
# Create participants table for event registration

1. New Tables
- `participants`
  - `id` (uuid, primary key)
  - `nom` (text, not null) — last name
  - `prenom` (text, not null) — first name
  - `entreprise` (text, not null) — company
  - `poste` (text, not null) — job title
  - `email` (text, nullable) — optional email
  - `telephone` (text, nullable) — optional phone
  - `pays` (text, not null) — country
  - `date_participation` (date, not null) — participation date
  - `thematique_panel` (text, not null) — panel topic
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `participants`.
- Allow anon + authenticated CRUD (single-tenant, no auth — public form after QR scan).
*/

CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  prenom text NOT NULL,
  entreprise text NOT NULL,
  poste text NOT NULL,
  email text,
  telephone text,
  pays text NOT NULL,
  date_participation date NOT NULL,
  thematique_panel text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_participants" ON participants;
CREATE POLICY "anon_select_participants" ON participants FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_participants" ON participants;
CREATE POLICY "anon_insert_participants" ON participants FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_participants" ON participants;
CREATE POLICY "anon_update_participants" ON participants FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_participants" ON participants;
CREATE POLICY "anon_delete_participants" ON participants FOR DELETE
  TO anon, authenticated USING (true);
