import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authorizeRoles } from '@/lib/api-auth';

export async function GET() {
  const auth = await authorizeRoles(['super_admin']);
  if (!auth.ok) return auth.response;

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, full_name, role, is_active, created_at, updated_at');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  // Use the register route for user creation
  return NextResponse.json({ error: 'Use /api/auth/register for user creation' }, { status: 405 });
}

