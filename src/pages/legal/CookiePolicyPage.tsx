import { LegalLayout, LegalSection, LegalLang } from "@/components/legal/LegalLayout";
import { LEGAL_ENTITY, LAST_UPDATED } from "@/lib/legal-constants";

const T = {
  title: {
    en: "Cookie Policy",
    ur: "کوکی پالیسی",
    ar: "سياسة ملفات تعريف الارتباط",
  },
  tagline: {
    en: `How ${LEGAL_ENTITY.name} uses cookies and similar technologies on our websites and platform.`,
    ur: `${LEGAL_ENTITY.name} اپنی ویب سائٹس اور پلیٹ فارم پر کوکیز اور اسی طرح کی ٹیکنالوجیز کیسے استعمال کرتا ہے۔`,
    ar: `كيف يستخدم ${LEGAL_ENTITY.name} ملفات تعريف الارتباط والتقنيات المماثلة على مواقعنا ومنصتنا.`,
  },
  s: {
    what: {
      en: { h: "What are cookies?", body: "Cookies are small text files placed on your device when you visit a website. They are widely used to make websites work, improve performance, and provide information to site owners. Similar technologies (local storage, pixels, SDKs) work the same way for the purposes of this policy." },
      ur: { h: "کوکیز کیا ہیں؟", body: "کوکیز چھوٹی ٹیکسٹ فائلیں ہیں جو آپ کے ڈیوائس پر محفوظ ہوتی ہیں جب آپ کسی ویب سائٹ کا دورہ کرتے ہیں۔ یہ ویب سائٹ کو چلانے، کارکردگی بہتر بنانے اور سائٹ مالکان کو معلومات فراہم کرنے کے لیے استعمال ہوتی ہیں۔" },
      ar: { h: "ما هي ملفات تعريف الارتباط؟", body: "ملفات تعريف الارتباط هي ملفات نصية صغيرة يتم وضعها على جهازك عند زيارة موقع ويب. يتم استخدامها لتشغيل المواقع وتحسين الأداء وتزويد مالكي المواقع بالمعلومات." },
    },
    types: {
      en: {
        h: "Types of cookies we use",
        items: [
          "Strictly necessary — required for sign-in, session security, language and CSRF protection. Cannot be disabled.",
          "Functional — remember preferences such as language, theme and last selected branch.",
          "Analytics — help us understand how the platform is used so we can improve it. Aggregated only, set only with your consent.",
          "Performance — measure load time and error rates. Set only with your consent.",
        ],
      },
      ur: {
        h: "ہم جو کوکیز استعمال کرتے ہیں",
        items: [
          "لازمی — لاگ ان، سیشن سیکیورٹی، زبان اور CSRF تحفظ کے لیے ضروری۔ غیر فعال نہیں کی جا سکتیں۔",
          "فنکشنل — زبان، تھیم اور آخری منتخب برانچ جیسی ترجیحات یاد رکھتی ہیں۔",
          "تجزیاتی — پلیٹ فارم کے استعمال کو سمجھنے میں مدد دیتی ہیں۔ صرف آپ کی رضامندی سے سیٹ ہوتی ہیں۔",
          "کارکردگی — لوڈ وقت اور ایرر کی شرح کی پیمائش۔ صرف رضامندی سے۔",
        ],
      },
      ar: {
        h: "أنواع ملفات تعريف الارتباط التي نستخدمها",
        items: [
          "ضرورية تمامًا — مطلوبة لتسجيل الدخول وأمان الجلسة واللغة وحماية CSRF. لا يمكن تعطيلها.",
          "وظيفية — تذكر التفضيلات مثل اللغة والمظهر والفرع المختار.",
          "تحليلية — تساعدنا في فهم كيفية استخدام المنصة. يتم تعيينها فقط بموافقتك.",
          "أداء — قياس وقت التحميل ومعدلات الأخطاء. يتم تعيينها فقط بموافقتك.",
        ],
      },
    },
    third: {
      en: { h: "Third-party cookies", body: "Some cookies may be set by trusted third parties used to deliver our service (for example, our authentication, hosting, payment and analytics providers). These providers are bound by data processing agreements and may not use the data for their own purposes." },
      ur: { h: "تھرڈ پارٹی کوکیز", body: "کچھ کوکیز قابل اعتماد تھرڈ پارٹیز کی طرف سے سیٹ کی جا سکتی ہیں جو ہماری سروس فراہم کرنے کے لیے استعمال ہوتی ہیں (مثلاً تصدیق، ہوسٹنگ، ادائیگی اور تجزیات فراہم کنندگان)۔" },
      ar: { h: "ملفات تعريف الارتباط للأطراف الثالثة", body: "قد يتم تعيين بعض ملفات تعريف الارتباط من قبل أطراف ثالثة موثوقة تستخدم لتقديم خدمتنا (مثل مزودي المصادقة والاستضافة والدفع والتحليلات)." },
    },
    manage: {
      en: { h: "Managing your choices", body: `You can accept or reject non-essential cookies any time using the cookie banner. Most browsers also allow you to block or delete cookies in their settings. Blocking strictly necessary cookies may prevent you from signing in or using parts of the platform. To revisit your choice, clear cookies for this site or contact ${LEGAL_ENTITY.privacyEmail}.` },
      ur: { h: "اپنی ترجیحات کا انتظام", body: `آپ کوکی بینر کے ذریعے کسی بھی وقت غیر ضروری کوکیز کو قبول یا مسترد کر سکتے ہیں۔ زیادہ تر براؤزرز سیٹنگز میں کوکیز کو بلاک یا حذف کرنے کی اجازت دیتے ہیں۔ مزید معلومات: ${LEGAL_ENTITY.privacyEmail}` },
      ar: { h: "إدارة خياراتك", body: `يمكنك قبول أو رفض ملفات تعريف الارتباط غير الضرورية في أي وقت من خلال شريط ملفات تعريف الارتباط. تسمح معظم المتصفحات أيضًا بحظر ملفات تعريف الارتباط أو حذفها. للمزيد: ${LEGAL_ENTITY.privacyEmail}` },
    },
    contact: {
      en: { h: "Contact", body: `Questions about this Cookie Policy? Email ${LEGAL_ENTITY.privacyEmail}.` },
      ur: { h: "رابطہ", body: `اس کوکی پالیسی کے بارے میں سوالات؟ ای میل کریں: ${LEGAL_ENTITY.privacyEmail}` },
      ar: { h: "اتصل بنا", body: `أسئلة حول سياسة ملفات تعريف الارتباط؟ راسلنا: ${LEGAL_ENTITY.privacyEmail}` },
    },
  },
};

const CookiePolicyPage = () => (
  <LegalLayout titleByLang={T.title} taglineByLang={T.tagline} lastUpdated={LAST_UPDATED.cookies ?? LAST_UPDATED.privacy}>
    {(lang: LegalLang) => (
      <>
        <LegalSection heading={T.s.what[lang].h}><p>{T.s.what[lang].body}</p></LegalSection>
        <LegalSection heading={T.s.types[lang].h}>
          <ul>{T.s.types[lang].items.map((i, idx) => <li key={idx}>{i}</li>)}</ul>
        </LegalSection>
        {(["third", "manage", "contact"] as const).map((k) => (
          <LegalSection key={k} heading={T.s[k][lang].h}><p>{T.s[k][lang].body}</p></LegalSection>
        ))}
      </>
    )}
  </LegalLayout>
);

export default CookiePolicyPage;
