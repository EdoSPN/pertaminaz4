import { corsHeaders } from '@supabase/supabase-js/cors';
import { createClient } from '@supabase/supabase-js';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { filePath, bucketName } = await req.json();

    if (!filePath || !bucketName) {
      return new Response(
        JSON.stringify({ error: 'filePath and bucketName are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Download the file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    if (downloadError || !fileData) {
      return new Response(
        JSON.stringify({ error: 'Failed to download file', details: downloadError?.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For now, since LibreOffice is not available in edge functions,
    // we'll use a Google Docs Viewer approach by returning a viewer URL.
    // In production, you'd use a document conversion service or LibreOffice in a container.
    
    // Alternative: Use the file as-is and let the client handle it
    // For Office docs, we return a flag indicating it needs external preview
    const ext = filePath.split('.').pop()?.toLowerCase();
    const isOfficeDoc = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext || '');

    if (isOfficeDoc) {
      // Create a signed URL for the file - client will use Office Online viewer
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 3600);

      if (signedUrlError || !signedUrlData?.signedUrl) {
        return new Response(
          JSON.stringify({ error: 'Failed to create signed URL' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          useExternalViewer: true,
          viewerUrl: `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(signedUrlData.signedUrl)}`,
          signedUrl: signedUrlData.signedUrl,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unsupported file type for conversion' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
