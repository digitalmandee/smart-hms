import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
 * Supported operations:
 * - GET /studies?patientId=xxx - Query studies by patient MRN (QIDO-RS)
 * - GET /studies/:studyUid/series - Get series for a study
 * - GET /studies/:studyUid/series/:seriesUid/instances - Get instances
 * - GET /instances/:sopInstanceUid/rendered - Get rendered image (WADO-RS)
 * - POST /studies - Store DICOM study (STOW-RS)
 * 
 * Required environment variables:
 * - PACS_SERVER_URL: Base URL of the PACS server (e.g., http://orthanc:8042)
 * - PACS_USERNAME: Username for PACS authentication (optional)
 * - PACS_PASSWORD: Password for PACS authentication (optional)
 * - PACS_AE_TITLE: Application Entity Title (optional, default: LOVABLE_HMS)
 */

interface PACSConfig {
  serverUrl: string;
  username?: string;
  password?: string;
  aeTitle: string;
}

function getPACSConfig(): PACSConfig {
  const serverUrl = Deno.env.get("PACS_SERVER_URL");
  
  if (!serverUrl) {
    throw new Error("PACS_SERVER_URL environment variable is not configured");
  }
  
  return {
    serverUrl: serverUrl.replace(/\/$/, ""), // Remove trailing slash
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
  
  // Include common fields in response
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
  
  // Transform DICOM JSON to simpler format
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
    // Fallback: try to get first instance
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
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const url = new URL(req.url);
    const path = url.pathname.replace("/pacs-gateway", "");
    
    // Check if PACS is configured
    const pacsUrl = Deno.env.get("PACS_SERVER_URL");
    if (!pacsUrl) {
      return new Response(
        JSON.stringify({
          error: "PACS not configured",
          message: "The PACS server URL has not been configured. Please set the PACS_SERVER_URL environment variable.",
          configured: false,
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    const config = getPACSConfig();
    
    // Route handlers
    if (path === "/health" || path === "/") {
      // Health check - test PACS connectivity
      try {
        const testUrl = `${config.serverUrl}/dicom-web/studies?limit=1`;
        const response = await fetch(testUrl, {
          method: "GET",
          headers: getAuthHeaders(config),
        });
        
        return new Response(
          JSON.stringify({
            status: response.ok ? "connected" : "error",
            pacsServer: config.serverUrl,
            aeTitle: config.aeTitle,
            configured: true,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Connection failed';
        return new Response(
          JSON.stringify({
            status: "error",
            message: errorMessage,
            pacsServer: config.serverUrl,
            configured: true,
          }),
          {
            status: 503,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
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
