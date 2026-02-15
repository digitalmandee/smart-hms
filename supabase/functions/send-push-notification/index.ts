import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushPayload {
  user_ids?: string[];
  organization_id?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  category?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Authentication: require JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY'); // Optional - for FCM

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: PushPayload = await req.json();
    const { user_ids, organization_id, title, body, data, category } = payload;

    console.log('Push notification request:', { user_ids, organization_id, title, category });

    // Build query for device tokens
    let query = supabase
      .from('push_device_tokens')
      .select('token, platform, user_id')
      .eq('is_active', true);

    if (user_ids && user_ids.length > 0) {
      query = query.in('user_id', user_ids);
    } else if (organization_id) {
      query = query.eq('organization_id', organization_id);
    } else {
      return new Response(
        JSON.stringify({ error: 'Must provide user_ids or organization_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: tokens, error: tokensError } = await query;

    if (tokensError) {
      console.error('Error fetching tokens:', tokensError);
      throw tokensError;
    }

    if (!tokens || tokens.length === 0) {
      console.log('No device tokens found');
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No devices registered' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${tokens.length} device tokens`);

    // Group tokens by platform
    const androidTokens = tokens.filter(t => t.platform === 'android').map(t => t.token);
    const iosTokens = tokens.filter(t => t.platform === 'ios').map(t => t.token);
    const webTokens = tokens.filter(t => t.platform === 'web').map(t => t.token);

    let successCount = 0;
    let failedTokens: string[] = [];

    // Send to FCM (Android & Web)
    if (fcmServerKey && (androidTokens.length > 0 || webTokens.length > 0)) {
      const fcmTokens = [...androidTokens, ...webTokens];
      
      try {
        const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${fcmServerKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            registration_ids: fcmTokens,
            notification: {
              title,
              body,
              icon: '/favicon.png',
              click_action: data?.route || '/'
            },
            data: {
              ...data,
              category
            },
            priority: 'high'
          })
        });

        const fcmResult = await fcmResponse.json();
        console.log('FCM response:', fcmResult);
        
        successCount += fcmResult.success || 0;
        
        // Track failed tokens for cleanup
        if (fcmResult.results) {
          fcmResult.results.forEach((result: any, index: number) => {
            if (result.error === 'NotRegistered' || result.error === 'InvalidRegistration') {
              failedTokens.push(fcmTokens[index]);
            }
          });
        }
      } catch (fcmError) {
        console.error('FCM send error:', fcmError);
      }
    }

    // For iOS (APNs) - would need APNs credentials
    // This is a placeholder - in production, use APNs or a service like Firebase
    if (iosTokens.length > 0) {
      console.log(`iOS tokens: ${iosTokens.length} (APNs not configured - using FCM if available)`);
      // iOS tokens sent via FCM will work if the app is configured with both
    }

    // Deactivate failed tokens
    if (failedTokens.length > 0) {
      console.log(`Deactivating ${failedTokens.length} invalid tokens`);
      await supabase
        .from('push_device_tokens')
        .update({ is_active: false })
        .in('token', failedTokens);
    }

    // Log notification for analytics
    const uniqueUserIds = [...new Set(tokens.map(t => t.user_id))];
    
    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        total_devices: tokens.length,
        users_notified: uniqueUserIds.length,
        failed_tokens: failedTokens.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Push notification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
