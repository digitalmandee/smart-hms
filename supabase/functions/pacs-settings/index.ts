import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

interface PACSSettings {
  pacs_server_url?: string;
  pacs_username?: string;
  pacs_password?: string;
  pacs_ae_title?: string;
}

interface RequestBody {
  action: 'save' | 'test' | 'get';
  organization_id?: string;
  settings?: PACSSettings;
}

async function testPACSConnection(settings: PACSSettings): Promise<{ success: boolean; message: string }> {
  const serverUrl = settings.pacs_server_url?.replace(/\/$/, '');
  
  if (!serverUrl) {
    return { success: false, message: 'Server URL is required' };
  }
  
  try {
    const testUrl = `${serverUrl}/dicom-web/studies?limit=1`;
    console.log('Testing PACS connection:', testUrl);
    
    const headers: Record<string, string> = {
      'Accept': 'application/dicom+json',
    };
    
    if (settings.pacs_username && settings.pacs_password) {
      const credentials = btoa(`${settings.pacs_username}:${settings.pacs_password}`);
      headers['Authorization'] = `Basic ${credentials}`;
    }
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers,
    });
    
    console.log('PACS test response status:', response.status);
    
    if (response.ok) {
      return { success: true, message: 'Successfully connected to PACS server' };
    } else if (response.status === 401) {
      return { success: false, message: 'Authentication failed. Please check username and password.' };
    } else if (response.status === 404) {
      return { success: false, message: 'DICOMweb endpoint not found. Please verify the server URL.' };
    } else {
      return { success: false, message: `PACS server returned status ${response.status}` };
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Connection failed';
    console.error('PACS connection test error:', errorMessage);
    return { success: false, message: `Connection failed: ${errorMessage}` };
  }
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the authorization header to verify the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify the JWT and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const body: RequestBody = await req.json();
    const { action, organization_id, settings } = body;
    
    console.log('PACS settings action:', action);
    
    // Handle test action - doesn't require org ID, just tests the connection
    if (action === 'test') {
      if (!settings?.pacs_server_url) {
        return new Response(
          JSON.stringify({ success: false, message: 'Server URL is required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const result = await testPACSConnection(settings);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // For save action, we need organization_id
    if (action === 'save') {
      if (!organization_id) {
        return new Response(
          JSON.stringify({ error: 'Organization ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Verify user belongs to this organization
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();
      
      if (profileError || profile?.organization_id !== organization_id) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized for this organization' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (!settings) {
        return new Response(
          JSON.stringify({ error: 'Settings are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Save each setting
      const settingsToSave = Object.entries(settings).filter(([_, value]) => value !== undefined);
      
      for (const [key, value] of settingsToSave) {
        const { error: upsertError } = await supabase
          .from('organization_settings')
          .upsert({
            organization_id,
            setting_key: key,
            setting_value: value || '',
          }, {
            onConflict: 'organization_id,setting_key',
          });
        
        if (upsertError) {
          console.error(`Error saving setting ${key}:`, upsertError);
          throw upsertError;
        }
      }
      
      console.log('PACS settings saved successfully');
      
      return new Response(
        JSON.stringify({ success: true, message: 'Settings saved successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Handle get action
    if (action === 'get') {
      if (!organization_id) {
        return new Response(
          JSON.stringify({ error: 'Organization ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const { data, error } = await supabase
        .from('organization_settings')
        .select('setting_key, setting_value')
        .eq('organization_id', organization_id)
        .in('setting_key', ['pacs_server_url', 'pacs_username', 'pacs_password', 'pacs_ae_title']);
      
      if (error) throw error;
      
      const settingsMap: Record<string, string> = {};
      data?.forEach((row) => {
        // Don't return the password to the client
        if (row.setting_key !== 'pacs_password') {
          settingsMap[row.setting_key] = row.setting_value;
        } else {
          // Return masked password indicator
          settingsMap[row.setting_key] = row.setting_value ? '********' : '';
        }
      });
      
      return new Response(
        JSON.stringify({ settings: settingsMap }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (err) {
    console.error('PACS settings error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ error: 'Server error', message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
