import { LegalLayout, LegalSection, LegalLang } from "@/components/legal/LegalLayout";
import { LEGAL_ENTITY, LAST_UPDATED } from "@/lib/legal-constants";

const T = {
  title: { en: "Terms of Service", ur: "خدمت کی شرائط", ar: "شروط الخدمة" },
  tagline: {
    en: `The terms governing your use of ${LEGAL_ENTITY.name}.`,
    ur: `${LEGAL_ENTITY.name} کے استعمال کی شرائط۔`,
    ar: `الشروط التي تحكم استخدامك لـ ${LEGAL_ENTITY.name}.`,
  },
  s: {
    accept: {
      en: { h: "1. Acceptance", body: `By accessing or using ${LEGAL_ENTITY.name} ("Service"), you agree to these Terms. If you accept on behalf of an organization, you confirm you have authority to bind that organization.` },
      ur: { h: "1. قبولیت", body: `${LEGAL_ENTITY.name} ("سروس") تک رسائی یا استعمال سے، آپ ان شرائط سے اتفاق کرتے ہیں۔ اگر آپ کسی ادارے کی جانب سے قبول کرتے ہیں، تو آپ اس ادارے کو پابند کرنے کا اختیار رکھتے ہیں۔` },
      ar: { h: "1. القبول", body: `بدخولك أو استخدامك لـ ${LEGAL_ENTITY.name} ("الخدمة")، فإنك توافق على هذه الشروط. إذا قبلت نيابة عن مؤسسة، فإنك تؤكد أن لديك صلاحية إلزام تلك المؤسسة.` },
    },
    accounts: {
      en: { h: "2. Accounts & eligibility", body: "You must provide accurate information, keep credentials confidential and notify us of unauthorized access. Accounts may only be used by individuals authorized by the customer organization." },
      ur: { h: "2. اکاؤنٹس اور اہلیت", body: "آپ کو درست معلومات فراہم کرنی ہوں گی، اسناد کو خفیہ رکھنا ہو گا، اور غیر مجاز رسائی کی اطلاع دینی ہوگی۔ اکاؤنٹس صرف مجاز افراد استعمال کر سکتے ہیں۔" },
      ar: { h: "2. الحسابات والأهلية", body: "يجب عليك تقديم معلومات دقيقة والحفاظ على سرية بيانات الاعتماد وإبلاغنا بالوصول غير المصرح به. لا يجوز استخدام الحسابات إلا من قبل الأفراد المخولين من قبل مؤسسة العميل." },
    },
    billing: {
      en: { h: "3. Subscription & billing", body: "Fees are invoiced based on your subscription plan and usage. Payments are due per invoice terms. Late payments may result in suspension. Refunds are governed by your order form or Master Service Agreement (MSA)." },
      ur: { h: "3. سبسکرپشن اور بلنگ", body: "فیس آپ کے پلان اور استعمال کی بنیاد پر چارج کی جاتی ہے۔ ادائیگیاں انوائس کی شرائط کے مطابق ہیں۔ تاخیر سے ادائیگی سروس معطل کر سکتی ہے۔" },
      ar: { h: "3. الاشتراك والفوترة", body: "تُفرض الرسوم وفقًا لخطة الاشتراك والاستخدام. الدفعات مستحقة وفق شروط الفاتورة. قد تؤدي المدفوعات المتأخرة إلى التعليق." },
    },
    use: {
      en: { h: "4. Acceptable use", items: ["No unlawful, infringing or harmful activity.", "No reverse engineering or unauthorized access attempts.", "No upload of malware or interference with platform integrity.", "Use of PHI must comply with HIPAA, KSA PDPL, GDPR and other applicable laws."] },
      ur: { h: "4. قابل قبول استعمال", items: ["کوئی غیر قانونی یا نقصان دہ سرگرمی نہیں۔", "ریورس انجینیئرنگ یا غیر مجاز رسائی کی کوششیں نہیں۔", "میلویئر اپ لوڈ یا پلیٹ فارم میں مداخلت نہیں۔", "PHI کا استعمال HIPAA، KSA PDPL، GDPR کی تعمیل کرتا ہے۔"] },
      ar: { h: "4. الاستخدام المقبول", items: ["لا أنشطة غير قانونية أو ضارة.", "لا هندسة عكسية أو محاولات وصول غير مصرح بها.", "لا تحميل برامج ضارة أو التدخل في سلامة المنصة.", "يجب أن يمتثل استخدام المعلومات الصحية لـ HIPAA ونظام حماية البيانات السعودي وGDPR."] },
    },
    data: {
      en: { h: "5. Data ownership", body: "Customer retains all rights to its data, including PHI. We process customer data only to provide the Service, per the Privacy Policy and any signed Business Associate Agreement (BAA). On termination, customer data is available for export for 30 days." },
      ur: { h: "5. ڈیٹا کی ملکیت", body: "گاہک اپنے تمام ڈیٹا کے حقوق برقرار رکھتا ہے، بشمول PHI۔ ہم گاہک کا ڈیٹا صرف سروس فراہم کرنے کے لیے پروسیس کرتے ہیں۔ معاہدے کے خاتمے پر، گاہک کا ڈیٹا 30 دن تک برآمد کے لیے دستیاب ہے۔" },
      ar: { h: "5. ملكية البيانات", body: "يحتفظ العميل بجميع الحقوق في بياناته بما في ذلك المعلومات الصحية. نعالج بيانات العميل فقط لتقديم الخدمة. عند الإنهاء، تبقى بيانات العميل متاحة للتصدير لمدة 30 يومًا." },
    },
    ip: {
      en: { h: "6. Intellectual property", body: `${LEGAL_ENTITY.name} retains all rights, title and interest in the platform, software, documentation and trademarks. Feedback may be used to improve the Service without obligation.` },
      ur: { h: "6. دانشورانہ املاک", body: `${LEGAL_ENTITY.name} پلیٹ فارم، سافٹ ویئر، دستاویزات اور ٹریڈ مارکس کے تمام حقوق برقرار رکھتا ہے۔ فیڈ بیک سروس کو بہتر بنانے کے لیے استعمال ہو سکتا ہے۔` },
      ar: { h: "6. الملكية الفكرية", body: `يحتفظ ${LEGAL_ENTITY.name} بجميع الحقوق في المنصة والبرامج والتوثيق والعلامات التجارية. قد تُستخدم الملاحظات لتحسين الخدمة.` },
    },
    warranty: {
      en: { h: "7. Warranty disclaimer", body: "The Service is provided \"as is\" without warranties of any kind. The Service does not provide medical advice; clinical decisions remain the responsibility of licensed healthcare professionals." },
      ur: { h: "7. ضمانت سے انکار", body: "سروس \"جیسی ہے\" فراہم کی جاتی ہے بغیر کسی ضمانت کے۔ سروس طبی مشورہ فراہم نہیں کرتی؛ طبی فیصلے لائسنس یافتہ پیشہ ور افراد کی ذمہ داری ہیں۔" },
      ar: { h: "7. إخلاء المسؤولية", body: "تُقدم الخدمة \"كما هي\" دون أي ضمانات. لا تقدم الخدمة استشارات طبية؛ تظل القرارات السريرية مسؤولية المهنيين الصحيين المرخصين." },
    },
    liability: {
      en: { h: "8. Limitation of liability", body: "To the maximum extent permitted by law, our aggregate liability is limited to fees paid in the 12 months preceding the claim. We are not liable for indirect, incidental or consequential damages." },
      ur: { h: "8. ذمہ داری کی حد", body: "قانون کی زیادہ سے زیادہ حد تک، ہماری مجموعی ذمہ داری دعوے سے پہلے 12 ماہ میں ادا کی گئی فیس تک محدود ہے۔" },
      ar: { h: "8. حدود المسؤولية", body: "إلى أقصى حد يسمح به القانون، تقتصر مسؤوليتنا الإجمالية على الرسوم المدفوعة خلال 12 شهرًا السابقة للمطالبة." },
    },
    term: {
      en: { h: "9. Term & termination", body: "Either party may terminate per the order form / MSA. We may suspend access for non-payment, breach or security risk. Sections that by nature survive (IP, liability, confidentiality) continue after termination." },
      ur: { h: "9. مدت اور خاتمہ", body: "کوئی بھی فریق آرڈر فارم / MSA کے مطابق معاہدہ ختم کر سکتا ہے۔ ہم عدم ادائیگی، خلاف ورزی یا سیکیورٹی خطرے پر رسائی معطل کر سکتے ہیں۔" },
      ar: { h: "9. المدة والإنهاء", body: "يجوز لأي طرف الإنهاء وفق نموذج الطلب / اتفاقية الخدمة الرئيسية. يجوز لنا تعليق الوصول بسبب عدم الدفع أو الانتهاك أو المخاطر الأمنية." },
    },
    law: {
      en: { h: "10. Governing law", body: "These Terms are governed by the laws applicable to the jurisdiction of your contracting entity (specified in your order form / MSA). Disputes will be resolved per the dispute-resolution clauses of that agreement." },
      ur: { h: "10. حاکم قانون", body: "یہ شرائط آپ کے معاہداتی ادارے کے دائرہ اختیار کے قوانین کے تابع ہیں (آرڈر فارم میں مذکور)۔" },
      ar: { h: "10. القانون الحاكم", body: "تخضع هذه الشروط للقوانين المعمول بها في الولاية القضائية للمؤسسة المتعاقدة (المحددة في نموذج الطلب)." },
    },
    contact: {
      en: { h: "11. Contact", body: `${LEGAL_ENTITY.name} • ${LEGAL_ENTITY.address} • ${LEGAL_ENTITY.legalEmail} • ${LEGAL_ENTITY.phone}` },
      ur: { h: "11. رابطہ", body: `${LEGAL_ENTITY.name} • ${LEGAL_ENTITY.address} • ${LEGAL_ENTITY.legalEmail} • ${LEGAL_ENTITY.phone}` },
      ar: { h: "11. اتصل", body: `${LEGAL_ENTITY.name} • ${LEGAL_ENTITY.address} • ${LEGAL_ENTITY.legalEmail} • ${LEGAL_ENTITY.phone}` },
    },
  },
};

const TermsOfServicePage = () => (
  <LegalLayout titleByLang={T.title} taglineByLang={T.tagline} lastUpdated={LAST_UPDATED.terms}>
    {(lang: LegalLang) => (
      <>
        {(["accept", "accounts", "billing"] as const).map((k) => (
          <LegalSection key={k} heading={T.s[k][lang].h}><p>{T.s[k][lang].body}</p></LegalSection>
        ))}
        <LegalSection heading={T.s.use[lang].h}><ul>{T.s.use[lang].items.map((i, idx) => <li key={idx}>{i}</li>)}</ul></LegalSection>
        {(["data", "ip", "warranty", "liability", "term", "law", "contact"] as const).map((k) => (
          <LegalSection key={k} heading={T.s[k][lang].h}><p>{T.s[k][lang].body}</p></LegalSection>
        ))}
      </>
    )}
  </LegalLayout>
);

export default TermsOfServicePage;
