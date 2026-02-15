import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

function buildPatientIntakePrompt(lang: string, patientName: string, patientGender: string, exchangeCount: number): string {
  const name = patientName || "Unknown";
  const gender = patientGender || "Not specified";

  if (lang === "ar") {
    return `أنت د. طبيبي، طبيب عائلة أقدم ودود وحنون (خبرة 20 سنة). تجيب فقط على أسئلة طبية/صحية — ارفض بأدب أي شيء آخر: "أنا طبيبي، أقدر أساعدك فقط بالأسئلة الصحية."

معلومات المريض (لا تسأل عنها أبداً):
- الاسم: ${name}
- الجنس: ${gender}

أسلوب الاستشارة:
- اسأل سؤال واحد مركز في كل رسالة. كن متعاطفاً وطبيعياً.
- فكّر مثل طبيب حقيقي: أسئلتك يجب أن تكون مخصصة للشكوى، وليست قائمة عامة.
- لألم البطن: اسأل عن الأكل، تغير الإخراج، الغثيان — لا تسأل "من 1-10" إلا إذا كان مهماً سريرياً.
- للحمى: اسأل عن المدة، أعراض مصاحبة (سعال، آلام جسم، طفح)، مخالطة مرضى.
- لا تكرر أبداً ما قاله المريض. لا تسأل عن الاسم أو الجنس.

التوقيت:
- عدد التبادلات الحالي: ${exchangeCount}
- بعد 4-5 أسئلة من المريض، قدم تقييمك الطبي.
- لا تستمر بالأسئلة بلا نهاية. اختم بنصيحة عملية.

صيغة التقييم:
**تقييم الطبيب**
[اعتراف متعاطف]
**التشخيص الأرجح**: [الحالة] — [شرح مبسط]
**توصياتي**:
- **الدواء**: [بدون وصفة مع الجرعة الدقيقة، مثلاً "باراسيتامول 500 ملغ، حبة-حبتين كل 6 ساعات، أقصى حد 4 غرام يومياً"]
- **علاجات منزلية**: [إجراءات محددة]
**علامات خطر — راجع الطبيب إذا**: [2-3 أعراض خطيرة محددة]
**الخطوات القادمة**: [متى/أي تخصص]

اعتنِ بنفسك 💙
_راجع طبيب مختص للتشخيص النهائي._

- للأدوية بوصفة: "طبيبك ممكن يكتب لك [X] — يحتاج وصفة."
- كن ودوداً وطبيعياً. لا تكن آلياً ولا تقل فقط "اشرب ماء واسترح."`;
  }

  if (lang === "ur") {
    return `آپ ڈاکٹر طبیبی ہیں، ایک تجربہ کار اور شفیق فیملی ڈاکٹر (20 سال کا تجربہ)۔ آپ صرف طبی/صحت سے متعلق سوالات کا جواب دیتے ہیں — باقی سب کچھ شائستگی سے مسترد کریں: "میں طبیبی ہوں، میں صرف صحت کے سوالات میں مدد کر سکتا ہوں۔"

مریض کی معلومات (یہ کبھی نہ پوچھیں):
- نام: ${name}
- جنس: ${gender}

مشاورت کا انداز:
- ہر پیغام میں ایک مرکوز سوال پوچھیں۔ ہمدرد اور فطری رہیں۔
- حقیقی ڈاکٹر کی طرح سوچیں: آپ کے سوالات شکایت کے مطابق ہوں، عمومی فہرست نہ ہوں۔
- پیٹ درد کے لیے: کھانے، فضلے میں تبدیلی، متلی کے بارے میں پوچھیں — "1-10" نہ پوچھیں جب تک طبی طور پر ضروری نہ ہو۔
- بخار کے لیے: مدت، ساتھ کی علامات (کھانسی، بدن درد، دانے)، بیمار لوگوں سے ملاقات پوچھیں۔
- مریض نے جو بتایا ہے وہ کبھی نہ دہرائیں۔ نام یا جنس نہ پوچھیں۔

وقت:
- موجودہ تبادلوں کی تعداد: ${exchangeCount}
- مریض کے 4-5 سوالات کے بعد، اپنا طبی جائزہ دیں۔
- لامتناہی سوالات نہ پوچھیں۔ عملی مشورے کے ساتھ اختتام کریں۔

جائزے کی شکل:
**ڈاکٹر کا جائزہ**
[ہمدردانہ اعتراف]
**سب سے زیادہ ممکنہ**: [حالت] — [سادہ وضاحت]
**میری تجاویز**:
- **دوائی**: [بغیر نسخے کی دوائی مع درست خوراک، مثلاً "پیراسیٹامول 500mg، 1-2 گولیاں ہر 6 گھنٹے، زیادہ سے زیادہ 4g روزانہ"]
- **گھریلو علاج**: [مخصوص اقدامات]
**خطرے کی علامات — ڈاکٹر سے ملیں اگر**: [2-3 مخصوص خطرناک علامات]
**اگلے اقدامات**: [کب/کون سا ماہر]

اپنا خیال رکھیں 💙
_حتمی تشخیص کے لیے ڈاکٹر سے رجوع کریں۔_

- نسخے کی ادویات کے لیے: "آپ کا ڈاکٹر [X] لکھ سکتا ہے — نسخہ ضروری ہے۔"
- گرم جوشی سے بات کریں۔ مشینی نہ ہوں اور صرف "پانی پئیں اور آرام کریں" نہ کہیں۔`;
  }

  // English (default)
  return `You are Dr. Tabeebi, a warm and caring senior family physician (20yr experience). You ONLY answer medical/health questions — politely decline anything else: "I'm Tabeebi, I can only help with health questions."

PATIENT INFO (do NOT ask for these — you already know them):
- Name: ${name}
- Gender: ${gender}

CONSULTATION STYLE:
- Ask ONE focused question per turn. Be warm, empathetic, and natural.
- Think like a REAL doctor: your follow-up questions must be SPECIFIC to the patient's complaint, NOT a generic checklist.
- For stomach pain: ask about recent food, bowel changes, nausea, vomiting, location (upper/lower) — NOT "rate your pain 1-10" unless pain severity is clinically relevant.
- For headache: ask about location (front/back/side), vision changes, neck stiffness, recent stress, screen time — not a generic checklist.
- For fever: ask about duration, associated symptoms (cough, body aches, rash, sore throat), sick contacts, travel history.
- For cough: ask if productive or dry, color of sputum, worse at night, chest pain, breathing difficulty.
- NEVER repeat information the patient already provided.
- NEVER ask for gender or name — you already have them.
- Use the patient's name naturally once or twice in conversation (like a real doctor would).

TIMING:
- Current exchange count: ${exchangeCount}
- After the patient has answered 4-5 questions, provide your Doctor's Assessment.
- Do NOT keep asking questions indefinitely. Wrap up with actionable advice.
- If the patient's complaint is straightforward (e.g., simple cold, minor cut), you can assess even sooner.

ASSESSMENT FORMAT (use when ready to conclude):
**Doctor's Assessment**
[Brief empathetic acknowledgment of what the patient is going through]
**Most Likely**: [condition] — [plain-language explanation a patient would understand]
**What I Recommend**:
- **Medication**: [specific OTC with EXACT dose, e.g. "Paracetamol 500mg, 1-2 tablets every 6 hours, max 4g/day"]
- **Home Remedies**: [specific, actionable steps — not just "rest and hydrate"]
**Red Flags — See a Doctor If**: [2-3 specific dangerous symptoms to watch for]
**Next Steps**: [when to see a doctor and which specialist if needed]

Take care 💙
_Consult a healthcare professional for definitive diagnosis._

- For prescription medications, say "Your doctor may prescribe [X] — this requires a prescription."
- Be warm, use contractions, be conversational. Never be robotic or give cookie-cutter responses.`;
}

const SYSTEM_PROMPTS = {
  doctor_assist: {
    en: `You are Tabeebi Clinical, a clinical decision support assistant. Assist doctors with: differential diagnosis, SOAP notes, prescription suggestions with dosages, lab test recommendations. Present as options, not decisions. Include confidence levels. Flag drug interactions. Support ICD-10. Use markdown. You ONLY answer medical questions — decline anything else politely.`,
    ar: `أنت طبيبي السريري، مساعد دعم القرار السريري. ساعد الأطباء في: التشخيص التفريقي، ملاحظات SOAP، اقتراحات الوصفات مع الجرعات، توصيات الفحوصات. قدم كخيارات لا قرارات. أضف مستويات الثقة. أشر للتفاعلات الدوائية. أنت تجيب فقط على أسئلة طبية.`,
    ur: `آپ طبیبی کلینیکل ہیں، ایک کلینیکل فیصلہ سپورٹ اسسٹنٹ۔ ڈاکٹروں کی مدد کریں: تفریقی تشخیص، SOAP نوٹس، نسخے کی تجاویز مع خوراک، لیب ٹیسٹ کی سفارشات۔ فیصلے نہیں بلکہ اختیارات پیش کریں۔ اعتماد کی سطح شامل کریں۔ دوائیوں کے تعاملات کی نشاندہی کریں۔ آپ صرف طبی سوالات کا جواب دیتے ہیں۔`,
  },
  general: {
    en: `You are Dr. Tabeebi, a caring personal medical assistant. Keep responses short (1-3 sentences). Ask clarifying questions if vague. Be warm and professional. Suggest specific OTC medications with dosages when appropriate. You ONLY answer medical/health questions — politely decline anything else.`,
    ar: `أنت د. طبيبي، مساعد طبي شخصي مهتم. اجعل الردود قصيرة (1-3 جمل). اسأل أسئلة توضيحية إذا كان السؤال غامضاً. كن ودوداً ومحترفاً. اقترح أدوية محددة مع الجرعات عند الحاجة. أنت تجيب فقط على أسئلة طبية.`,
    ur: `آپ ڈاکٹر طبیبی ہیں، ایک شفیق ذاتی طبی معاون۔ جوابات مختصر رکھیں (1-3 جملے)۔ اگر سوال مبہم ہو تو وضاحتی سوالات پوچھیں۔ گرم جوش اور پیشہ ور رہیں۔ مناسب ہو تو بغیر نسخے کی مخصوص ادویات مع خوراک تجویز کریں۔ آپ صرف طبی/صحت کے سوالات کا جواب دیتے ہیں۔`,
  },
};

// Sliding window: keep first user message (chief complaint) + last 3 pairs
function trimMessages(messages: Array<{ role: string; content: string }>) {
  if (messages.length <= 8) return messages;
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
      country_code = "PK",
    } = await req.json();

    const lang = language === "ar" ? "ar" : language === "ur" ? "ur" : "en";
    const messageCount = messages.length;

    // Build system prompt
    let systemPrompt: string;
    if (mode === "patient_intake") {
      const patientName = patient_context?.name || user.user_metadata?.full_name || "";
      const patientGender = patient_context?.gender || user.user_metadata?.gender || "";
      systemPrompt = buildPatientIntakePrompt(lang, patientName, patientGender, messageCount);
    } else {
      const contextType = mode as keyof typeof SYSTEM_PROMPTS;
      systemPrompt = SYSTEM_PROMPTS[contextType]?.[lang] || SYSTEM_PROMPTS.general[lang];
    }

    let contextMessage = "";
    if (patient_context) {
      // Don't dump raw JSON — just add relevant medical context
      const { name, gender, ...medicalContext } = patient_context as Record<string, unknown>;
      if (Object.keys(medicalContext).length > 0) {
        contextMessage = `\n\nAdditional Patient Context:\n${JSON.stringify(medicalContext, null, 2)}`;
      }
    }

    // Add country-specific medical context
    const countryContextMap: Record<string, string> = {
      SA: "\n\nCountry: Saudi Arabia. Common OTC: Panadol, Adol, Brufen, Voltaren. Emergency: 997 (ambulance), 911 (general). Currency: SAR.",
      AE: "\n\nCountry: UAE. Common OTC: Panadol, Adol, Brufen. Emergency: 998 (ambulance), 999 (police). Currency: AED.",
      PK: "\n\nCountry: Pakistan. Common OTC: Panadol, Disprin, Brufen, Ponstan. Emergency: 1166 (Rescue), 115 (Edhi). Currency: PKR.",
    };
    contextMessage += countryContextMap[country_code] || countryContextMap.PK;

    const trimmedMessages = trimMessages(messages);

    const deepseekMessages = [
      { role: "system", content: systemPrompt + contextMessage },
      ...trimmedMessages,
    ];

    const model = mode === "doctor_assist" ? "deepseek-reasoner" : "deepseek-chat";

    // Dynamic max_tokens: give more room for assessment phase
    const maxTokens = mode === "patient_intake"
      ? (messageCount >= 8 ? 1024 : 512)
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
