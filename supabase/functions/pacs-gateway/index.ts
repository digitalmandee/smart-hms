import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * PACS Gateway Edge Function
 * 
 * This edge function serves as a gateway to integrate with external PACS (Picture Archiving 
 * and Communication System) servers using the DICOMweb protocol.
 * 
 * Configuration is read from organization_settings table in the database.
 * Falls back to environment variables for backward compatibility.
 */

interface PACSConfig {
  serverUrl: string;
  username?: string;
  password?: string;
  aeTitle: string;
}

async function getPACSConfigFromDB(supabase: any, organizationId: string): Promise<PACSConfig | null> {
  const { data, error } = await supabase
    .from('organization_settings')
    .select('setting_key, setting_value')
    .eq('organization_id', organizationId)
    .in('setting_key', ['pacs_server_url', 'pacs_username', 'pacs_password', 'pacs_ae_title']);
  
  if (error || !data || data.length === 0) {
    return null;
  }
  
  const settings: Record<string, string> = {};
  data.forEach((row: { setting_key: string; setting_value: string }) => {
    settings[row.setting_key] = row.setting_value;
  });
  
  if (!settings.pacs_server_url) {
    return null;
  }
  
  return {
    serverUrl: settings.pacs_server_url.replace(/\/$/, ''),
    username: settings.pacs_username || undefined,
    password: settings.pacs_password || undefined,
    aeTitle: settings.pacs_ae_title || 'LOVABLE_HMS',
  };
}

function getPACSConfigFromEnv(): PACSConfig | null {
  const serverUrl = Deno.env.get("PACS_SERVER_URL");
  
  if (!serverUrl) {
    return null;
  }
  
  return {
    serverUrl: serverUrl.replace(/\/$/, ""),
    username: Deno.env.get("PACS_USERNAME"),
    password: Deno.env.get("PACS_PASSWORD"),
    aeTitle: Deno.env.get("PACS_AE_TITLE") || "LOVABLE_HMS",
  };
}

function getAuthHeaders(config: PACSConfig): HeadersInit {
  const headers: HeadersInit = {
    "Accept": "application/dicom+json",
  };
  
  if (config.username && config.password) {
    const credentials = btoa(`${config.username}:${config.password}`);
    headers["Authorization"] = `Basic ${credentials}`;
  }
  
  return headers;
}

async function queryStudies(config: PACSConfig, patientId?: string, studyDate?: string): Promise<Response> {
  const params = new URLSearchParams();
  
  if (patientId) {
    params.append("PatientID", patientId);
  }
  if (studyDate) {
    params.append("StudyDate", studyDate);
  }
  
  params.append("includefield", "StudyInstanceUID");
  params.append("includefield", "PatientName");
  params.append("includefield", "PatientID");
  params.append("includefield", "StudyDate");
  params.append("includefield", "StudyTime");
  params.append("includefield", "StudyDescription");
  params.append("includefield", "AccessionNumber");
  params.append("includefield", "ModalitiesInStudy");
  params.append("includefield", "NumberOfStudyRelatedSeries");
  params.append("includefield", "NumberOfStudyRelatedInstances");
  
  const url = `${config.serverUrl}/dicom-web/studies?${params.toString()}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(config),
  });
  
  if (!response.ok) {
    throw new Error(`PACS query failed: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  const studies = data.map((study: any) => ({
    studyInstanceUID: study["0020000D"]?.Value?.[0] || "",
    patientName: study["00100010"]?.Value?.[0]?.Alphabetic || "",
    patientId: study["00100020"]?.Value?.[0] || "",
    studyDate: study["00080020"]?.Value?.[0] || "",
    studyTime: study["00080030"]?.Value?.[0] || "",
    studyDescription: study["00081030"]?.Value?.[0] || "",
    accessionNumber: study["00080050"]?.Value?.[0] || "",
    modalities: study["00080061"]?.Value || [],
    seriesCount: study["00201206"]?.Value?.[0] || 0,
    instanceCount: study["00201208"]?.Value?.[0] || 0,
  }));
  
  return new Response(JSON.stringify({ studies }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getStudySeries(config: PACSConfig, studyUid: string): Promise<Response> {
  const url = `${config.serverUrl}/dicom-web/studies/${studyUid}/series`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(config),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get series: ${response.status}`);
  }
  
  const data = await response.json();
  
  const series = data.map((s: any) => ({
    seriesInstanceUID: s["0020000E"]?.Value?.[0] || "",
    seriesNumber: s["00200011"]?.Value?.[0] || 0,
    seriesDescription: s["0008103E"]?.Value?.[0] || "",
    modality: s["00080060"]?.Value?.[0] || "",
    instanceCount: s["00201209"]?.Value?.[0] || 0,
  }));
  
  return new Response(JSON.stringify({ series }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getSeriesInstances(config: PACSConfig, studyUid: string, seriesUid: string): Promise<Response> {
  const url = `${config.serverUrl}/dicom-web/studies/${studyUid}/series/${seriesUid}/instances`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(config),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get instances: ${response.status}`);
  }
  
  const data = await response.json();
  
  const instances = data.map((i: any) => ({
    sopInstanceUID: i["00080018"]?.Value?.[0] || "",
    instanceNumber: i["00200013"]?.Value?.[0] || 0,
    sopClassUID: i["00080016"]?.Value?.[0] || "",
  }));
  
  return new Response(JSON.stringify({ instances }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getRenderedImage(
  config: PACSConfig, 
  studyUid: string, 
  seriesUid: string, 
  instanceUid: string,
  frame?: number
): Promise<Response> {
  let url = `${config.serverUrl}/dicom-web/studies/${studyUid}/series/${seriesUid}/instances/${instanceUid}/rendered`;
  
  if (frame) {
    url += `/frames/${frame}`;
  }
  
  const headers: Record<string, string> = {
    ...getAuthHeaders(config) as Record<string, string>,
    "Accept": "image/jpeg",
  };
  
  const response = await fetch(url, {
    method: "GET",
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get rendered image: ${response.status}`);
  }
  
  const imageBuffer = await response.arrayBuffer();
  
  return new Response(imageBuffer, {
    headers: {
      ...corsHeaders,
      "Content-Type": "image/jpeg",
    },
  });
}

async function getThumbnail(config: PACSConfig, studyUid: string, seriesUid: string): Promise<Response> {
  const url = `${config.serverUrl}/dicom-web/studies/${studyUid}/series/${seriesUid}/thumbnail`;
  
  const headers: Record<string, string> = {
    ...getAuthHeaders(config) as Record<string, string>,
    "Accept": "image/jpeg",
  };
  
  const response = await fetch(url, {
    method: "GET",
    headers,
  });
  
  if (!response.ok) {
    const instancesUrl = `${config.serverUrl}/dicom-web/studies/${studyUid}/series/${seriesUid}/instances`;
    const instancesRes = await fetch(instancesUrl, { headers: getAuthHeaders(config) });
    
    if (instancesRes.ok) {
      const instances = await instancesRes.json();
      if (instances.length > 0) {
        const firstInstanceUid = instances[0]["00080018"]?.Value?.[0];
        if (firstInstanceUid) {
          return getRenderedImage(config, studyUid, seriesUid, firstInstanceUid);
        }
      }
    }
    
    throw new Error(`Failed to get thumbnail: ${response.status}`);
  }
  
  const imageBuffer = await response.arrayBuffer();
  
  return new Response(imageBuffer, {
    headers: {
      ...corsHeaders,
      "Content-Type": "image/jpeg",
    },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const url = new URL(req.url);
    const path = url.pathname.replace("/pacs-gateway", "");
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Authentication: require JWT for all endpoints
    let organizationId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const authClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .single();
    
    organizationId = profile?.organization_id || null;
    
    // Try to get config from database first, then fall back to env vars
    let config: PACSConfig | null = null;
    
    if (organizationId) {
      config = await getPACSConfigFromDB(supabase, organizationId);
      console.log("PACS config from DB:", config ? "found" : "not found");
    }
    
    if (!config) {
      config = getPACSConfigFromEnv();
      console.log("PACS config from env:", config ? "found" : "not found");
    }
    
    // Health check endpoints
    if (path === "/health" || path === "/") {
      if (!config) {
        return new Response(
          JSON.stringify({
            status: "not_configured",
            configured: false,
            message: "PACS server has not been configured. Please configure it in the PACS Settings page.",
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      try {
        const testUrl = `${config.serverUrl}/dicom-web/studies?limit=1`;
        console.log("Testing PACS connection:", testUrl);
        
        const response = await fetch(testUrl, {
          method: "GET",
          headers: getAuthHeaders(config),
        });
        
        console.log("PACS response status:", response.status);
        
        return new Response(
          JSON.stringify({
            status: response.ok ? "connected" : "error",
            pacsServer: config.serverUrl,
            aeTitle: config.aeTitle,
            configured: true,
            message: response.ok ? "Connected to PACS server" : `PACS returned status ${response.status}`,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Connection failed';
        console.error("PACS connection error:", errorMessage);
        
        return new Response(
          JSON.stringify({
            status: "error",
            message: errorMessage,
            pacsServer: config.serverUrl,
            aeTitle: config.aeTitle,
            configured: true,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }
    
    // For non-health endpoints, return 503 if not configured
    if (!config) {
      return new Response(
        JSON.stringify({
          error: "PACS not configured",
          message: "The PACS server has not been configured.",
          configured: false,
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // GET /studies - Query studies
    if (path === "/studies" && req.method === "GET") {
      const patientId = url.searchParams.get("patientId") || undefined;
      const studyDate = url.searchParams.get("studyDate") || undefined;
      return await queryStudies(config, patientId, studyDate);
    }
    
    // GET /studies/:studyUid/series
    const seriesMatch = path.match(/^\/studies\/([^/]+)\/series$/);
    if (seriesMatch && req.method === "GET") {
      return await getStudySeries(config, seriesMatch[1]);
    }
    
    // GET /studies/:studyUid/series/:seriesUid/instances
    const instancesMatch = path.match(/^\/studies\/([^/]+)\/series\/([^/]+)\/instances$/);
    if (instancesMatch && req.method === "GET") {
      return await getSeriesInstances(config, instancesMatch[1], instancesMatch[2]);
    }
    
    // GET /studies/:studyUid/series/:seriesUid/thumbnail
    const thumbnailMatch = path.match(/^\/studies\/([^/]+)\/series\/([^/]+)\/thumbnail$/);
    if (thumbnailMatch && req.method === "GET") {
      return await getThumbnail(config, thumbnailMatch[1], thumbnailMatch[2]);
    }
    
    // GET /studies/:studyUid/series/:seriesUid/instances/:instanceUid/rendered
    const renderedMatch = path.match(/^\/studies\/([^/]+)\/series\/([^/]+)\/instances\/([^/]+)\/rendered$/);
    if (renderedMatch && req.method === "GET") {
      const frame = url.searchParams.get("frame");
      return await getRenderedImage(
        config, 
        renderedMatch[1], 
        renderedMatch[2], 
        renderedMatch[3],
        frame ? parseInt(frame) : undefined
      );
    }
    
    return new Response(
      JSON.stringify({ error: "Not found", path }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
    
  } catch (err) {
    console.error("PACS Gateway error:", err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({
        error: "PACS Gateway Error",
        message: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
