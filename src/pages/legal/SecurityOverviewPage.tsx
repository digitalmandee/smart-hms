import { LegalLayout, LegalSection, LegalLang } from "@/components/legal/LegalLayout";
import { LEGAL_ENTITY, LAST_UPDATED } from "@/lib/legal-constants";

const T = {
  title: { en: "Security Overview", ur: "سیکیورٹی کا جائزہ", ar: "نظرة عامة على الأمان" },
  tagline: {
    en: `How ${LEGAL_ENTITY.name} protects customer data across infrastructure, application and operations.`,
    ur: `${LEGAL_ENTITY.name} انفراسٹرکچر، ایپلی کیشن اور آپریشنز میں ڈیٹا کی حفاظت کیسے کرتا ہے۔`,
    ar: `كيف يحمي ${LEGAL_ENTITY.name} بيانات العملاء عبر البنية التحتية والتطبيقات والعمليات.`,
  },
  s: {
    encryption: {
      en: { h: "Encryption", items: ["TLS 1.3 for all data in transit.", "AES-256 encryption at rest for databases, backups and object storage.", "Signed URLs and short-lived tokens for file access."] },
      ur: { h: "خفیہ کاری", items: ["تمام ٹرانزٹ ڈیٹا کے لیے TLS 1.3۔", "ڈیٹا بیس، بیک اپس اور آبجیکٹ اسٹوریج کے لیے AES-256۔", "فائل رسائی کے لیے دستخط شدہ URLs۔"] },
      ar: { h: "التشفير", items: ["TLS 1.3 لجميع البيانات أثناء النقل.", "تشفير AES-256 أثناء السكون لقواعد البيانات والنسخ الاحتياطية.", "روابط موقعة ورموز قصيرة العمر للوصول إلى الملفات."] },
    },
    access: {
      en: { h: "Access control", items: ["Row-Level Security (RLS) on every PHI table.", "Branch / organization isolation with security-definer policies.", "Role-based permissions with separate user_roles table (no role storage on profiles).", "Optional Multi-Factor Authentication (TOTP) with recovery codes."] },
      ur: { h: "رسائی کنٹرول", items: ["ہر PHI ٹیبل پر Row-Level Security۔", "برانچ / تنظیمی تنہائی۔", "علیحدہ user_roles ٹیبل کے ساتھ کردار پر مبنی اجازتیں۔", "اختیاری MFA (TOTP) ریکوری کوڈز کے ساتھ۔"] },
      ar: { h: "التحكم في الوصول", items: ["أمان على مستوى الصف (RLS) على كل جدول PHI.", "عزل الفرع / المؤسسة بسياسات security-definer.", "أذونات قائمة على الأدوار مع جدول user_roles منفصل.", "مصادقة متعددة العوامل اختيارية (TOTP) مع رموز الاسترداد."] },
    },
    audit: {
      en: { h: "Auditing & monitoring", items: ["PHI access logging with immutable trail.", "Export audit trail for compliance reporting.", "Session activity tracking and idle timeout (clinical and admin).", "Realtime security with RLS-enforced channels."] },
      ur: { h: "آڈٹ اور نگرانی", items: ["PHI رسائی کی لاگنگ۔", "تعمیل رپورٹنگ کے لیے ایکسپورٹ آڈٹ ٹریل۔", "سیشن کی سرگرمی اور آئیڈل ٹائم آؤٹ۔", "RLS کے ساتھ ریئل ٹائم سیکیورٹی۔"] },
      ar: { h: "التدقيق والمراقبة", items: ["تسجيل الوصول إلى PHI بمسار غير قابل للتعديل.", "مسار تدقيق التصدير لتقارير الامتثال.", "تتبع نشاط الجلسة وانتهاء المهلة.", "أمان في الوقت الفعلي مع قنوات RLS."] },
    },
    infra: {
      en: { h: "Infrastructure", items: ["Cloud-hosted in ISO 27001 / SOC 2 certified data centers.", "CORS domain allowlist and private storage buckets by default.", "Edge function allowlist for unauthenticated endpoints.", "Daily encrypted automated backups with 30-day retention."] },
      ur: { h: "انفراسٹرکچر", items: ["ISO 27001 / SOC 2 سرٹیفائیڈ ڈیٹا سینٹرز۔", "CORS ڈومین الاؤ لسٹ اور پرائیویٹ اسٹوریج بکٹس۔", "غیر مجاز اینڈ پوائنٹس کے لیے ایج فنکشن الاؤ لسٹ۔", "روزانہ خفیہ بیک اپس 30 دن تک۔"] },
      ar: { h: "البنية التحتية", items: ["استضافة سحابية معتمدة ISO 27001 / SOC 2.", "قائمة السماح لنطاق CORS وحاويات تخزين خاصة افتراضيًا.", "قائمة السماح لوظائف الحافة للنقاط غير المصادق عليها.", "نسخ احتياطية يومية مشفرة لمدة 30 يومًا."] },
    },
    sdlc: {
      en: { h: "Secure development", items: ["Code review and automated linting (including Supabase linter) before deployment.", "Dependency vulnerability scanning.", "DOMPurify sanitization for any user-provided HTML.", "Idempotent database triggers protect financial postings from duplication."] },
      ur: { h: "محفوظ ڈویلپمنٹ", items: ["تعیناتی سے پہلے کوڈ ریویو اور آٹومیٹڈ لنٹنگ۔", "انحصار کی کمزوری اسکیننگ۔", "صارف کے فراہم کردہ HTML کے لیے DOMPurify۔", "Idempotent ڈیٹا بیس ٹرگرز۔"] },
      ar: { h: "تطوير آمن", items: ["مراجعة الكود وفحص آلي قبل النشر.", "فحص نقاط الضعف للتبعيات.", "DOMPurify لتعقيم أي HTML من المستخدم.", "محفزات قاعدة بيانات Idempotent."] },
    },
    bcp: {
      en: { h: "Business continuity", body: "Encrypted daily backups with 30-day retention. Documented disaster recovery procedures and annual DR drills." },
      ur: { h: "کاروباری تسلسل", body: "روزانہ خفیہ بیک اپس 30 دن تک۔ دستاویزی ڈیزاسٹر ریکوری اور سالانہ مشقیں۔" },
      ar: { h: "استمرارية الأعمال", body: "نسخ احتياطية يومية مشفرة لمدة 30 يومًا. إجراءات استرداد كوارث موثقة وتدريبات سنوية." },
    },
    disclosure: {
      en: { h: "Vulnerability disclosure", body: `Report security issues to ${LEGAL_ENTITY.privacyEmail}. We acknowledge within 2 business days and coordinate responsible disclosure. Please do not test against production data.` },
      ur: { h: "کمزوری کا انکشاف", body: `سیکیورٹی مسائل ${LEGAL_ENTITY.privacyEmail} پر رپورٹ کریں۔ ہم 2 کاروباری دنوں میں جواب دیتے ہیں۔` },
      ar: { h: "الإفصاح عن الثغرات", body: `أبلغ عن المشكلات الأمنية إلى ${LEGAL_ENTITY.privacyEmail}. نرد خلال يومي عمل وننسق الإفصاح المسؤول.` },
    },
  },
};

const SecurityOverviewPage = () => (
  <LegalLayout titleByLang={T.title} taglineByLang={T.tagline} lastUpdated={LAST_UPDATED.security}>
    {(lang: LegalLang) => (
      <>
        {(["encryption", "access", "audit", "infra", "sdlc"] as const).map((k) => (
          <LegalSection key={k} heading={T.s[k][lang].h}>
            <ul>{T.s[k][lang].items.map((i, idx) => <li key={idx}>{i}</li>)}</ul>
          </LegalSection>
        ))}
        {(["bcp", "disclosure"] as const).map((k) => (
          <LegalSection key={k} heading={T.s[k][lang].h}><p>{T.s[k][lang].body}</p></LegalSection>
        ))}
      </>
    )}
  </LegalLayout>
);

export default SecurityOverviewPage;
