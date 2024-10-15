import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_email, mfa_status, rls_status, pitr_status, created_at } = body;

    const { error } = await supabaseAdmin
      .from('compliance_logs')
      .insert([{ user_email, mfa_status, rls_status, pitr_status, created_at }]);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to log compliance results' }, { status: 500 });
  }
}
