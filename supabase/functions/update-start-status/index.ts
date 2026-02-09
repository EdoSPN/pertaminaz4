import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting update-start-status job...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    console.log('Checking for Start statuses older than:', oneDayAgo);

    // Update IFR: Start -> In-Progress where actual_start_ifr is > 1 day old
    const { data: ifrData, error: ifrError } = await supabase
      .from('prabumulih_monitoring_data')
      .update({ status_description_ifr: 'In-Progress' })
      .eq('status_description_ifr', 'Start')
      .lt('actual_start_ifr', oneDayAgo)
      .select('id');

    if (ifrError) {
      console.error('IFR update error:', ifrError);
    } else {
      console.log(`IFR: Updated ${ifrData?.length || 0} records`);
    }

    // Update IFA: Start -> In-Progress where actual_start_ifa is > 1 day old
    const { data: ifaData, error: ifaError } = await supabase
      .from('prabumulih_monitoring_data')
      .update({ status_description_ifa: 'In-Progress' })
      .eq('status_description_ifa', 'Start')
      .lt('actual_start_ifa', oneDayAgo)
      .select('id');

    if (ifaError) {
      console.error('IFA update error:', ifaError);
    } else {
      console.log(`IFA: Updated ${ifaData?.length || 0} records`);
    }

    // Update IFB: Start -> In-Progress where actual_start_ifb is > 1 day old
    const { data: ifbData, error: ifbError } = await supabase
      .from('prabumulih_monitoring_data')
      .update({ status_description_ifb: 'In-Progress' })
      .eq('status_description_ifb', 'Start')
      .lt('actual_start_ifb', oneDayAgo)
      .select('id');

    if (ifbError) {
      console.error('IFB update error:', ifbError);
    } else {
      console.log(`IFB: Updated ${ifbData?.length || 0} records`);
    }

    const totalUpdated = (ifrData?.length || 0) + (ifaData?.length || 0) + (ifbData?.length || 0);
    console.log(`Total records updated: ${totalUpdated}`);

    return new Response(
      JSON.stringify({ message: 'Status updates complete', totalUpdated }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in update-start-status:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
