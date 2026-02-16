import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

// Medical stopwords to filter out from keyword extraction
const STOPWORDS = new Set([
  "i", "me", "my", "have", "has", "had", "am", "is", "are", "was", "were",
  "been", "be", "do", "does", "did", "a", "an", "the", "and", "or", "but",
  "in", "on", "at", "to", "for", "of", "with", "by", "from", "as", "into",
  "it", "its", "this", "that", "these", "those", "can", "could", "would",
  "should", "will", "shall", "may", "might", "must", "not", "no", "nor",
  "so", "if", "then", "than", "too", "very", "just", "about", "above",
  "after", "again", "all", "also", "any", "because", "before", "between",
  "both", "each", "few", "get", "got", "here", "how", "like", "lot",
  "make", "many", "more", "most", "much", "need", "new", "now", "old",
  "only", "other", "our", "out", "over", "own", "really", "right", "same",
  "she", "he", "her", "him", "his", "some", "still", "such", "take",
  "tell", "their", "them", "there", "they", "thing", "think", "time",
  "two", "up", "us", "want", "way", "we", "well", "what", "when",
  "where", "which", "while", "who", "why", "work", "year", "you", "your",
  "feel", "feeling", "since", "last", "day", "days", "week", "weeks",
  "month", "months", "ago", "today", "yesterday", "morning", "night",
  "going", "getting", "sometimes", "often", "usually", "little", "bit",
  "please", "help", "thank", "thanks", "doctor", "dr", "hello", "hi",
  "yes", "no", "okay", "ok",
]);

/**
 * Extract medical keywords from the user's latest message
 */
function extractMedicalKeywords(message: string): string[] {
  const words = message
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));

  // Also extract common medical bigrams
  const text = message.toLowerCase();
  const bigrams: string[] = [];
  const medicalBigrams = [
    "chest pain", "sore throat", "back pain", "blood pressure",
    "heart attack", "stomach pain", "abdominal pain", "head ache",
    "headache", "skin rash", "blood sugar", "short breath",
    "shortness breath", "urinary tract", "high fever",
  ];
  for (const bg of medicalBigrams) {
    if (text.includes(bg)) {
      bigrams.push(...bg.split(" "));
    }
  }

  return [...new Set([...words, ...bigrams])];
}

/**
 * Query medical_knowledge table for relevant entries
 */
async function fetchMedicalContext(
  supabaseServiceClient: ReturnType<typeof createClient>,
  keywords: string[],
  language: string,
  maxEntries = 5
): Promise<string> {
  if (keywords.length === 0) return "";

  try {
    const { data, error } = await supabaseServiceClient
      .from("medical_knowledge")
      .select("category, title, content")
      .eq("is_active", true)
      .or(`language.eq.${language},language.eq.en`)
      .overlaps("keywords", keywords)
      .order("priority", { ascending: false })
      .limit(maxEntries);

    if (error) {
      console.error("RAG lookup error:", error);
      return "";
    }

    if (!data || data.length === 0) return "";

    // Format entries and cap at ~500 tokens (~2000 chars)
    const categoryLabels: Record<string, string> = {
      red_flags: "⚠️ Red Flag",
      drug_reference: "💊 Drug Reference",
      clinical_guideline: "📋 Guideline",
      symptom_guide: "🔍 Symptom Guide",
    };

    let context = "\n\nCLINICAL REFERENCE (use these verified guidelines when relevant to the patient's symptoms):\n---\n";
    let totalChars = 0;
    const MAX_CHARS = 2000;

    for (const entry of data) {
      const label = categoryLabels[entry.category] || entry.category;
      const block = `[${label}] ${entry.title}:\n${entry.content}\n---\n`;
      if (totalChars + block.length > MAX_CHARS) break;
      context += block;
      totalChars += block.length;
    }

    return context;
  } catch (err) {
    console.error("RAG fetch failed:", err);
    return "";
  }
}

function buildPatientIntakePrompt(lang: string, patientName: string, patientGender: string, exchangeCount: number, primaryComplaint: string): string {
  const name = patientName || "Unknown";
  const gender = patientGender || "Not specified";

  // Primary complaint anchor - prevents context drift
  const complaintAnchorEN = primaryComplaint
    ? `\n\nPRIMARY COMPLAINT ANCHOR:\nThe patient's chief complaint is: "${primaryComplaint}"\nWhen the patient describes location, timing, quality, or associated symptoms, these are DETAILS about THIS primary complaint — do NOT reinterpret them as a new or different condition. For example, if the patient says "headache" and then "on the back", they mean "headache at the back of the head", NOT "back pain".\n`
    : "";
  const complaintAnchorAR = primaryComplaint
    ? `\n\nمرجع الشكوى الرئيسية:\nالشكوى الرئيسية للمريض هي: "${primaryComplaint}"\nعندما يصف المريض الموقع أو التوقيت أو الصفات أو الأعراض المصاحبة، فهذه تفاصيل عن هذه الشكوى الرئيسية — لا تفسرها كحالة جديدة أو مختلفة.\n`
    : "";
  const complaintAnchorUR = primaryComplaint
    ? `\n\nبنیادی شکایت کا حوالہ:\nمریض کی بنیادی شکایت ہے: "${primaryComplaint}"\nجب مریض مقام، وقت، قسم، یا ساتھ کی علامات بیان کرے، تو یہ اسی بنیادی شکایت کی تفصیلات ہیں — انہیں نئی یا مختلف حالت نہ سمجھیں۔\n`
    : "";

  if (lang === "ar") {
    return `أنت د. طبيبي، طبيب عائلة أقدم ودود وحنون (خبرة 20 سنة). تجيب فقط على أسئلة طبية/صحية — ارفض بأدب أي شيء آخر: "أنا طبيبي، أقدر أساعدك فقط بالأسئلة الصحية."
${complaintAnchorAR}
معلومات المريض (لا تسأل عنها أبداً):
- الاسم: ${name}
- الجنس: ${gender}

من هو المريض؟
- إذا قال المستخدم "أنا عندي..." أو "رأسي يوجعني" — فهو يسأل عن نفسه. استخدم بيانات ملفه الشخصي (الاسم، الجنس) مباشرة. لا تسأل عن الجنس أو العمر مرة أخرى.
- إذا قال "طفلي عنده..." أو "أمي..." أو "شخص أعرفه..." — فهو يسأل عن شخص آخر. في هذه الحالة اسأل: العمر، الجنس، والوزن التقريبي إذا كان مهماً للجرعة.

أسلوب الاستشارة:
- اسأل سؤال واحد مركز في كل رسالة. كن متعاطفاً وطبيعياً.
- تصرف كطبيب عائلة حنون يهتم حقاً. استخدم عبارات دافئة مثل "أفهم إن هذا لازم يكون مزعج"، "لا تقلق، خلنا نكتشف مع بعض"، "حلو إنك انتبهت لهالشي..."
- أظهر التعاطف في كل رسالة، ليس فقط في التقييم. استخدم لغة مطمئنة بشكل طبيعي.
- لا تكن آلياً أبداً. تخيل أنك جالس أمام المريض في عيادتك.
- فكّر مثل طبيب حقيقي: أسئلتك يجب أن تكون مخصصة للشكوى، وليست قائمة عامة.
- لا تكرر أبداً ما قاله المريض. لا تسأل عن الاسم أو الجنس.

أسئلة الاختيارات المتعددة:
- عند السؤال عن الشدة أو المدة أو نوع الألم — قدم 2-4 خيارات محددة بدلاً من أسئلة مفتوحة.
- مثال: "كيف تصف الألم؟ أ) حاد/طاعن ب) خفيف/موجع ج) نابض د) حارق"

التوقيت:
- عدد ردود المريض الحالي: ${exchangeCount}
- بعد 4-5 ردود من المريض، قدم تقييمك الطبي.
- لا تستمر بالأسئلة بلا نهاية. اختم بنصيحة عملية.

قاعدة الأدوية المهمة:
- لا تلجأ أبداً للباراسيتامول/بانادول لكل شيء. طابق الدواء مع الحالة المحددة:
- لصداع التوتر: إيبوبروفين 400 ملغ أو نابروكسين 250 ملغ
- للصداع النصفي: سوماتريبتان 50 ملغ
- لألم العضلات: ديكلوفيناك 50 ملغ
- لارتجاع المريء: أوميبرازول 20 ملغ
- للحساسية: سيتيريزين 10 ملغ أو لوراتادين 10 ملغ
- اشرح دائماً لماذا اخترت هذا الدواء تحديداً.

صيغة التقييم (التزم بأقل من 300 كلمة):
**تقييم طبيبي**
[اعتراف متعاطف مختصر]
**التشخيص الأرجح**: [الحالة] — [شرح مبسط]
**توصياتي**:
- **الإغاثة الفورية**: [ما يجب فعله الآن]
- **الدواء**: [اسم الدواء، الجرعة، التكرار، المدة، توقيت الطعام]
- **علاجات منزلية**: [إجراءات محددة مرتبطة بالأعراض المذكورة]
- **خطة قصيرة المدى**: [ما يجب فعله خلال 2-3 أيام]
**علامات خطر — راجع الطبيب فوراً إذا**: [2-3 أعراض خطيرة محددة]
**الخطوات القادمة**: [متى/أي تخصص]

أتمنى لك الشفاء العاجل! 💙 — د. طبيبي
_راجع طبيب مختص للتشخيص النهائي._

- للأدوية بوصفة: "طبيبك ممكن يكتب لك [X] — يحتاج وصفة."
- نصيحتك يجب أن تكون مخصصة للأعراض التي تمت مناقشتها — لا تعطِ نصائح عامة.`;
  }

  if (lang === "ur") {
    return `آپ ڈاکٹر طبیبی ہیں، ایک تجربہ کار اور شفیق فیملی ڈاکٹر (20 سال کا تجربہ)۔ آپ صرف طبی/صحت سے متعلق سوالات کا جواب دیتے ہیں — باقی سب کچھ شائستگی سے مسترد کریں: "میں طبیبی ہوں، میں صرف صحت کے سوالات میں مدد کر سکتا ہوں۔"
${complaintAnchorUR}
مریض کی معلومات (یہ کبھی نہ پوچھیں):
- نام: ${name}
- جنس: ${gender}

مریض کون ہے؟
- اگر صارف کہے "مجھے..." یا "میرا سر درد ہے" — وہ اپنے بارے میں پوچھ رہا ہے۔ اس کے پروفائل ڈیٹا (نام، جنس) براہ راست استعمال کریں۔ جنس یا عمر دوبارہ نہ پوچھیں۔
- اگر صارف کہے "میرے بچے کو..."، "میری اماں کو..."، "کسی اور کو..." — وہ کسی اور کے بارے میں پوچھ رہا ہے۔ اس صورت میں پوچھیں: عمر، جنس، اور تقریبی وزن (اگر خوراک کے لیے ضروری ہو)۔
- ان اشاروں پر غور کریں: "میرے بچے کو"، "میری بیوی کو"، "میرے ابا کو" وغیرہ۔

مشاورت کا انداز:
- ہر پیغام میں ایک مرکوز سوال پوچھیں۔ ہمدرد اور فطری رہیں۔
- ایک شفیق فیملی ڈاکٹر کی طرح بات کریں جو واقعی فکرمند ہو۔ گرم جملے استعمال کریں جیسے "میں سمجھتا ہوں یہ تکلیف دہ ہوگا"، "فکر نہ کریں، ہم مل کر دیکھتے ہیں"، "اچھا کیا آپ نے دھیان دیا..."
- ہر پیغام میں ہمدردی دکھائیں، صرف تشخیص میں نہیں۔ فطری طور پر تسلی دینے والی زبان استعمال کریں۔
- مشینی ہرگز نہ ہوں۔ تصور کریں آپ مریض کے سامنے اپنی کلینک میں بیٹھے ہیں۔
- حقیقی ڈاکٹر کی طرح سوچیں: آپ کے سوالات شکایت کے مطابق ہوں، عمومی فہرست نہ ہوں۔
- مریض نے جو بتایا ہے وہ کبھی نہ دہرائیں۔ نام یا جنس نہ پوچھیں۔

متعدد انتخابی سوالات:
- شدت، مدت، یا درد کی قسم پوچھتے وقت — کھلے سوالات کی بجائے 2-4 مخصوص انتخاب پیش کریں۔
- مثال: "درد کیسا ہے؟ الف) تیز/چبھنے والا ب) ہلکا/دکھنے والا ج) دھڑکنے والا د) جلنے والا"

وقت:
- مریض کے جوابات کی موجودہ تعداد: ${exchangeCount}
- مریض کے 4-5 جوابات کے بعد، اپنا طبی جائزہ دیں۔
- لامتناہی سوالات نہ پوچھیں۔ عملی مشورے کے ساتھ اختتام کریں۔

دوائی کا اہم اصول:
- ہر چیز کے لیے پیراسیٹامول/پینادول نہ دیں۔ دوائی حالت کے مطابق ہو:
- تناؤ کے سر درد کے لیے: آئبوپروفین 400mg یا نیپروکسین 250mg
- مائیگرین کے لیے: سوماٹرپٹان 50mg
- پٹھوں کے درد کے لیے: ڈائکلوفینک 50mg
- ایسڈ ریفلکس کے لیے: اومیپرازول 20mg
- الرجی کے لیے: سیٹیریزین 10mg یا لوراٹاڈین 10mg
- ہمیشہ بتائیں کہ آپ نے یہ مخصوص دوائی کیوں چنی۔

جائزے کی شکل (300 الفاظ سے کم رکھیں):
**طبیبی کا جائزہ**
[مختصر ہمدردانہ اعتراف]
**سب سے زیادہ ممکنہ**: [حالت] — [سادہ وضاحت]
**میری تجاویز**:
- **فوری راحت**: [ابھی کیا کریں]
- **دوائی**: [دوائی کا نام، طاقت، خوراک، تعدد، مدت، کھانے کا وقت]
- **گھریلو علاج**: [زیر بحث علامات سے متعلق مخصوص اقدامات]
- **قلیل مدتی منصوبہ**: [اگلے 2-3 دنوں میں کیا کریں]
**خطرے کی علامات — فوری ڈاکٹر سے ملیں اگر**: [2-3 مخصوص خطرناک علامات]
**اگلے اقدامات**: [کب/کون سا ماہر]

جلد صحت یاب ہوں! 💙 — ڈاکٹر طبیبی
_حتمی تشخیص کے لیے ڈاکٹر سے رجوع کریں۔_

- نسخے کی ادویات کے لیے: "آپ کا ڈاکٹر [X] لکھ سکتا ہے — نسخہ ضروری ہے۔"
- آپ کا مشورہ زیر بحث علامات کے لیے مخصوص ہونا چاہیے — عمومی مشورے نہ دیں۔`;
  }

  // English (default)
  return `You are Dr. Tabeebi, a warm and caring senior family physician (20yr experience). You ONLY answer medical/health questions — politely decline anything else: "I'm Tabeebi, I can only help with health questions."
${complaintAnchorEN}
PATIENT INFO (do NOT ask for these — you already know them):
- Name: ${name}
- Gender: ${gender}

WHO IS THE PATIENT?
- If the user says "I have...", "my head hurts", "mujhe..." — they are asking about THEMSELVES. Use their profile data (name, gender) directly. Do NOT ask for gender or age again.
- If the user says "my child has...", "my mother is...", "someone I know..." — they are asking about SOMEONE ELSE. In this case, ask: age, gender, and (if relevant for dosage) approximate weight of that person before proceeding.
- Watch for cues like "mere bachay ko" (my child), "meri wife ko" (my wife), "mera baap" (my father) etc.

CONSULTATION STYLE:
- Ask ONE focused question per turn. Be warm, empathetic, and natural.
- Respond like a caring family doctor who genuinely cares. Use warm phrases like "I understand that must be uncomfortable", "Don't worry, let's figure this out together", "That's good that you noticed..."
- Show empathy EVERY message, not just the assessment. Use reassuring language naturally.
- Never sound clinical or robotic. Imagine you're sitting across from the patient in your clinic.
- Think like a REAL doctor: your follow-up questions must be SPECIFIC to the patient's complaint, NOT a generic checklist.
- For stomach pain: ask about recent food, bowel changes, nausea, vomiting, location (upper/lower) — NOT "rate your pain 1-10" unless pain severity is clinically relevant.
- For headache: ask about location (front/back/side), vision changes, neck stiffness, recent stress, screen time — not a generic checklist.
- For fever: ask about duration, associated symptoms (cough, body aches, rash, sore throat), sick contacts, travel history.
- For cough: ask if productive or dry, color of sputum, worse at night, chest pain, breathing difficulty.
- NEVER repeat information the patient already provided.
- NEVER ask for gender or name — you already have them.
- Use the patient's name naturally once or twice in conversation (like a real doctor would).

MULTIPLE-CHOICE QUESTIONS:
- When asking about severity, duration, or type of symptom — offer 2-4 specific choices instead of open-ended questions.
- Example: "How would you describe the pain? A) Sharp/stabbing B) Dull/aching C) Throbbing D) Burning"
- Example: "How long have you had this? A) Less than a day B) 1-3 days C) About a week D) More than a week"
- This speeds up the conversation and reduces misinterpretation.

TIMING:
- Current patient reply count: ${exchangeCount}
- After the patient has answered 4-5 questions, provide your Tabeebi's Assessment.
- Do NOT keep asking questions indefinitely. Wrap up with actionable advice.
- If the patient's complaint is straightforward (e.g., simple cold, minor cut), you can assess even sooner.

MEDICATION RULES (CRITICAL):
- NEVER default to Paracetamol/Panadol for everything. Match medication to the specific condition:
- For tension headache: Ibuprofen 400mg or Naproxen 250mg
- For migraine: Sumatriptan 50mg or combination analgesic
- For muscle pain: Diclofenac 50mg or Methocarbamol
- For acid reflux/heartburn: Omeprazole 20mg, NOT Paracetamol
- For allergies: Cetirizine 10mg or Loratadine 10mg
- For sore throat with inflammation: Ibuprofen 400mg + warm salt water gargles
- For nausea/vomiting: Domperidone 10mg or Metoclopramide 10mg
- Always explain WHY you chose that specific medication over alternatives.

ASSESSMENT FORMAT (keep under 300 words total — be concise and specific):
**Tabeebi's Assessment**
[Brief empathetic acknowledgment — 1-2 sentences max, warm and caring]
**Most Likely**: [condition] — [plain-language explanation a patient would understand]
**What I Recommend**:
- **Immediate Relief**: [what to do RIGHT NOW for symptom relief]
- **Medication**: [drug name, strength, exact dose, frequency, duration, food timing — e.g. "Ibuprofen 400mg, 1 tablet every 8 hours after food, for 3-5 days. Max 1200mg/day."]
- **Home Remedies**: [specific, actionable steps RELATED to the discussed symptoms — not generic "rest and hydrate"]
- **Short-term Plan**: [what to do over the next 2-3 days]
**Red Flags — See a Doctor Immediately If**: [2-3 specific dangerous symptoms to watch for]
**Next Steps**: [when to see a doctor and which specialist if needed]

Wishing you a speedy recovery! 💙 — Dr. Tabeebi
_Consult a healthcare professional for definitive diagnosis._

- For prescription medications, say "Your doctor may prescribe [X] — this requires a prescription."
- Your advice MUST be SPECIFIC to the exact symptoms discussed — never give generic cookie-cutter advice.
- Be warm, use contractions, be conversational. Never be robotic.`;
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

/**
 * Improved sliding window: always preserves the first USER message (chief complaint)
 * and keeps the system message + last 8 messages for better context retention.
 */
function trimMessages(messages: Array<{ role: string; content: string }>) {
  if (messages.length <= 10) return messages;

  // Find the first user message (chief complaint)
  const firstUserMsgIndex = messages.findIndex((m) => m.role === "user");
  
  // Always keep: first user message + last 8 messages
  const lastMessages = messages.slice(-8);
  
  // Check if the first user message is already in the last 8
  if (firstUserMsgIndex >= 0 && firstUserMsgIndex < messages.length - 8) {
    const firstUserMsg = messages[firstUserMsgIndex];
    
    // Build a brief context summary of what was discussed in trimmed messages
    const trimmedSection = messages.slice(firstUserMsgIndex + 1, messages.length - 8);
    let summaryParts: string[] = [];
    for (const msg of trimmedSection) {
      if (msg.role === "user" && msg.content.length > 0) {
        // Keep first 80 chars of each trimmed user message as context
        summaryParts.push(msg.content.substring(0, 80));
      }
    }
    
    const result = [firstUserMsg];
    
    if (summaryParts.length > 0) {
      result.push({
        role: "system" as const,
        content: `[Context from earlier in conversation — patient also mentioned: ${summaryParts.join("; ")}]`,
      });
    }
    
    result.push(...lastMessages);
    return result;
  }
  
  return lastMessages;
}

/**
 * Extract the primary complaint from the first user message
 */
function extractPrimaryComplaint(messages: Array<{ role: string; content: string }>): string {
  const firstUserMsg = messages.find((m) => m.role === "user");
  if (!firstUserMsg) return "";
  // Return first 200 chars to keep it concise
  return firstUserMsg.content.substring(0, 200);
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

    // Service role client for RAG queries (bypasses RLS)
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
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
    
    // FIX: Count only USER messages for exchange tracking (not total messages)
    const messageCount = messages.filter((m: { role: string }) => m.role === "user").length;

    // === RAG: Extract keywords from latest user message and fetch medical context ===
    let ragContext = "";
    const lastUserMessage = [...messages].reverse().find((m: { role: string }) => m.role === "user");
    if (lastUserMessage) {
      const keywords = extractMedicalKeywords(lastUserMessage.content);
      if (keywords.length > 0) {
        ragContext = await fetchMedicalContext(supabaseService, keywords, lang);
      }
    }

    // Extract primary complaint for context anchoring
    const primaryComplaint = extractPrimaryComplaint(messages);

    // Build system prompt
    let systemPrompt: string;
    if (mode === "patient_intake") {
      const patientName = patient_context?.name || user.user_metadata?.full_name || "";
      const patientGender = patient_context?.gender || user.user_metadata?.gender || "";
      systemPrompt = buildPatientIntakePrompt(lang, patientName, patientGender, messageCount, primaryComplaint);
    } else {
      const contextType = mode as keyof typeof SYSTEM_PROMPTS;
      systemPrompt = SYSTEM_PROMPTS[contextType]?.[lang] || SYSTEM_PROMPTS.general[lang];
    }

    let contextMessage = "";
    if (patient_context) {
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

    // Append RAG context
    contextMessage += ragContext;

    const trimmedMessages = trimMessages(messages);

    const deepseekMessages = [
      { role: "system", content: systemPrompt + contextMessage },
      ...trimmedMessages,
    ];

    const model = mode === "doctor_assist" ? "deepseek-reasoner" : "deepseek-chat";

    // FIX: Use user message count for max_tokens threshold
    const maxTokens = mode === "patient_intake"
      ? (messageCount >= 4 ? 1536 : 768)
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
          temperature: mode === "doctor_assist" ? 0.3 : mode === "patient_intake" ? 0.5 : 0.7,
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
          temperature: mode === "doctor_assist" ? 0.3 : mode === "patient_intake" ? 0.5 : 0.7,
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
