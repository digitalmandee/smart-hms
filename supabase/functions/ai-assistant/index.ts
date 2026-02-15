import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

const MEDICAL_GUARDRAIL_EN = `\n\nIMPORTANT: You are STRICTLY a medical assistant. You MUST ONLY answer questions related to health, medicine, symptoms, treatments, medications, medical procedures, or hospital operations. If the user asks about anything unrelated (politics, entertainment, coding, weather, sports, cooking, finance, etc.), politely decline by saying: "I'm Tabeebi, your medical assistant. I can only help with health and medical questions. Please tell me about any health concerns you have." Never break this rule under any circumstances.`;

const MEDICAL_GUARDRAIL_AR = `\n\nمهم جداً: أنت مساعد طبي فقط. يجب أن تجيب فقط على الأسئلة المتعلقة بالصحة والطب والأعراض والعلاجات والأدوية والإجراءات الطبية. إذا سأل المستخدم عن أي شيء غير طبي، ارفض بأدب وقل: "أنا طبيبي، مساعدك الطبي. يمكنني فقط المساعدة في الأسئلة الصحية والطبية. أخبرني عن أي مخاوف صحية لديك."`;

const SYSTEM_PROMPTS = {
  patient_intake: {
    en: `You are Tabeebi, a warm and empathetic personal medical intake assistant. You speak as a caring doctor would — professional yet approachable. Guide the patient through describing their health concerns. Ask one focused question at a time.
Collect: chief complaint, symptom duration, severity (1-10), associated symptoms, medical history, current medications, allergies.
Be empathetic and clear. Do NOT diagnose. Summarize findings for the doctor when the patient indicates they are done.
When you have collected enough information, provide a structured summary in this format:
**Pre-Visit Summary**
- Chief Complaint: ...
- Duration: ...
- Severity: .../10
- Associated Symptoms: ...
- Medical History: ...
- Current Medications: ...
- Allergies: ...${MEDICAL_GUARDRAIL_EN}`,
    ar: `أنت طبيبي، مساعد استقبال طبي شخصي ودود ومتعاطف. تتحدث كطبيب يهتم بمرضاه — محترف ولكن ودود. قم بتوجيه المريض لوصف مخاوفه الصحية. اسأل سؤالاً واحداً مركزاً في كل مرة.
اجمع: الشكوى الرئيسية، مدة الأعراض، شدتها (1-10)، الأعراض المصاحبة، التاريخ الطبي، الأدوية الحالية، الحساسية.
كن متعاطفاً وواضحاً. لا تقم بالتشخيص. لخص النتائج للطبيب عندما يشير المريض إلى انتهائه.${MEDICAL_GUARDRAIL_AR}`,
  },
  doctor_assist: {
    en: `You are Tabeebi Clinical, a clinical decision support assistant. You assist doctors with:
1. Differential diagnosis suggestions based on symptoms and vitals
2. SOAP note generation from clinical encounter data
3. Prescription suggestions with dosage guidelines
4. Lab test recommendations

Always present suggestions as options, never as definitive decisions.
Include confidence levels. Flag drug interactions and contraindications.
Support ICD-10 coding. Format responses with clear sections using markdown.${MEDICAL_GUARDRAIL_EN}`,
    ar: `أنت طبيبي السريري، مساعد دعم القرار السريري. تساعد الأطباء في:
1. اقتراحات التشخيص التفريقي بناءً على الأعراض والعلامات الحيوية
2. إنشاء ملاحظات SOAP من بيانات اللقاء السريري
3. اقتراحات الوصفات الطبية مع إرشادات الجرعات
4. توصيات الفحوصات المخبرية

قدم الاقتراحات دائماً كخيارات، وليس كقرارات نهائية.
أضف مستويات الثقة. أشر إلى التفاعلات الدوائية وموانع الاستعمال.${MEDICAL_GUARDRAIL_AR}`,
  },
  general: {
    en: `You are Tabeebi, a helpful and professional personal medical assistant for a hospital management system. Answer questions about medical topics, hospital procedures, and general health information. Be warm, professional, accurate, and concise. Address the user as if you are their personal doctor.${MEDICAL_GUARDRAIL_EN}`,
    ar: `أنت طبيبي، مساعد طبي شخصي مفيد ومحترف لنظام إدارة مستشفى. أجب عن أسئلة حول المواضيع الطبية وإجراءات المستشفى والمعلومات الصحية العامة. كن ودوداً ومحترفاً ودقيقاً وموجزاً.${MEDICAL_GUARDRAIL_AR}`,
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
    if (!DEEPSEEK_API_KEY) {
      throw new Error("DEEPSEEK_API_KEY is not configured");
    }

    // Auth validation
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    const {
      mode = "general",
      messages = [],
      patient_context,
      language = "en",
      conversation_id,
      stream = true,
    } = await req.json();

    // Select system prompt
    const contextType = mode as keyof typeof SYSTEM_PROMPTS;
    const lang = language === "ar" ? "ar" : "en";
    const systemPrompt = SYSTEM_PROMPTS[contextType]?.[lang] || SYSTEM_PROMPTS.general[lang];

    // Build messages array for DeepSeek
    let contextMessage = "";
    if (patient_context) {
      contextMessage = `\n\nPatient Context:\n${JSON.stringify(patient_context, null, 2)}`;
    }

    const deepseekMessages = [
      { role: "system", content: systemPrompt + contextMessage },
      ...messages,
    ];

    // Choose model based on mode
    const model = mode === "doctor_assist" ? "deepseek-reasoner" : "deepseek-chat";

    if (stream) {
      // Streaming SSE response
      const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: deepseekMessages,
          stream: true,
          temperature: mode === "doctor_assist" ? 0.3 : 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`DeepSeek API error [${response.status}]:`, errorBody);
        throw new Error(`DeepSeek API error [${response.status}]: ${errorBody}`);
      }

      // Forward the SSE stream
      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
      // Non-streaming response
      const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: deepseekMessages,
          stream: false,
          temperature: mode === "doctor_assist" ? 0.3 : 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`DeepSeek API error [${response.status}]:`, errorBody);
        throw new Error(`DeepSeek API error [${response.status}]: ${errorBody}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices?.[0]?.message?.content || "";

      // Save conversation if conversation_id provided
      if (conversation_id) {
        const allMessages = [...messages, { role: "assistant", content: assistantMessage }];
        await supabase
          .from("ai_conversations")
          .update({ messages: allMessages, updated_at: new Date().toISOString() })
          .eq("id", conversation_id);
      }

      return new Response(
        JSON.stringify({
          message: assistantMessage,
          model,
          conversation_id,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("AI Assistant error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
