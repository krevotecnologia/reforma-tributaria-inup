import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    // Create admin user
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: 'renan@inupcontabil.com.br',
      password: 'Inup123',
      email_confirm: true,
    });

    if (userError && !userError.message.includes('already been registered')) {
      throw userError;
    }

    const userId = userData?.user?.id;

    if (userId) {
      // Insert admin role
      await supabaseAdmin.from('user_roles').upsert({
        user_id: userId,
        role: 'admin',
      }, { onConflict: 'user_id,role' });

      // Insert profile
      await supabaseAdmin.from('profiles').upsert({
        id: userId,
        full_name: 'Renan Inup',
      }, { onConflict: 'id' });
    }

    // Also ensure hugo@inupcontabil.com.br has client role
    const { data: hugoData } = await supabaseAdmin.auth.admin.createUser({
      email: 'hugo@inupcontabil.com.br',
      password: 'Inup123',
      email_confirm: true,
    });

    const hugoId = hugoData?.user?.id;
    if (hugoId) {
      await supabaseAdmin.from('user_roles').upsert({
        user_id: hugoId,
        role: 'client',
      }, { onConflict: 'user_id,role' });

      await supabaseAdmin.from('profiles').upsert({
        id: hugoId,
        full_name: 'Hugo',
      }, { onConflict: 'id' });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
