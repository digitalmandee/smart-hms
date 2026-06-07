import { LegalLayout, LegalSection, LegalLang } from "@/components/legal/LegalLayout";
import { LEGAL_ENTITY, LAST_UPDATED } from "@/lib/legal-constants";

const T = {
  title: { en: "Privacy Policy", ur: "رازداری کی پالیسی", ar: "سياسة الخصوصية" },
  tagline: {
    en: `How ${LEGAL_ENTITY.name} collects, uses and protects your information.`,
    ur: `${LEGAL_ENTITY.name} آپ کی معلومات کیسے جمع، استعمال اور محفوظ کرتا ہے۔`,
    ar: `كيف يجمع ${LEGAL_ENTITY.name} معلوماتك ويستخدمها ويحميها.`,
  },
  sections: {
    intro: {
      en: { h: "Introduction", body: `${LEGAL_ENTITY.name} ("we", "us") provides hospital management software to healthcare facilities. This Privacy Policy explains what personal data we collect, why we collect it, and the rights you have over it. It applies to our public website, customer dashboards, mobile apps and patient portals.` },
      ur: { h: "تعارف", body: `${LEGAL_ENTITY.name} ("ہم") صحت کی سہولیات کو ہسپتال مینجمنٹ سافٹ ویئر فراہم کرتا ہے۔ یہ پالیسی بیان کرتی ہے کہ ہم کیا ذاتی ڈیٹا جمع کرتے ہیں، کیوں جمع کرتے ہیں، اور آپ کے کیا حقوق ہیں۔ یہ ہماری عوامی ویب سائٹ، کسٹمر ڈیش بورڈز، موبائل ایپس اور پیشنٹ پورٹلز پر لاگو ہے۔` },
      ar: { h: "مقدمة", body: `يقدم ${LEGAL_ENTITY.name} ("نحن") برامج إدارة المستشفيات لمنشآت الرعاية الصحية. توضح هذه السياسة البيانات الشخصية التي نجمعها وأسباب جمعها وحقوقك. تنطبق على موقعنا العام ولوحات تحكم العملاء وتطبيقات الهاتف وبوابات المرضى.` },
    },
    collect: {
      en: { h: "Information we collect", items: ["Account data: name, email, phone, role, organization.", "Protected Health Information (PHI): patient demographics, clinical notes, lab/imaging results, prescriptions, billing — processed only on behalf of the healthcare facility.", "Billing data: subscription tier, invoices, payment method tokens (handled by PCI-compliant processors).", "Device & log data: IP address, browser, device type, timestamps, audit events.", "Cookies and similar technologies for session, preferences and analytics."] },
      ur: { h: "ہم کیا معلومات جمع کرتے ہیں", items: ["اکاؤنٹ ڈیٹا: نام، ای میل، فون، کردار، ادارہ۔", "محفوظ صحت کی معلومات (PHI): مریض کی ڈیموگرافکس، طبی نوٹس، لیب/امیجنگ نتائج، نسخے، بلنگ — صرف صحت کی سہولت کی جانب سے۔", "بلنگ ڈیٹا: سبسکرپشن، انوائسز، ادائیگی کے ٹوکنز (PCI کمپلائنٹ پروسیسرز)۔", "ڈیوائس اور لاگ ڈیٹا: IP پتہ، براؤزر، ڈیوائس کی قسم، ٹائم اسٹیمپ، آڈٹ ایونٹس۔", "سیشن، ترجیحات اور تجزیات کے لیے کوکیز۔"] },
      ar: { h: "المعلومات التي نجمعها", items: ["بيانات الحساب: الاسم والبريد الإلكتروني والهاتف والدور والمؤسسة.", "المعلومات الصحية المحمية (PHI): بيانات المرضى الديموغرافية والملاحظات السريرية ونتائج المختبر/الأشعة والوصفات والفواتير — تتم معالجتها نيابة عن المنشأة الصحية فقط.", "بيانات الفوترة: مستوى الاشتراك والفواتير ورموز الدفع (تعالج بواسطة معالجات متوافقة مع PCI).", "بيانات الجهاز والسجلات: عنوان IP والمتصفح ونوع الجهاز والطوابع الزمنية وأحداث التدقيق.", "ملفات تعريف الارتباط للجلسة والتفضيلات والتحليلات."] },
    },
    use: {
      en: { h: "How we use information", items: ["Provide, secure and improve the platform.", "Process clinical, billing and operational workflows for healthcare facilities.", "Authenticate users, enforce access control and detect abuse.", "Comply with legal, regulatory and contractual obligations.", "Communicate service notices, security alerts and (with consent) product updates."] },
      ur: { h: "ہم معلومات کیسے استعمال کرتے ہیں", items: ["پلیٹ فارم فراہم، محفوظ اور بہتر کرنا۔", "صحت کی سہولیات کے لیے طبی، بلنگ اور آپریشنل ورک فلوز چلانا۔", "صارفین کی تصدیق، رسائی کنٹرول اور بدسلوکی کی روک تھام۔", "قانونی، ریگولیٹری اور معاہداتی ذمہ داریوں کی تعمیل۔", "سروس نوٹسز، سیکیورٹی الرٹس اور (رضامندی سے) پروڈکٹ اپڈیٹس۔"] },
      ar: { h: "كيف نستخدم المعلومات", items: ["تشغيل المنصة وتأمينها وتحسينها.", "تنفيذ سير العمل السريري والمحاسبي والتشغيلي لمنشآت الرعاية الصحية.", "مصادقة المستخدمين وفرض التحكم في الوصول ورصد الإساءة.", "الامتثال للالتزامات القانونية والتنظيمية والتعاقدية.", "إرسال إشعارات الخدمة والتنبيهات الأمنية وتحديثات المنتج (بموافقتك)."] },
    },
    bases: {
      en: { h: "Legal bases (GDPR, KSA PDPL)", body: "We process personal data based on: performance of a contract (with your healthcare facility), legitimate interests (platform security, fraud prevention), legal obligations (tax, healthcare regulations), and consent (marketing, optional cookies). For HIPAA-covered PHI we act as a Business Associate under a signed BAA with the covered entity." },
      ur: { h: "قانونی بنیادیں (GDPR، KSA PDPL)", body: "ہم ذاتی ڈیٹا کی پروسیسنگ کرتے ہیں: معاہدے کی انجام دہی، جائز مفادات (سیکیورٹی، دھوکہ دہی کی روک تھام)، قانونی ذمہ داریاں (ٹیکس، صحت کے ضوابط) اور رضامندی۔ HIPAA کے تحت PHI کے لیے ہم بزنس ایسوسی ایٹ ہیں۔" },
      ar: { h: "الأساس القانوني (GDPR، نظام حماية البيانات السعودي)", body: "نعالج البيانات الشخصية استنادًا إلى: تنفيذ العقد، والمصالح المشروعة (الأمن ومنع الاحتيال)، والالتزامات القانونية (الضرائب وأنظمة الرعاية الصحية)، والموافقة. بالنسبة للمعلومات الصحية الخاضعة لـ HIPAA، نعمل كشريك تجاري بموجب اتفاقية BAA موقعة." },
    },
    share: {
      en: { h: "Sharing & disclosure", items: ["With the healthcare facility that controls your data.", "Subprocessors that host or operate the platform under strict contracts (cloud hosting, email, SMS, payment gateways).", "Regulators or law enforcement when legally required.", "We do not sell personal data."] },
      ur: { h: "اشتراک اور افشاء", items: ["اس صحت کی سہولت کے ساتھ جو آپ کا ڈیٹا کنٹرول کرتی ہے۔", "سب پروسیسرز جو سخت معاہدات کے تحت پلیٹ فارم چلاتے ہیں۔", "ریگولیٹرز یا قانون نافذ کرنے والے ادارے جب قانونی طور پر ضروری ہو۔", "ہم ذاتی ڈیٹا فروخت نہیں کرتے۔"] },
      ar: { h: "المشاركة والإفصاح", items: ["مع المنشأة الصحية التي تتحكم في بياناتك.", "المعالجون الفرعيون الذين يستضيفون أو يشغلون المنصة بموجب عقود صارمة.", "الجهات التنظيمية أو إنفاذ القانون عند الاقتضاء قانونًا.", "نحن لا نبيع البيانات الشخصية."] },
    },
    retention: {
      en: { h: "Retention", body: "We retain personal data for as long as needed to provide the service and meet legal requirements (typically 7 years for clinical and financial records, per applicable healthcare regulations). On contract termination, customer data is exported on request and securely deleted within 30 days unless retention is legally required." },
      ur: { h: "برقراری", body: "ہم سروس فراہم کرنے اور قانونی تقاضوں کو پورا کرنے کے لیے ضرورت کے مطابق ڈیٹا رکھتے ہیں (عام طور پر طبی اور مالی ریکارڈز کے لیے 7 سال)۔ معاہدے کے خاتمے پر، کسٹمر ڈیٹا درخواست پر برآمد اور 30 دنوں کے اندر محفوظ طریقے سے حذف کیا جاتا ہے۔" },
      ar: { h: "الاحتفاظ", body: "نحتفظ بالبيانات الشخصية للمدة اللازمة لتقديم الخدمة وتلبية المتطلبات القانونية (عادةً 7 سنوات للسجلات السريرية والمالية). عند انتهاء العقد، يتم تصدير بيانات العميل عند الطلب وحذفها بشكل آمن في غضون 30 يومًا ما لم يكن الاحتفاظ مطلوبًا قانونًا." },
    },
    rights: {
      en: { h: "Your rights", items: ["Access, correct, port or delete your personal data.", "Object to or restrict certain processing.", "Withdraw consent at any time (without affecting prior processing).", "Lodge a complaint with your supervisory authority (e.g., SDAIA in KSA, your EU/EEA data protection authority).", `For PHI, contact your healthcare facility (the HIPAA Covered Entity) directly. For platform-level requests email ${LEGAL_ENTITY.privacyEmail}.`] },
      ur: { h: "آپ کے حقوق", items: ["اپنے ذاتی ڈیٹا تک رسائی، تصحیح، پورٹ یا حذف کریں۔", "بعض پروسیسنگ پر اعتراض یا پابندی۔", "کسی بھی وقت رضامندی واپس لیں۔", "اپنے ریگولیٹری ادارے کے پاس شکایت درج کریں (مثلاً KSA میں SDAIA)۔", `PHI کے لیے براہ راست اپنی صحت کی سہولت سے رابطہ کریں۔ پلیٹ فارم درخواستوں کے لیے ${LEGAL_ENTITY.privacyEmail} پر ای میل کریں۔`] },
      ar: { h: "حقوقك", items: ["الوصول إلى بياناتك الشخصية وتصحيحها ونقلها وحذفها.", "الاعتراض على معالجات معينة أو تقييدها.", "سحب الموافقة في أي وقت.", "تقديم شكوى إلى الجهة الإشرافية (مثل سدايا في المملكة العربية السعودية).", `للمعلومات الصحية، تواصل مباشرة مع منشأتك الصحية. لطلبات على مستوى المنصة، راسلنا على ${LEGAL_ENTITY.privacyEmail}.`] },
    },
    transfers: {
      en: { h: "International data transfers", body: "Data may be processed in the country where your healthcare facility operates or in regions hosting our platform infrastructure. We use Standard Contractual Clauses and equivalent safeguards for cross-border transfers." },
      ur: { h: "بین الاقوامی ڈیٹا کی منتقلی", body: "ڈیٹا اس ملک میں پروسیس ہو سکتا ہے جہاں آپ کی سہولت چلتی ہے یا جہاں ہمارا انفراسٹرکچر ہے۔ ہم سرحد پار منتقلی کے لیے معیاری معاہداتی شقیں اور مساوی تحفظات استعمال کرتے ہیں۔" },
      ar: { h: "نقل البيانات الدولي", body: "قد تتم معالجة البيانات في بلد منشأتك الصحية أو في المناطق التي تستضيف بنيتنا التحتية. نستخدم البنود التعاقدية القياسية وضمانات مماثلة لعمليات النقل عبر الحدود." },
    },
    contact: {
      en: { h: "Contact us", body: `${LEGAL_ENTITY.name} • ${LEGAL_ENTITY.address} • ${LEGAL_ENTITY.privacyEmail} • ${LEGAL_ENTITY.phone}` },
      ur: { h: "ہم سے رابطہ کریں", body: `${LEGAL_ENTITY.name} • ${LEGAL_ENTITY.address} • ${LEGAL_ENTITY.privacyEmail} • ${LEGAL_ENTITY.phone}` },
      ar: { h: "اتصل بنا", body: `${LEGAL_ENTITY.name} • ${LEGAL_ENTITY.address} • ${LEGAL_ENTITY.privacyEmail} • ${LEGAL_ENTITY.phone}` },
    },
  },
};

const PrivacyPolicyPage = () => {
  return (
    <LegalLayout
      titleByLang={T.title}
      taglineByLang={T.tagline}
      lastUpdated={LAST_UPDATED.privacy}
    >
      {(lang: LegalLang) => (
        <>
          <LegalSection heading={T.sections.intro[lang].h}><p>{T.sections.intro[lang].body}</p></LegalSection>
          <LegalSection heading={T.sections.collect[lang].h}><ul>{T.sections.collect[lang].items.map((i, idx) => <li key={idx}>{i}</li>)}</ul></LegalSection>
          <LegalSection heading={T.sections.use[lang].h}><ul>{T.sections.use[lang].items.map((i, idx) => <li key={idx}>{i}</li>)}</ul></LegalSection>
          <LegalSection heading={T.sections.bases[lang].h}><p>{T.sections.bases[lang].body}</p></LegalSection>
          <LegalSection heading={T.sections.share[lang].h}><ul>{T.sections.share[lang].items.map((i, idx) => <li key={idx}>{i}</li>)}</ul></LegalSection>
          <LegalSection heading={T.sections.retention[lang].h}><p>{T.sections.retention[lang].body}</p></LegalSection>
          <LegalSection heading={T.sections.rights[lang].h}><ul>{T.sections.rights[lang].items.map((i, idx) => <li key={idx}>{i}</li>)}</ul></LegalSection>
          <LegalSection heading={T.sections.transfers[lang].h}><p>{T.sections.transfers[lang].body}</p></LegalSection>
          <LegalSection heading={T.sections.contact[lang].h}><p>{T.sections.contact[lang].body}</p></LegalSection>
        </>
      )}
    </LegalLayout>
  );
};

export default PrivacyPolicyPage;
