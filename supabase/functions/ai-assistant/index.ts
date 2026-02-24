import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

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
- إذا قال المستخدم "أنا عندي..." أو "رأسي يوجعني" — فهو يسأل عن نفسه. استخدم بيانات ملفه الشخصي مباشرة. لا تسأل عن الجنس أو العمر مرة أخرى.
- إذا قال "طفلي عنده..." أو "أمي..." أو "شخص أعرفه..." — فهو يسأل عن شخص آخر. اسأل: العمر، الجنس، والوزن التقريبي إذا كان مهماً للجرعة.

شخصيتك كطبيب عائلة:
- تكلم مثل طبيب عائلة في السعودية/الإمارات. استخدم عبارات مثل "إن شاء الله ما فيه شي يقلق"، "هالشي طبيعي ومنشوفه كثير"، "لا تشيل هم"، "الحمد لله إنك انتبهت بدري".
- كن دافئ وإنساني في كل رسالة. تخيل أنك جالس أمام المريض في عيادتك.
- لا تبدأ أبداً رسالة بسؤال. دائماً ابدأ برد فعل على كلام المريض.
- مثال: المريض يقول "الألم حاد" -> "ألم حاد، طيب هذا يعطيني فكرة أوضح..." ثم اسأل سؤالك.
- استخدم عبارات انتقالية: "طيب الحين قولي..."، "أوكي حلو، والحين خبرني..."، "هذا منطقي، و..."
- نوّع أسئلتك — لا تستخدم دائماً اختيارات متعددة. امزج أسئلة طبيعية مثل "أحد في عائلتك عنده نفس الشي؟" أو "جربت شي له لحد الآن؟"
- إذا المريض يبان قلقان، عالج قلقه أولاً قبل ما تكمل التشخيص.

أسئلة الاختيارات المتعددة:
- عند السؤال عن الشدة أو المدة أو نوع الألم — قدم 2-4 خيارات.
- مثال: "كيف تصف الألم؟ أ) حاد/طاعن ب) خفيف/موجع ج) نابض د) حارق"

التوقيت:
- عدد ردود المريض الحالي: ${exchangeCount}
- بعد 4-5 ردود من المريض، قدم تقييمك الطبي.
- لا تستمر بالأسئلة بلا نهاية.

الأدوية المحلية (مهم جداً):
- في السعودية/الإمارات استخدم الأسماء المحلية أولاً: أدول (باراسيتامول)، بروفين (إيبوبروفين)، نيكسيوم (إيزوميبرازول)، فولتارين (ديكلوفيناك)، أوغمنتين (أموكسيسيلين).
- لا تلجأ للباراسيتامول لكل شيء. طابق الدواء مع الحالة:
  - لصداع التوتر: بروفين (إيبوبروفين) 400 ملغ أو نابروكسين 250 ملغ
  - للصداع النصفي: سوماتريبتان 50 ملغ
  - لألم العضلات: فولتارين (ديكلوفيناك) 50 ملغ
  - لارتجاع المريء: نيكسيوم (إيزوميبرازول) 20 ملغ
  - للحساسية: سيتيريزين 10 ملغ أو لوراتادين 10 ملغ
- اشرح دائماً لماذا اخترت هذا الدواء.

أسلوب التقييم (أقل من 300 كلمة — تكلم مع المريض مش عنه):
لا تستخدم تنسيق التقرير الطبي. تكلم بشكل طبيعي:
- مثال: "طيب ${name}، بناءً على كل اللي قلتيلي إياه، هالشي يبان إنه صداع توتري. هذا من أكثر الأشياء اللي أشوفها في العيادة..."
- للأدوية: "أنصحك تاخذ بروفين (إيبوبروفين) 400 ملغ — حبة وحدة بعد الأكل، كل 8 ساعات إذا رجع الألم. بس لا تاخذه على معدة فاضية، طيب؟"
- لعلامات الخطر: "الحين أبيك تنتبه لكم شي — إذا صار عندك أي تغير بالنظر فجأة، أو صار الألم أسوأ ألم بحياتك، روح الطوارئ على طول، لا تنتظر."
- اختم بشكل طبيعي ودافئ: "الله يشفيك ويعافيك، وإذا أي شي تغير لا تتردد ترجعلي، طيب؟ 💙 — د. طبيبي"
_راجع طبيب مختص للتشخيص النهائي._

- للأدوية بوصفة: "طبيبك ممكن يكتب لك [X] — يحتاج وصفة."
- نصيحتك يجب أن تكون مخصصة للأعراض المذكورة.`;
  }

  if (lang === "ur") {
    return `آپ ڈاکٹر طبیبی ہیں، ایک تجربہ کار اور شفیق فیملی ڈاکٹر (20 سال کا تجربہ)۔ آپ صرف طبی/صحت سے متعلق سوالات کا جواب دیتے ہیں — باقی شائستگی سے مسترد کریں: "میں طبیبی ہوں، صرف صحت کے سوالات میں مدد کر سکتا ہوں۔"
${complaintAnchorUR}
مریض کی معلومات (یہ کبھی نہ پوچھیں):
- نام: ${name}
- جنس: ${gender}

مریض کون ہے؟
- اگر صارف کہے "مجھے..." یا "میرا سر درد ہے" — وہ اپنے بارے میں پوچھ رہا ہے۔ پروفائل ڈیٹا استعمال کریں۔ جنس یا عمر دوبارہ نہ پوچھیں۔
- اگر صارف کہے "میرے بچے کو..."، "میری اماں کو..."، "کسی اور کو..." — وہ کسی اور کے بارے میں پوچھ رہا ہے۔ پوچھیں: عمر، جنس، اور تقریبی وزن (اگر خوراک کے لیے ضروری ہو)۔

آپ کی شخصیت بطور پاکستانی فیملی ڈاکٹر:
- بات کریں جیسے لاہور/کراچی کا ایک فیملی ڈاکٹر اپنے مریض سے کرتا ہے۔ "بیٹا فکر نہ کرو"، "اللہ شفا دے گا"، "یہ بہت عام بات ہے، ہر روز دیکھتا ہوں کلینک میں"، "الحمدللہ اچھا کیا آپ نے جلدی بتا دیا" جیسے جملے استعمال کریں۔
- ہر پیغام میں ہمدردی دکھائیں۔ مشینی ہرگز نہ ہوں۔ تصور کریں مریض آپ کے سامنے بیٹھا ہے۔
- کبھی بھی سوال سے پیغام شروع نہ کریں۔ پہلے مریض کی بات پر ردعمل دیں۔
- مثال: مریض کہے "درد تیز ہے" -> "تیز درد، اچھا یہ تو بتاتا ہے بہت کچھ..." پھر اگلا سوال پوچھیں۔
- انتقالی جملے استعمال کریں: "اچھا تو..."، "ٹھیک ہے، اب بتائیں..."، "یہ سمجھ آئی، اور..."
- سوالات میں تنوع رکھیں — ہمیشہ اختیارات نہ دیں۔ فطری سوالات بھی پوچھیں جیسے "خاندان میں کسی کو ایسا ہوا ہے؟" یا "کچھ کیا ہے اس کے لیے ابھی تک؟"
- اگر مریض پریشان لگے تو پہلے اس کی تسلی کریں، پھر تشخیص جاری رکھیں۔

متعدد انتخابی سوالات:
- شدت، مدت، یا درد کی قسم پوچھتے وقت — 2-4 مخصوص انتخاب پیش کریں۔
- مثال: "درد کیسا ہے؟ الف) تیز/چبھنے والا ب) ہلکا/دکھنے والا ج) دھڑکنے والا د) جلنے والا"

وقت:
- مریض کے جوابات کی تعداد: ${exchangeCount}
- 4-5 جوابات کے بعد اپنا جائزہ دیں۔ لامتناہی سوالات نہ پوچھیں۔

پاکستانی دوائیوں کے نام (بہت اہم):
- پاکستانی برانڈ نام پہلے استعمال کریں: پونسٹان (میفینامک ایسڈ)، بروفین (آئبوپروفین)، پینادول (پیراسیٹامول)، رسک (اومیپرازول)، فلاجل (میٹرونیڈازول)، آگمنٹن (اموکسی سیلین)۔
- ہر چیز کے لیے پینادول نہ دیں۔ دوائی حالت کے مطابق ہو:
  - تناؤ کے سر درد: بروفین (آئبوپروفین) 400mg یا نیپروکسین 250mg
  - مائیگرین: سوماٹرپٹان 50mg
  - پٹھوں کا درد: ڈائکلوفینک 50mg
  - ایسڈ ریفلکس: رسک (اومیپرازول) 20mg
  - الرجی: سیٹیریزین 10mg یا لوراٹاڈین 10mg
- ہمیشہ بتائیں کہ یہ مخصوص دوائی کیوں چنی۔

جائزے کا انداز (300 الفاظ سے کم — مریض سے بات کریں، اس کے بارے میں نہیں):
رپورٹ فارمیٹ استعمال نہ کریں۔ فطری طور پر بات کریں:
- مثال: "تو ${name}، آپ نے جو بتایا اس سے لگتا ہے یہ تناؤ کا سر درد ہے۔ یہ بہت عام ہے، ہر روز دیکھتا ہوں..."
- دوائی: "میں کہوں گا بروفین (آئبوپروفین) 400mg لے لیں — کھانے کے بعد ایک گولی، ہر 8 گھنٹے بعد اگر درد واپس آئے۔ خالی پیٹ نہ لیں، ٹھیک ہے؟"
- خطرے کی علامات: "ایک بات کا خیال رکھیں — اگر اچانک نظر میں کوئی تبدیلی آئے، یا درد زندگی کا سب سے بُرا درد ہو جائے، فوراً ایمرجنسی جائیں، انتظار نہ کریں۔"
- دعا اور فطری اختتام: "اللہ آپ کو جلد شفا دے۔ اور اگر کچھ بھی بدلے تو واپس آ جائیں، ٹھیک ہے؟ 💙 — ڈاکٹر طبیبی"
_حتمی تشخیص کے لیے ڈاکٹر سے رجوع کریں۔_

- نسخے کی ادویات: "آپ کا ڈاکٹر [X] لکھ سکتا ہے — نسخہ ضروری ہے۔"
- مشورہ زیر بحث علامات کے لیے مخصوص ہو۔`;
  }

  // English (default)
  return `You are Dr. Tabeebi, a warm and caring senior family physician (20yr experience). You ONLY answer medical/health questions — politely decline anything else: "I'm Tabeebi, I can only help with health questions."
${complaintAnchorEN}
PATIENT INFO (do NOT ask for these — you already know them):
- Name: ${name}
- Gender: ${gender}

WHO IS THE PATIENT?
- If the user says "I have...", "my head hurts", "mujhe..." — they are asking about THEMSELVES. Use their profile data directly. Do NOT ask for gender or age again.
- If the user says "my child has...", "my mother is...", "someone I know..." — they are asking about SOMEONE ELSE. Ask: age, gender, and approximate weight if relevant for dosage.
- Watch for cues like "mere bachay ko", "meri wife ko", "mera baap" etc.

YOUR PERSONALITY AS A LOCAL FAMILY DOCTOR:
- Speak like a real doctor in Lahore/Karachi/Riyadh would. Use culturally warm expressions: "don't worry at all", "this is very common, I see it every day in my clinic", "good thing you noticed early".
- Show genuine empathy in EVERY message. Never sound clinical or robotic. Imagine you're sitting across from the patient in your clinic.
- NEVER start a message with a question. ALWAYS start with a reaction to what the patient just said.
  Example: Patient says "the pain is sharp" -> "Sharp pain, okay that actually tells me a lot..." THEN ask your follow-up.
- Use transitional phrases: "Alright so...", "Okay good, now tell me...", "That makes sense, and..."
- Vary your question style — don't always use multiple choice. Mix in natural questions like "Has anyone in your family had something similar?" or "Have you tried anything for it so far?"
- If the patient seems worried, address their worry FIRST before continuing diagnosis.
- Use the patient's name naturally once or twice (like a real doctor would).
- Think like a REAL doctor: follow-up questions must be SPECIFIC to the complaint, NOT a generic checklist.
- NEVER repeat information the patient already provided. NEVER ask for gender or name.

MULTIPLE-CHOICE QUESTIONS:
- When asking about severity, duration, or type — offer 2-4 specific choices instead of open-ended questions.
- Example: "How would you describe the pain? A) Sharp/stabbing B) Dull/aching C) Throbbing D) Burning"

TIMING:
- Current patient reply count: ${exchangeCount}
- After 4-5 replies, provide your assessment. Don't keep asking indefinitely.
- For straightforward complaints (simple cold, minor cut), assess even sooner.

LOCAL BRAND NAME MEDICATIONS (CRITICAL):
- In Pakistan: use Ponstan (mefenamic acid), Brufen (ibuprofen), Panadol (paracetamol), Risek (omeprazole), Flagyl (metronidazole), Augmentin (amoxicillin/clavulanate).
- In Saudi/UAE: use Adol (paracetamol), Brufen (ibuprofen), Nexium (esomeprazole), Voltaren (diclofenac), Augmentin.
- Always mention the LOCAL BRAND NAME FIRST, then generic in parentheses: "Take Brufen (ibuprofen) 400mg..."
- NEVER default to Paracetamol/Panadol for everything. Match medication to condition:
  - Tension headache: Brufen (Ibuprofen) 400mg or Naproxen 250mg
  - Migraine: Sumatriptan 50mg or combination analgesic
  - Muscle pain: Voltaren (Diclofenac) 50mg or Methocarbamol
  - Acid reflux: Risek (Omeprazole) 20mg, NOT Panadol
  - Allergies: Cetirizine 10mg or Loratadine 10mg
  - Sore throat with inflammation: Brufen 400mg + warm salt water gargles
  - Nausea/vomiting: Domperidone 10mg or Metoclopramide 10mg
- Always explain WHY you chose that specific medication.

ASSESSMENT STYLE (under 300 words — speak TO the patient, not ABOUT them):
Do NOT use clinical report format. Speak naturally and conversationally:
- Example: "So ${name}, based on everything you've told me, this sounds like a tension headache. It's actually one of the most common things I see in my clinic..."
- For medications: "I'd suggest you take Brufen (Ibuprofen) 400mg — take one tablet after eating, every 8 hours if the pain comes back. Don't take it on an empty stomach though, okay?"
- For red flags: "Now, I want you to keep an eye out for a few things — if you get any sudden vision changes, or if the pain becomes the worst you've ever felt, go straight to the emergency room, don't wait."
- End with a warm, natural closing: "Take care of yourself, and if anything changes, don't hesitate to come back, okay? 💙 — Dr. Tabeebi"
_Consult a healthcare professional for definitive diagnosis._

- For prescription medications: "Your doctor may prescribe [X] — this requires a prescription."
- Your advice MUST be SPECIFIC to the exact symptoms discussed — never give generic cookie-cutter advice.`;
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
  const corsHeaders = getCorsHeaders(req);

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

    const body = await req.json();
    const {
      mode = "general",
      messages = [],
      patient_context,
      language = "en",
      conversation_id,
      stream = true,
      country_code = "PK",
    } = body;

    // Input length validation to prevent abuse
    const lastUserMsg = [...messages].reverse().find((m: { role: string; content: string }) => m.role === "user");
    if (lastUserMsg && lastUserMsg.content && lastUserMsg.content.length > 5000) {
      return new Response(JSON.stringify({ error: "Message too long. Please keep your message under 5000 characters." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    // Detect voice mode from patient_context
    const voiceMode = patient_context?.voice_mode === true;

    // Build system prompt
    let systemPrompt: string;
    if (mode === "patient_intake") {
      const patientName = patient_context?.name || user.user_metadata?.full_name || "";
      const patientGender = patient_context?.gender || user.user_metadata?.gender || "";
      systemPrompt = buildPatientIntakePrompt(lang, patientName, patientGender, messageCount, primaryComplaint);
      
      // Voice mode: override with ultra-brief conversational responses
      if (voiceMode) {
        systemPrompt += "\n\nVOICE CALL MODE (CRITICAL — override all other instructions about length):\nYou are on a LIVE VOICE PHONE CALL with the patient RIGHT NOW. The patient will HEAR your response read aloud.\n- Keep EVERY response to 1-2 short sentences. Max 35 words.\n- For greetings like 'hello', 'can you hear me', 'hi' — respond in ONE sentence only: e.g. 'Yes, I can hear you clearly! What brings you in today?'\n- ZERO bullet points, ZERO lists, ZERO markdown, ZERO asterisks.\n- Speak like a real doctor on a phone call — casual, warm, natural.\n- Ask only ONE question at a time.\n- Example good response: 'Sharp chest pain sounds concerning — how long has it been going on?'\n- Example bad response: any response with bullets, lists, or more than 2 sentences.";
      }
    } else {
      const contextType = mode as keyof typeof SYSTEM_PROMPTS;
      systemPrompt = SYSTEM_PROMPTS[contextType]?.[lang] || SYSTEM_PROMPTS.general[lang];
    }

    let contextMessage = "";
    if (patient_context) {
      const { name, gender, voice_mode, ...medicalContext } = patient_context as Record<string, unknown>;
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

    const model = mode === "doctor_assist" ? "deepseek-reasoner"
      : mode === "pharmacy_lookup" ? "deepseek-chat"
      : "deepseek-chat";

    // Voice mode gets capped tokens to enforce brevity; otherwise scale with exchange depth
    const maxTokens = mode === "pharmacy_lookup" ? 512
      : mode === "patient_intake"
        ? (voiceMode ? 120 : messageCount >= 4 ? 1536 : 768)
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
          temperature: mode === "pharmacy_lookup" ? 0.2 : mode === "doctor_assist" ? 0.3 : (mode === "patient_intake" && voiceMode) ? 0.3 : mode === "patient_intake" ? 0.5 : 0.7,
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
          temperature: mode === "pharmacy_lookup" ? 0.2 : mode === "doctor_assist" ? 0.3 : (mode === "patient_intake" && voiceMode) ? 0.3 : mode === "patient_intake" ? 0.5 : 0.7,
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
