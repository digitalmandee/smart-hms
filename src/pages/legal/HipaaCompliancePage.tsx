import { LegalLayout, LegalSection, LegalLang } from "@/components/legal/LegalLayout";
import { LEGAL_ENTITY, LAST_UPDATED } from "@/lib/legal-constants";

const T = {
  title: { en: "HIPAA Compliance", ur: "HIPAA تعمیل", ar: "الامتثال لـ HIPAA" },
  tagline: {
    en: `How ${LEGAL_ENTITY.name} supports HIPAA-covered entities in handling Protected Health Information.`,
    ur: `${LEGAL_ENTITY.name} HIPAA کے تحت اداروں کو PHI کی حفاظت میں کیسے مدد دیتا ہے۔`,
    ar: `كيف يدعم ${LEGAL_ENTITY.name} الكيانات الخاضعة لـ HIPAA في حماية المعلومات الصحية.`,
  },
  s: {
    role: {
      en: { h: "Our role", body: `When customers operating as HIPAA Covered Entities use ${LEGAL_ENTITY.name} to process PHI, we act as a Business Associate (BA). A Business Associate Agreement (BAA) is signed before any production PHI is processed.` },
      ur: { h: "ہمارا کردار", body: `جب HIPAA Covered Entities کے طور پر گاہک PHI پروسیس کرنے کے لیے ${LEGAL_ENTITY.name} استعمال کرتے ہیں، تو ہم بزنس ایسوسی ایٹ ہیں۔ کوئی بھی پروڈکشن PHI پروسیس کرنے سے پہلے BAA پر دستخط کیے جاتے ہیں۔` },
      ar: { h: "دورنا", body: `عندما يستخدم العملاء العاملون ككيانات خاضعة لـ HIPAA منصة ${LEGAL_ENTITY.name} لمعالجة المعلومات الصحية، فإننا نعمل كشريك تجاري. يتم توقيع اتفاقية BAA قبل معالجة أي معلومات صحية إنتاجية.` },
    },
    admin: {
      en: { h: "Administrative safeguards", items: ["Documented security policies and incident response plan.", "Workforce HIPAA training tracking and role-based attestation.", "Access reviews and least-privilege role assignment.", "Vendor and subprocessor risk assessments."] },
      ur: { h: "انتظامی تحفظات", items: ["دستاویزی سیکیورٹی پالیسیاں اور انسیڈنٹ ریسپانس پلان۔", "ورک فورس HIPAA ٹریننگ کی ٹریکنگ۔", "رسائی کے جائزے اور کم ترین مراعات۔", "وینڈر اور سب پروسیسر رسک اسیسمنٹس۔"] },
      ar: { h: "الضمانات الإدارية", items: ["سياسات أمنية موثقة وخطة الاستجابة للحوادث.", "تتبع تدريب الموظفين على HIPAA.", "مراجعات الوصول وتعيين الأدوار بأقل الامتيازات.", "تقييمات مخاطر البائعين والمعالجين الفرعيين."] },
    },
    physical: {
      en: { h: "Physical safeguards", items: ["Cloud hosting in ISO 27001 / SOC 2 certified data centers.", "Restricted physical access (provider-managed).", "Secure media handling and disposal."] },
      ur: { h: "جسمانی تحفظات", items: ["ISO 27001 / SOC 2 سرٹیفائیڈ ڈیٹا سینٹرز میں ہوسٹنگ۔", "جسمانی رسائی کی پابندی۔", "محفوظ میڈیا ہینڈلنگ اور نمٹانا۔"] },
      ar: { h: "الضمانات المادية", items: ["استضافة سحابية في مراكز بيانات معتمدة ISO 27001 / SOC 2.", "تقييد الوصول المادي.", "معالجة وإتلاف الوسائط بشكل آمن."] },
    },
    technical: {
      en: { h: "Technical safeguards", items: ["Encryption at rest (AES-256) and in transit (TLS 1.3).", "Multi-factor authentication (TOTP) with optional enforcement.", "Row-Level Security and security-definer access checks on PHI tables.", "PHI field masking in list views and exports.", "Idle session timeout and auto sign-out.", "Comprehensive PHI access and export audit logs.", "Daily encrypted backups with 30-day retention."] },
      ur: { h: "تکنیکی تحفظات", items: ["ریسٹ پر (AES-256) اور ٹرانزٹ میں (TLS 1.3) خفیہ کاری۔", "ملٹی فیکٹر آتھنٹیکیشن۔", "Row-Level Security اور PHI ٹیبلز پر چیکس۔", "PHI فیلڈ ماسکنگ۔", "آئیڈل سیشن ٹائم آؤٹ۔", "PHI رسائی کے جامع آڈٹ لاگز۔", "روزانہ خفیہ بیک اپس 30 دن تک۔"] },
      ar: { h: "الضمانات التقنية", items: ["تشفير في حالة السكون (AES-256) وأثناء النقل (TLS 1.3).", "المصادقة متعددة العوامل.", "أمان على مستوى الصف وفحوصات على جداول PHI.", "إخفاء حقول PHI في القوائم.", "انتهاء مهلة الجلسة الخاملة.", "سجلات تدقيق شاملة للوصول إلى PHI.", "نسخ احتياطية يومية مشفرة لمدة 30 يومًا."] },
    },
    breach: {
      en: { h: "Breach notification", body: "We maintain a documented breach response workflow with a 60-day notification deadline to the Covered Entity (and HHS where applicable), affected-individual tracking and forensic logging." },
      ur: { h: "خلاف ورزی کی اطلاع", body: "ہم 60 دن کی نوٹیفکیشن ڈیڈ لائن کے ساتھ خلاف ورزی کا جواب دینے کا دستاویزی ورک فلو رکھتے ہیں۔" },
      ar: { h: "إشعار الخرق", body: "نحتفظ بسير عمل موثق للاستجابة للخروقات مع موعد نهائي للإشعار خلال 60 يومًا للجهة المخولة." },
    },
    rights: {
      en: { h: "Patient rights", body: "Patients exercise HIPAA rights (access, amendment, accounting of disclosures, restriction requests) through the Covered Entity. Our platform provides the technical workflows the Covered Entity needs to respond within HIPAA timelines." },
      ur: { h: "مریض کے حقوق", body: "مریض HIPAA حقوق (رسائی، ترمیم، افشاء کا حساب کتاب، پابندی کی درخواستیں) Covered Entity کے ذریعے استعمال کرتے ہیں۔" },
      ar: { h: "حقوق المريض", body: "يمارس المرضى حقوق HIPAA (الوصول والتعديل وحساب الإفصاحات وطلبات التقييد) من خلال الكيان المخول." },
    },
    contact: {
      en: { h: "Contact / BAA requests", body: `For BAA requests or HIPAA-related questions: ${LEGAL_ENTITY.privacyEmail}.` },
      ur: { h: "رابطہ / BAA درخواستیں", body: `BAA درخواستوں یا HIPAA سوالات کے لیے: ${LEGAL_ENTITY.privacyEmail}۔` },
      ar: { h: "الاتصال / طلبات BAA", body: `لطلبات BAA أو الأسئلة المتعلقة بـ HIPAA: ${LEGAL_ENTITY.privacyEmail}.` },
    },
  },
};

const HipaaCompliancePage = () => (
  <LegalLayout titleByLang={T.title} taglineByLang={T.tagline} lastUpdated={LAST_UPDATED.hipaa}>
    {(lang: LegalLang) => (
      <>
        <LegalSection heading={T.s.role[lang].h}><p>{T.s.role[lang].body}</p></LegalSection>
        {(["admin", "physical", "technical"] as const).map((k) => (
          <LegalSection key={k} heading={T.s[k][lang].h}>
            <ul>{T.s[k][lang].items.map((i, idx) => <li key={idx}>{i}</li>)}</ul>
          </LegalSection>
        ))}
        {(["breach", "rights", "contact"] as const).map((k) => (
          <LegalSection key={k} heading={T.s[k][lang].h}><p>{T.s[k][lang].body}</p></LegalSection>
        ))}
      </>
    )}
  </LegalLayout>
);

export default HipaaCompliancePage;
