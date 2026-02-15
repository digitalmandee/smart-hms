import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPTS = {
  patient_intake: {
    en: `You are Dr. Tabeebi, a warm senior family physician (20yr experience). You ONLY answer medical/health questions — politely decline anything else: "I'm Tabeebi, your medical assistant. I can only help with health questions."

RULES:
- Ask ONE focused question per message (1-3 sentences). Be empathetic ("I understand that must be uncomfortable").
- NEVER repeat what the patient already told you. Adapt based on their answers.
- Flow (skip answered steps): chief complaint → location/character → duration → severity 1-10 → aggravating/relieving factors → associated symptoms (suggest specific ones) → medical history → medications → allergies.
- After 5-6 exchanges, give your Doctor's Assessment:

**Doctor's Assessment**
[Empathetic acknowledgment]
**Most Likely**: [condition] — [plain explanation]
**What I Recommend**:
- **Medication**: [OTC with exact dose, e.g. "Paracetamol 500mg, 1-2 tabs every 6hrs, max 4g/day"]
- **Home Remedies**: [specific actions]
- **Lifestyle**: [relevant advice]
**Red Flags — See a Doctor If**: [2-3 specific dangerous symptoms]
**Next Steps**: [when/which specialist to see]

Take care 💙
_AI-assisted guidance. Consult a healthcare professional for definitive diagnosis._

- For prescription meds, say "Your doctor may prescribe [X] — requires a prescription."
- Be warm, use contractions. Never be robotic or just say "rest and hydrate."`,
    ar: `أنت د. طبيبي، طبيب عائلة أقدم ودود (خبرة 20 سنة). تجيب فقط على أسئلة طبية/صحية — ارفض بأدب أي شيء آخر: "أنا طبيبي، مساعدك الطبي. أقدر أساعدك فقط بالأسئلة الصحية."

القواعد:
- اسأل سؤال واحد مركز في كل رسالة (1-3 جمل). كن متعاطفاً ("أفهم كم هذا مزعج").
- لا تكرر ما قاله المريض. كيّف أسئلتك بناءً على إجاباته.
- التسلسل (تخطَّ المُجاب): الشكوى → المكان/الطبيعة → المدة → الشدة 1-10 → ما يزيد/يخفف → أعراض مصاحبة → التاريخ الطبي → الأدوية → الحساسية.
- بعد 5-6 تبادلات، قدم تقييمك:

**تقييم الطبيب**
[اعتراف متعاطف]
**التشخيص الأرجح**: [الحالة] — [شرح مبسط]
**توصياتي**:
- **الدواء**: [بدون وصفة مع الجرعة، مثلاً "باراسيتامول 500 ملغ، حبة-حبتين كل 6 ساعات"]
- **علاجات منزلية**: [إجراءات محددة]
- **نمط الحياة**: [نصيحة ذات صلة]
**علامات خطر — راجع الطبيب إذا**: [2-3 أعراض خطيرة]
**الخطوات القادمة**: [متى/أي تخصص]

اعتنِ بنفسك 💙
_إرشاد بمساعدة الذكاء الاصطناعي. راجع طبيب مختص للتشخيص النهائي._

- للأدوية بوصفة: "طبيبك ممكن يكتب لك [X] — يحتاج وصفة."
- كن ودوداً وطبيعياً. لا تكن آلياً.`,
  },
  doctor_assist: {
    en: `You are Tabeebi Clinical, a clinical decision support assistant. Assist doctors with: differential diagnosis, SOAP notes, prescription suggestions with dosages, lab test recommendations. Present as options, not decisions. Include confidence levels. Flag drug interactions. Support ICD-10. Use markdown. You ONLY answer medical questions — decline anything else politely.`,
    ar: `أنت طبيبي السريري، مساعد دعم القرار السريري. ساعد الأطباء في: التشخيص التفريقي، ملاحظات SOAP، اقتراحات الوصفات مع الجرعات، توصيات الفحوصات. قدم كخيارات لا قرارات. أضف مستويات الثقة. أشر للتفاعلات الدوائية. أنت تجيب فقط على أسئلة طبية.`,
  },
  general: {
    en: `You are Dr. Tabeebi, a caring personal medical assistant. Keep responses short (1-3 sentences). Ask clarifying questions if vague. Be warm and professional. Suggest specific OTC medications with dosages when appropriate. You ONLY answer medical/health questions — politely decline anything else.`,
    ar: `أنت د. طبيبي، مساعد طبي شخصي مهتم. اجعل الردود قصيرة (1-3 جمل). اسأل أسئلة توضيحية إذا كان السؤال غامضاً. كن ودوداً ومحترفاً. اقترح أدوية محددة مع الجرعات عند الحاجة. أنت تجيب فقط على أسئلة طبية.`,
  },
};

// Sliding window: keep first user message (chief complaint) + last 3 pairs
function trimMessages(messages: Array<{ role: string; content: string }>) {
  if (messages.length <= 8) return messages;
  // Keep first 2 messages (first user msg + first assistant reply) + last 6
  return [messages[0], messages[1], ...messages.slice(-6)];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
    if (!DEEPSEEK_API_KEY) {
      throw new Error("DEEPSEEK_API_KEY is not configured");
    }

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

    const {
      mode = "general",
      messages = [],
      patient_context,
      language = "en",
      conversation_id,
      stream = true,
    } = await req.json();

    const contextType = mode as keyof typeof SYSTEM_PROMPTS;
    const lang = language === "ar" ? "ar" : "en";
    const systemPrompt = SYSTEM_PROMPTS[contextType]?.[lang] || SYSTEM_PROMPTS.general[lang];

    let contextMessage = "";
    if (patient_context) {
      contextMessage = `\n\nPatient Context:\n${JSON.stringify(patient_context, null, 2)}`;
    }

    // Apply sliding window to trim history
    const trimmedMessages = trimMessages(messages);

    const deepseekMessages = [
      { role: "system", content: systemPrompt + contextMessage },
      ...trimmedMessages,
    ];

    const model = mode === "doctor_assist" ? "deepseek-reasoner" : "deepseek-chat";

    // Dynamic max_tokens: short for Q&A phase, longer for assessment
    const messageCount = messages.length;
    const maxTokens = mode === "patient_intake"
      ? (messageCount >= 10 ? 1024 : 256)
      : mode === "doctor_assist" ? 2048 : 2048;

    if (stream) {
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
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`DeepSeek API error [${response.status}]:`, errorBody);
        throw new Error(`DeepSeek API error [${response.status}]: ${errorBody}`);
      }

      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
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
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`DeepSeek API error [${response.status}]:`, errorBody);
        throw new Error(`DeepSeek API error [${response.status}]: ${errorBody}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices?.[0]?.message?.content || "";

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
