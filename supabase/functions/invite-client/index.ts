import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  // Verify admin
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const supabaseUser = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user } } = await supabaseUser.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

  const { data: roleData } = await supabaseAdmin.from('user_roles').select('role').eq('user_id', user.id).single();
  if (roleData?.role !== 'admin') return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });

  const { email, full_name, company_name, phone, cnpj, regime } = await req.json();

  try {
    // Create auth user with invite
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { full_name },
    });

    if (createError && !createError.message.includes('already been registered')) throw createError;

    let newUserId = newUser?.user?.id;

    // If already registered, get their ID
    if (!newUserId) {
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existing = existingUsers?.users?.find(u => u.email === email);
      newUserId = existing?.id;
    }

    if (newUserId) {
      // Set role as client
      await supabaseAdmin.from('user_roles').upsert({
        user_id: newUserId,
        role: 'client',
      }, { onConflict: 'user_id,role' });

      // Create profile
      await supabaseAdmin.from('profiles').upsert({
        id: newUserId,
        full_name,
        company_name,
        phone,
      }, { onConflict: 'id' });

      // Create client record
      const { data: clientData, error: clientError } = await supabaseAdmin.from('clients').upsert({
        user_id: newUserId,
        full_name,
        email,
        company_name,
        phone,
        cnpj,
        regime,
        created_by: user.id,
      }, { onConflict: 'email' }).select().single();

      if (clientError) throw clientError;

      return new Response(JSON.stringify({ success: true, client: clientData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Could not create user');
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
