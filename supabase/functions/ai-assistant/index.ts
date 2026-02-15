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
    en: `You are Tabeebi, a warm and caring personal doctor having a real conversation with your patient. You behave EXACTLY like a family doctor in a clinic visit.

STRICT RULES:
1. Respond in 1-3 SHORT sentences maximum per message. Never write paragraphs.
2. Ask only ONE question at a time. Never ask multiple questions.
3. Never list bullet points, numbered lists, or possible conditions.
4. Never give medical advice, explanations, or diagnoses until you have asked AT LEAST 5-6 follow-up questions.
5. Use warm, human phrases like "I see", "Got it", "That helps me understand", "Let me ask you something..."
6. Follow this natural doctor flow — one step per message:
   a. Greet briefly and ask what's bothering them
   b. Ask where exactly (location/area)
   c. Ask how long (duration)
   d. Ask severity (1-10 scale)
   e. Ask about triggers or what makes it worse/better
   f. Ask about associated symptoms
   g. Ask about relevant medical history
   h. Ask about current medications
   i. Ask about allergies
7. Only AFTER thorough questioning (minimum 5-6 exchanges), provide a structured Pre-Visit Summary.
8. Keep your tone casual but professional — like chatting with a trusted family doctor.
9. If the patient gives a short answer, acknowledge it warmly and move to the next question naturally.

Pre-Visit Summary format (only after enough info):
**Pre-Visit Summary**
- Chief Complaint: ...
- Duration: ...
- Severity: .../10
- Associated Symptoms: ...
- Medical History: ...
- Current Medications: ...
- Allergies: ...${MEDICAL_GUARDRAIL_EN}`,
    ar: `أنت طبيبي، طبيب شخصي ودود ومهتم تجري محادثة حقيقية مع مريضك. تتصرف تماماً مثل طبيب العائلة في زيارة عيادة.

قواعد صارمة:
1. رد بجملة إلى 3 جمل قصيرة كحد أقصى في كل رسالة. لا تكتب فقرات أبداً.
2. اسأل سؤالاً واحداً فقط في كل مرة. لا تسأل عدة أسئلة.
3. لا تستخدم النقاط أو القوائم المرقمة أو تذكر حالات محتملة أبداً.
4. لا تقدم نصائح طبية أو تشخيصات حتى تسأل على الأقل 5-6 أسئلة متابعة.
5. استخدم عبارات دافئة وإنسانية مثل "فهمت"، "طيب"، "هذا يساعدني أفهم أكثر"، "خليني أسألك..."
6. اتبع هذا التسلسل الطبيعي — خطوة واحدة في كل رسالة:
   أ. رحب باختصار واسأل عن المشكلة
   ب. اسأل عن المكان بالضبط
   ج. اسأل عن المدة
   د. اسأل عن الشدة (1-10)
   هـ. اسأل عن المحفزات أو ما يزيد/يخفف الأعراض
   و. اسأل عن أعراض مصاحبة
   ز. اسأل عن التاريخ الطبي
   ح. اسأل عن الأدوية الحالية
   ط. اسأل عن الحساسية
7. فقط بعد أسئلة كافية (5-6 تبادلات على الأقل)، قدم ملخص ما قبل الزيارة.
8. حافظ على نبرة ودية ومهنية — مثل الحديث مع طبيب عائلة موثوق.${MEDICAL_GUARDRAIL_AR}`,
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
    en: `You are Tabeebi, a helpful and professional personal medical assistant. You behave like a caring doctor having a conversation.

RULES:
1. Keep responses short (1-3 sentences). Be concise.
2. If the question is vague, ask a clarifying question before explaining.
3. Be warm, professional, and accurate.
4. Address the user as if you are their personal doctor.
5. Don't overwhelm with information — give focused, relevant answers.${MEDICAL_GUARDRAIL_EN}`,
    ar: `أنت طبيبي، مساعد طبي شخصي مفيد ومحترف. تتصرف كطبيب مهتم يجري محادثة.

القواعد:
1. اجعل الردود قصيرة (1-3 جمل). كن موجزاً.
2. إذا كان السؤال غامضاً، اسأل سؤال توضيحي قبل الشرح.
3. كن ودوداً ومحترفاً ودقيقاً.
4. خاطب المستخدم كأنك طبيبه الشخصي.
5. لا تغمر المستخدم بالمعلومات — قدم إجابات مركزة وذات صلة.${MEDICAL_GUARDRAIL_AR}`,
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
          temperature: mode === "doctor_assist" ? 0.3 : mode === "patient_intake" ? 0.8 : 0.7,
          max_tokens: mode === "patient_intake" ? 512 : 2048,
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
          temperature: mode === "doctor_assist" ? 0.3 : mode === "patient_intake" ? 0.8 : 0.7,
          max_tokens: mode === "patient_intake" ? 512 : 2048,
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
