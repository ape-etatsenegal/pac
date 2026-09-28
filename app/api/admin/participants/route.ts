// app/api/admin/participants/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('participants')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase admin error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ participants: data });
}