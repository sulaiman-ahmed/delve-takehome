import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function checkPitrStatus(planType: string): { enabled: boolean; maxRetentionDays: number | string } {
  if (planType === 'Pro') {
    return { enabled: true, maxRetentionDays: 7 }; // Pro plan has PITR for up to 7 days
  } else if (planType === 'Enterprise') {
    return { enabled: true, maxRetentionDays: 'Varies' }; // Enterprise plans may have custom retention
  } else {
    return { enabled: false, maxRetentionDays: 0 }; // Free plans do not have PITR
  }
}

export async function POST(req: Request) {

  try {
    const body = await req.json();

    if (!body.apiKey) {
      return NextResponse.json({ success: false, error: 'API key is required' }, { status: 400 });
    }

    const apiKey = body.apiKey;

    const supabaseCustomer = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, apiKey);

    const { data: userData, error: userError } = await supabaseCustomer.auth.admin.listUsers();
    if (userError) {
      console.error("Error fetching users:", userError.message);
      return NextResponse.json({ success: false, error: 'Error fetching users' }, { status: 400 });
    }

    const users = userData?.users || [];
    
    const userMfaStatus = users.map(user => ({
      email: user.email,
      mfaEnabled: user.factors ? user.factors.some(factor => factor.factor_type === 'totp') : false,
    }));

    const { data: tables, error: tableError } = await supabaseAdmin.rpc('get_public_tables');

    if (tableError) {
      console.error("Error fetching tables via custom function:", tableError.message);
      return NextResponse.json({ success: false, error: 'Error fetching tables' }, { status: 400 });
    }

    const tableRlsStatus = await Promise.all(
      tables.map(async (table: { tablename: string }) => {
        const { data: rlsData, error: rlsError } = await supabaseAdmin.rpc('check_rls_enabled', {
          table_name: table.tablename,
        });

        if (rlsError || rlsData === null) {
          return {
            table: table.tablename,
            rlsEnabled: false,
            policiesExist: false,
          };
        }

        const rlsEnabled = rlsData;

        const { data: policies, error: policiesError } = await supabaseAdmin
          .from('pg_policies')
          .select('*')
          .eq('tablename', table.tablename);

        return {
          table: table.tablename,
          rlsEnabled: rlsEnabled,
          policiesExist: (policies?.length ?? 0) > 0,
        };
      })
    );

    const planType = process.env.SUPABASE_PLAN_TYPE || 'Free';
    const pitrStatus = checkPitrStatus(planType);


    return NextResponse.json({
      success: true,
      userMfaStatus,
      tableRlsStatus,
      pitrStatus,
    });
  } catch (error) {
    console.error('Error handling request:', error);
    return NextResponse.json({ success: false, error: 'Bad request' }, { status: 400 });
  }
}
