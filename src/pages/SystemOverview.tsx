export default function SystemOverview() {
  return (
    <div className="min-h-screen bg-background text-foreground" dir="auto">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        
        {/* Header */}
        <header className="space-y-4 border-b border-border pb-8">
          <h1 className="text-4xl font-bold tracking-tight">Smart HMS — Complete System Overview</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            A comprehensive Hospital Management System covering clinical, administrative, financial, and ancillary operations — built for hospitals, clinics, and multi-branch healthcare organizations.
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl" dir="rtl">
            ایک مکمل ہسپتال مینجمنٹ سسٹم جو طبی، انتظامی، مالیاتی اور معاون خدمات کا احاطہ کرتا ہے — ہسپتالوں، کلینکس اور ملٹی برانچ ہیلتھ کیئر اداروں کے لیے۔
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl" dir="rtl">
            نظام إدارة مستشفيات شامل يغطي العمليات السريرية والإدارية والمالية والمساعدة — مصمم للمستشفيات والعيادات ومنظمات الرعاية الصحية متعددة الفروع.
          </p>
        </header>

        {/* ========== CORE MODULES ========== */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">1. Core Modules (أساسی ماڈیولز / الوحدات الأساسية)</h2>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">1.1 Patient Management (مریض کا انتظام / إدارة المرضى)</h3>
            <p>Complete patient registration with demographics, contact details, insurance information, and medical history. Unique MR numbers are auto-generated per organization. Supports guardian information for minors, CNIC/NIC-based lookup, and patient search by name, phone, or MR number. Patient profiles include visit history, billing summary, lab results, and prescriptions all in one place.</p>
            <p dir="rtl">مکمل مریض رجسٹریشن جس میں آبادیاتی معلومات، رابطے کی تفصیلات، انشورنس کی معلومات، اور طبی تاریخ شامل ہے۔ MR نمبر خودکار طریقے سے تیار ہوتے ہیں۔</p>
            <p dir="rtl">تسجيل كامل للمرضى يشمل البيانات الديموغرافية ومعلومات الاتصال والتأمين والتاريخ الطبي. يتم إنشاء أرقام الملفات الطبية تلقائياً.</p>
          </article>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">1.2 Appointments & Queue Management (اپائنٹمنٹ اور قطار کا انتظام / المواعيد وإدارة الطوابير)</h3>
            <p>Appointment scheduling with date, time, doctor selection, and appointment type (new visit, follow-up, referral, walk-in). Automatic token number generation per doctor per day. Queue management with real-time status tracking (waiting, in-progress, completed, no-show). Self-service kiosk support for patient check-in with token printing. Public queue display screens for waiting rooms. Priority-based queue ordering. Check-in workflow with vitals recording, chief complaint capture, and payment verification.</p>
            <p dir="rtl">اپائنٹمنٹ شیڈولنگ جس میں تاریخ، وقت، ڈاکٹر کا انتخاب شامل ہے۔ خودکار ٹوکن نمبر، ریئل ٹائم قطار ٹریکنگ، سیلف سروس کیوسک، اور پبلک ڈسپلے اسکرینز۔</p>
            <p dir="rtl">جدولة المواعيد مع اختيار التاريخ والوقت والطبيب. أرقام رموز تلقائية وتتبع الطوابير في الوقت الفعلي وأكشاك الخدمة الذاتية وشاشات العرض العامة.</p>
          </article>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">1.3 OPD / Consultations (او پی ڈی / مشاورت / العيادات الخارجية)</h3>
            <p>Full outpatient consultation workflow: doctor queue with patient list, clinical notes with SOAP format, diagnosis recording (ICD-10 support), prescription writing with medicine search, dosage, frequency, and duration. Follow-up scheduling. Referral to specialists or departments. Integration with lab orders, imaging orders, and pharmacy for direct prescription fulfillment. Consultation history view per patient. Vital signs recording during consultation. Templates for common diagnoses and prescriptions.</p>
            <p dir="rtl">مکمل او پی ڈی ورک فلو: ڈاکٹر کیو، SOAP فارمیٹ میں کلینیکل نوٹس، تشخیص، نسخہ لکھنا، فالو اپ شیڈولنگ، لیب اور ریڈیالوجی آرڈرز۔</p>
            <p dir="rtl">سير عمل كامل للعيادات الخارجية: قائمة انتظار الطبيب، ملاحظات سريرية بتنسيق SOAP، التشخيص، كتابة الوصفات، جدولة المتابعة، طلبات المختبر والأشعة.</p>
          </article>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">1.4 Billing & Payments (بلنگ اور ادائیگیاں / الفواتير والمدفوعات)</h3>
            <p>Invoice generation for consultations, procedures, lab tests, imaging, pharmacy, and IPD charges. Multiple payment methods (cash, card, bank transfer, online). Payment splitting and partial payments. Discount and waiver management with approval workflow. Session-based billing for cashiers with daily closing and reconciliation. Receipt printing and reprinting. Patient payment history and outstanding balances. Insurance claim tracking. Refund processing. Doctor settlement and commission tracking.</p>
            <p dir="rtl">مشاورت، طریقہ کار، لیب ٹیسٹ، فارمیسی اور آئی پی ڈی کے لیے انوائس تیار کرنا۔ متعدد ادائیگی کے طریقے، سیشن پر مبنی بلنگ، روزانہ بندش۔</p>
            <p dir="rtl">إنشاء فواتير للاستشارات والإجراءات والفحوصات المخبرية والصيدلية. طرق دفع متعددة، فوترة قائمة على الجلسات، إغلاق يومي.</p>
          </article>
        </section>

        {/* ========== CLINICAL MODULES ========== */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">2. Clinical Modules (طبی ماڈیولز / الوحدات السريرية)</h2>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">2.1 IPD / Inpatient Admissions (آئی پی ڈی / داخل مریض / قسم المرضى الداخليين)</h3>
            <p>Complete inpatient management: admission registration with admission type (emergency, elective, transfer), ward and bed allocation, bed management dashboard showing occupancy by ward. Bed transfers between wards with reason tracking. Doctor assignment (admitting, attending, referring). Clinical notes and progress tracking. Nursing care plans and medication administration records. Discharge workflow with discharge summary, instructions, follow-up scheduling, and final billing. Deposit collection and tracking. Estimated cost management.</p>
            <p dir="rtl">مکمل آئی پی ڈی انتظام: داخلے کی رجسٹریشن، وارڈ اور بستر کی تقسیم، بستر ٹرانسفر، نرسنگ کیئر، ڈسچارج ورک فلو، اور حتمی بلنگ۔</p>
            <p dir="rtl">إدارة كاملة للمرضى الداخليين: تسجيل الدخول، تخصيص الأجنحة والأسرة، نقل الأسرة، الرعاية التمريضية، سير عمل الخروج، والفوترة النهائية.</p>
          </article>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">2.2 Emergency / ER (ایمرجنسی / الطوارئ)</h3>
            <p>Emergency registration with triage classification (resuscitation, emergent, urgent, less urgent, non-urgent) using ESI color coding. Rapid patient registration for unknown/unconscious patients. Ambulance alert management with ETA tracking and pre-hospital care details. ER-specific clinical documentation. Conversion to IPD admission or OPD follow-up. Real-time ER dashboard with patient count by triage level. Public ER display for ambulance status.</p>
            <p dir="rtl">ٹرائیج درجہ بندی کے ساتھ ایمرجنسی رجسٹریشن، ایمبولینس الرٹ مینجمنٹ، فوری رجسٹریشن، ER ڈیش بورڈ، اور IPD/OPD میں تبدیلی۔</p>
            <p dir="rtl">تسجيل الطوارئ مع تصنيف الفرز، إدارة تنبيهات الإسعاف، التسجيل السريع، لوحة معلومات الطوارئ، والتحويل إلى قسم الداخلي أو العيادات الخارجية.</p>
          </article>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">2.3 Operation Theatre (آپریشن تھیٹر / غرفة العمليات)</h3>
            <p>Surgery scheduling with OT room allocation and conflict detection. Pre-operative assessment and checklists. Surgical team assignment (surgeon, anesthetist, nurses, technicians). Anesthesia records with detailed intra-operative monitoring (vitals log, fluid I/O, blood loss, medications). Surgery notes and findings documentation. Post-operative care instructions. OT room status management (available, occupied, cleaning, maintenance). Surgery billing integration. Instrument and supply tracking per surgery.</p>
            <p dir="rtl">سرجری شیڈولنگ، OT روم مینجمنٹ، اینستھیزیا ریکارڈز، سرجیکل ٹیم اسائنمنٹ، آپریشن سے پہلے اور بعد کی دستاویزات۔</p>
            <p dir="rtl">جدولة الجراحة، إدارة غرف العمليات، سجلات التخدير، تعيين الفريق الجراحي، التوثيق قبل وبعد العملية.</p>
          </article>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">2.4 ANC / Maternity (اے این سی / زچگی / رعاية الحوامل)</h3>
            <p>Antenatal care records with visit tracking, gestational age calculation, obstetric history (gravida, para, abortion, living). Vital monitoring (blood pressure, weight, hemoglobin, blood sugar). Fetal assessment (heart rate, movements, presentation, lie). Vaccination tracking (TT1, TT2). Lab results integration (HIV, HBsAg, VDRL, blood group). Risk categorization and referral management. Birth plan documentation. Expected delivery date calculation from LMP and ultrasound.</p>
            <p dir="rtl">قبل از پیدائش کی دیکھ بھال: وزٹ ٹریکنگ، حمل کی عمر، زچگی کی تاریخ، اہم نشانیوں کی نگرانی، جنین کی تشخیص، ویکسینیشن ٹریکنگ۔</p>
            <p dir="rtl">رعاية ما قبل الولادة: تتبع الزيارات، عمر الحمل، التاريخ التوليدي، مراقبة العلامات الحيوية، تقييم الجنين، تتبع التطعيمات.</p>
          </article>
        </section>

        {/* ========== ANCILLARY / DIAGNOSTIC MODULES ========== */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">3. Ancillary & Diagnostic Modules (معاون اور تشخیصی ماڈیولز / الوحدات المساعدة والتشخيصية)</h2>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">3.1 Laboratory (لیبارٹری / المختبر)</h3>
            <p>Lab test catalog management with test categories, normal ranges, and pricing. Lab order creation from OPD, IPD, and ER. Sample collection tracking with barcode generation. Result entry with normal/abnormal flagging. Result publishing workflow with technician entry and pathologist verification. Published results accessible to ordering doctors in real-time. Patient-facing lab report portal with MR number lookup. Lab order payment integration. Batch result entry for efficiency. Lab workload dashboard.</p>
            <p dir="rtl">لیب ٹیسٹ کیٹلاگ، آرڈر مینجمنٹ، نمونہ جمع کرنا، نتائج کا اندراج، تصدیق، اور مریض کے لیے لیب رپورٹ پورٹل۔</p>
            <p dir="rtl">كتالوج الفحوصات المخبرية، إدارة الطلبات، جمع العينات، إدخال النتائج، التحقق، وبوابة التقارير المخبرية للمرضى.</p>
          </article>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">3.2 Radiology / Imaging (ریڈیالوجی / الأشعة)</h3>
            <p>Imaging modality management (X-ray, CT, MRI, Ultrasound, etc.). Imaging order creation from consultations. Scheduling and queue management for imaging departments. Result/report entry by radiologist with findings, impression, and recommendations. Image attachment support. Result publishing and notification to ordering doctor. Payment integration for imaging services. Imaging workload tracking.</p>
            <p dir="rtl">امیجنگ آرڈرز، شیڈولنگ، ریڈیالوجسٹ رپورٹنگ، نتائج کی اشاعت، اور ادائیگی کا انضمام۔</p>
            <p dir="rtl">طلبات التصوير، الجدولة، تقارير أخصائي الأشعة، نشر النتائج، وتكامل الدفع.</p>
          </article>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">3.3 Pharmacy (فارمیسی / الصيدلية)</h3>
            <p>Medicine catalog with generic names, brand names, formulations, and strength. Inventory management with batch tracking, expiry date monitoring, and stock level alerts. Prescription fulfillment from OPD and IPD orders. Medicine dispensing with automatic stock deduction. Store-level inventory (main store, OT pharmacy, ward pharmacy). Stock transfers between stores. Purchase order management. Goods received notes (GRN). Stock adjustments for damage, expiry, and write-offs. Minimum stock level alerts. Medicine interaction warnings.</p>
            <p dir="rtl">دوائی کیٹلاگ، انوینٹری مینجمنٹ، بیچ ٹریکنگ، نسخہ کی تکمیل، اسٹاک ٹرانسفرز، خریداری کے آرڈرز۔</p>
            <p dir="rtl">كتالوج الأدوية، إدارة المخزون، تتبع الدفعات، تنفيذ الوصفات، نقل المخزون، أوامر الشراء.</p>
          </article>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">3.4 Pharmacy POS (فارمیسی پی او ایس / نقطة بيع الصيدلية)</h3>
            <p>Point-of-sale terminal for over-the-counter pharmacy sales. Quick medicine search and barcode scanning. Cart management with quantity, discount, and tax calculation. Multiple payment methods. Session management with opening/closing balance. Daily sales reports. Receipt printing. Walk-in customer sales without patient registration. Integration with pharmacy inventory for real-time stock updates.</p>
            <p dir="rtl">فارمیسی کاؤنٹر سیلز کے لیے پوائنٹ آف سیل ٹرمینل۔ فوری تلاش، کارٹ مینجمنٹ، سیشن مینجمنٹ، روزانہ رپورٹس۔</p>
            <p dir="rtl">محطة نقاط البيع لمبيعات الصيدلية. البحث السريع، إدارة السلة، إدارة الجلسات، التقارير اليومية.</p>
          </article>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">3.5 Blood Bank (بلڈ بینک / بنك الدم)</h3>
            <p>Donor registration and management with health screening. Blood donation recording with bag number, volume, and donation type. Blood inventory management by blood group and component (whole blood, packed RBCs, plasma, platelets). Cross-matching and compatibility testing. Blood request management from surgery and IPD. Transfusion recording with reaction monitoring. Blood unit tracking from donation to transfusion. Expiry monitoring and disposal tracking. Donor eligibility rules and deferral management.</p>
            <p dir="rtl">ڈونر رجسٹریشن، خون کا عطیہ ریکارڈ، بلڈ انوینٹری، کراس میچنگ، ٹرانسفیوژن ریکارڈنگ، اور ایکسپائری مانیٹرنگ۔</p>
            <p dir="rtl">تسجيل المتبرعين، سجل التبرع بالدم، مخزون الدم، اختبار التوافق، تسجيل نقل الدم، ومراقبة انتهاء الصلاحية.</p>
          </article>
        </section>

        {/* ========== INVENTORY & WAREHOUSE ========== */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">4. Inventory & Warehouse (انوینٹری اور گودام / المخزون والمستودع)</h2>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">4.1 Inventory Management (انوینٹری مینجمنٹ / إدارة المخزون)</h3>
            <p>Centralized inventory item catalog with item codes, categories, units of measurement, and reorder levels. Multi-store inventory tracking. Purchase request and purchase order workflow with approval chains. Vendor management with vendor codes, contact details, and payment terms. Goods received notes (GRN) with quality inspection. Stock requisitions between departments. Stock transfers between stores/branches. Stock adjustments for damage, loss, and corrections. Cycle count management for physical verification. Return-to-vendor (RTV) processing. Minimum/maximum stock alerts. Batch and expiry tracking.</p>
            <p dir="rtl">مرکزی انوینٹری کیٹلاگ، ملٹی اسٹور ٹریکنگ، خریداری کا ورک فلو، وینڈر مینجمنٹ، GRN، اسٹاک ایڈجسٹمنٹ، سائیکل کاؤنٹ۔</p>
            <p dir="rtl">كتالوج مخزون مركزي، تتبع متعدد المتاجر، سير عمل الشراء، إدارة الموردين، GRN، تعديلات المخزون، الجرد الدوري.</p>
          </article>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">4.2 Warehouse Management (گودام مینجمنٹ / إدارة المستودع)</h3>
            <p>Warehouse order management for multi-branch supply chain. Pick list generation for order fulfillment. Packing slip creation and verification. Shipment tracking with dispatch and delivery status. Zone and bin location management within warehouses. Warehouse-to-branch distribution workflow. Shipment cost tracking with automatic journal entry posting. Multi-warehouse support for organizations with central procurement.</p>
            <p dir="rtl">گودام آرڈر مینجمنٹ، پِک لسٹ، پیکنگ سلپ، شپمنٹ ٹریکنگ، زون مینجمنٹ، اور ملٹی برانچ ڈسٹری بیوشن۔</p>
            <p dir="rtl">إدارة أوامر المستودع، قوائم الانتقاء، إيصالات التعبئة، تتبع الشحن، إدارة المناطق، والتوزيع متعدد الفروع.</p>
          </article>
        </section>

        {/* ========== FINANCE & ACCOUNTS ========== */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">5. Finance & Accounts (مالیات اور اکاؤنٹس / المالية والحسابات)</h2>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">5.1 Financial Accounting (مالیاتی اکاؤنٹنگ / المحاسبة المالية)</h3>
            <p>Full double-entry accounting system. Chart of Accounts with hierarchical structure (4 levels: category → group → sub-group → posting account). Account types: Assets, Liabilities, Equity, Revenue, Expenses. Journal entry creation with automatic entry number generation. Posting and unposting workflow. Auto-generated journal entries from billing, payroll, expenses, and stock write-offs. Bank account management with reconciliation. Bank transaction recording. Vendor payment tracking with payment numbers. Financial reports: Trial Balance, Profit & Loss, Balance Sheet, Cash Flow. Period-based reporting. Branch-level and organization-level accounting.</p>
            <p dir="rtl">مکمل ڈبل انٹری اکاؤنٹنگ۔ چارٹ آف اکاؤنٹس، جرنل انٹریز، بینک مینجمنٹ، وینڈر ادائیگیاں، مالیاتی رپورٹس۔</p>
            <p dir="rtl">نظام محاسبة القيد المزدوج الكامل. دليل الحسابات، القيود اليومية، إدارة البنوك، مدفوعات الموردين، التقارير المالية.</p>
          </article>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">5.2 Expense Management (اخراجات کا انتظام / إدارة المصروفات)</h3>
            <p>Expense recording by category (petty cash, refunds, staff advances, miscellaneous). Automatic journal entry posting for each expense. Branch-level expense tracking. Expense approval workflow. Daily expense summary in billing session closing.</p>
            <p dir="rtl">زمرہ بندی کے مطابق اخراجات کا اندراج، خودکار جرنل انٹری، برانچ سطح کی ٹریکنگ۔</p>
            <p dir="rtl">تسجيل المصروفات حسب الفئة، قيود يومية تلقائية، تتبع على مستوى الفرع.</p>
          </article>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">5.3 Donation Management (عطیات کا انتظام / إدارة التبرعات)</h3>
            <p>Financial donor registration with donor numbers. Donation recording with donation types, amounts, and payment methods. Donation receipt generation and printing. Recurring donation schedule management. Donation campaign creation and tracking. Campaign-specific public donation pages. Donor communication and thank-you letters. Donation reports and analytics. Designed for NGO and charitable hospitals.</p>
            <p dir="rtl">مالیاتی ڈونر رجسٹریشن، عطیات کی ریکارڈنگ، رسیدوں کی تیاری، بار بار آنے والے عطیات، مہم کا انتظام۔</p>
            <p dir="rtl">تسجيل المتبرعين الماليين، تسجيل التبرعات، إصدار الإيصالات، التبرعات المتكررة، إدارة الحملات.</p>
          </article>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">5.4 Doctor Settlements (ڈاکٹر سیٹلمنٹ / تسويات الأطباء)</h3>
            <p>Doctor commission and fee settlement tracking. Settlement period management. Revenue breakdown per doctor (consultations, procedures, surgeries). Settlement number generation. Payment processing and history. Supports percentage-based and fixed-fee commission models.</p>
            <p dir="rtl">ڈاکٹروں کی فیس اور کمیشن سیٹلمنٹ۔ سیٹلمنٹ پیریڈ، ریونیو بریک ڈاؤن، ادائیگی کی پروسیسنگ۔</p>
            <p dir="rtl">تسوية أتعاب وعمولات الأطباء. فترات التسوية، تفصيل الإيرادات، معالجة المدفوعات.</p>
          </article>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">5.5 Insurance & Claims (انشورنس اور کلیمز / التأمين والمطالبات)</h3>
            <p>Insurance provider management. Patient insurance policy tracking. Pre-authorization workflow. Claim submission with claim numbers. Claim status tracking (submitted, approved, rejected, partially approved). Claim amount reconciliation. Insurance-based billing with co-pay calculation. Corporate/panel billing support.</p>
            <p dir="rtl">انشورنس فراہم کنندہ کا انتظام، پالیسی ٹریکنگ، کلیم جمع کرانا، اسٹیٹس ٹریکنگ، کارپوریٹ بلنگ۔</p>
            <p dir="rtl">إدارة مزودي التأمين، تتبع البوليصات، تقديم المطالبات، تتبع الحالة، الفوترة المؤسسية.</p>
          </article>
        </section>

        {/* ========== HR & ADMIN ========== */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">6. HR & Administration (ایچ آر اور انتظامیہ / الموارد البشرية والإدارة)</h2>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">6.1 HR / Employee Management (ایچ آر / ملازمین کا انتظام / إدارة الموظفين)</h3>
            <p>Employee registration with personal details, employment information, department assignment, and designation. Employee code generation. Document management (CNIC, certificates, contracts). Shift management with multiple shift patterns. Attendance tracking with biometric device integration, manual check-in/out, and GPS-based location capture. Late arrival and early departure calculation. Overtime tracking. Attendance correction requests with approval workflow. Leave management with leave types, balances, requests, and approvals. Holiday calendar management. Employee self-service portal for viewing schedule, attendance, leaves, and payslips.</p>
            <p dir="rtl">ملازمین کی رجسٹریشن، شفٹ مینجمنٹ، حاضری ٹریکنگ، چھٹی کا انتظام، تعطیلات کا کیلنڈر، سیلف سروس پورٹل۔</p>
            <p dir="rtl">تسجيل الموظفين، إدارة المناوبات، تتبع الحضور، إدارة الإجازات، تقويم العطلات، بوابة الخدمة الذاتية.</p>
          </article>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">6.2 Payroll (پے رول / الرواتب)</h3>
            <p>Salary structure management with basic salary, allowances, and deductions. Monthly payroll processing with automatic attendance-based calculations. Payslip generation with detailed breakdown. Payroll approval workflow. Automatic journal entry posting for salary expenses. Payroll reports and summaries. Tax deduction support. Loan and advance deduction tracking.</p>
            <p dir="rtl">تنخواہ کا ڈھانچہ، ماہانہ پے رول پروسیسنگ، پے سلپ، خودکار جرنل انٹری، پے رول رپورٹس۔</p>
            <p dir="rtl">هيكل الرواتب، معالجة الرواتب الشهرية، كشوف المرتبات، قيود يومية تلقائية، تقارير الرواتب.</p>
          </article>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">6.3 Doctor Management (ڈاکٹر مینجمنٹ / إدارة الأطباء)</h3>
            <p>Doctor profiles with specialization, qualification, license number, and consultation fee. Doctor schedule management with available days and time slots. OPD department assignment. Doctor-wise appointment limits. Consultation fee configuration. Doctor availability status. Performance tracking and patient volume analytics.</p>
            <p dir="rtl">ڈاکٹر پروفائلز، شیڈول مینجمنٹ، او پی ڈی ڈیپارٹمنٹ، فیس کنفیگریشن، دستیابی، کارکردگی ٹریکنگ۔</p>
            <p dir="rtl">ملفات الأطباء، إدارة الجداول، قسم العيادات الخارجية، تكوين الرسوم، التوفر، تتبع الأداء.</p>
          </article>
        </section>

        {/* ========== SYSTEM & ADMIN ========== */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">7. System & Administration (سسٹم اور انتظامیہ / النظام والإدارة)</h2>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">7.1 Multi-Organization & Multi-Branch (ملٹی آرگنائزیشن اور ملٹی برانچ / متعدد المنظمات والفروع)</h3>
            <p>Multi-tenant architecture supporting multiple independent organizations. Each organization can have multiple branches. Branch-level data isolation with organization-level aggregation. Branch-specific settings for services, fees, and schedules. Cross-branch reporting at organization level. Super admin dashboard for system-wide management.</p>
            <p dir="rtl">ملٹی ٹیننٹ آرکیٹیکچر۔ ہر ادارے کی متعدد برانچز۔ برانچ سطح کا ڈیٹا، آرگنائزیشن سطح کی رپورٹنگ۔</p>
            <p dir="rtl">بنية متعددة المستأجرين. فروع متعددة لكل منظمة. بيانات على مستوى الفرع، تقارير على مستوى المنظمة.</p>
          </article>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">7.2 Role-Based Access Control (کردار پر مبنی رسائی کنٹرول / التحكم في الوصول القائم على الأدوار)</h3>
            <p>25+ predefined roles covering all hospital departments: Super Admin, Organization Admin, Branch Admin, Doctor, Surgeon, Anesthetist, Nurse (General, OPD, IPD, OT), Receptionist, Pharmacist (Main, OT), Lab Technician, Radiologist, Radiology Technician, Blood Bank Technician, Accountant, Finance Manager, HR Manager, HR Officer, Store Manager, OT Technician, Warehouse Admin, Warehouse User. Granular permission system with 100+ individual permissions. Role-permission mapping with grant/deny. Per-organization permission customization. Multi-role support per user.</p>
            <p dir="rtl">25+ پہلے سے طے شدہ کردار۔ 100+ انفرادی اجازتیں۔ کردار-اجازت میپنگ۔ ملٹی رول سپورٹ۔</p>
            <p dir="rtl">أكثر من 25 دوراً محدداً مسبقاً. أكثر من 100 إذن فردي. ربط الأدوار بالأذونات. دعم الأدوار المتعددة.</p>
          </article>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">7.3 Services & Fee Management (خدمات اور فیس مینجمنٹ / إدارة الخدمات والرسوم)</h3>
            <p>Service catalog management with categories (consultation, procedure, lab, imaging, room charges, etc.). Service pricing with branch-level overrides. Service packages and bundles. Tax configuration per service. Service-wise revenue tracking. Department-based service grouping.</p>
            <p dir="rtl">سروس کیٹلاگ، قیمتوں کا تعین، سروس پیکجز، ٹیکس کنفیگریشن، ریونیو ٹریکنگ۔</p>
            <p dir="rtl">كتالوج الخدمات، التسعير، حزم الخدمات، تكوين الضرائب، تتبع الإيرادات.</p>
          </article>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">7.4 Settings & Configuration (ترتیبات / الإعدادات)</h3>
            <p>Organization profile management (name, logo, contact, address). Branch configuration. Module activation/deactivation per organization. Language settings with multi-language support (English, Urdu, Arabic). Notification preferences. Print template customization. User management with role assignment. Audit logging for all critical operations. System preferences for date format, currency, and time zone.</p>
            <p dir="rtl">ادارے کی پروفائل، برانچ کنفیگریشن، ماڈیول ایکٹیویشن، زبان کی ترتیبات، پرنٹ ٹیمپلیٹس، آڈٹ لاگنگ۔</p>
            <p dir="rtl">ملف المنظمة، تكوين الفروع، تفعيل الوحدات، إعدادات اللغة، قوالب الطباعة، تسجيل التدقيق.</p>
          </article>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">7.5 Medical Certificates (طبی سرٹیفکیٹس / الشهادات الطبية)</h3>
            <p>Digital medical certificate generation: fitness certificates, sick leave certificates, disability certificates, death certificates, and custom certificates. Pre-built templates with doctor signature. PDF generation and printing. Certificate numbering and tracking.</p>
            <p dir="rtl">ڈیجیٹل طبی سرٹیفکیٹ: فٹنس، بیمار چھٹی، معذوری، وفات، اور حسب ضرورت سرٹیفکیٹس۔</p>
            <p dir="rtl">شهادات طبية رقمية: اللياقة، الإجازة المرضية، الإعاقة، الوفاة، والشهادات المخصصة.</p>
          </article>
        </section>

        {/* ========== REPORTS & ANALYTICS ========== */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">8. Reports & Analytics (رپورٹس اور تجزیات / التقارير والتحليلات)</h2>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">8.1 Reports Hub (رپورٹس ہب / مركز التقارير)</h3>
            <p>Centralized reporting dashboard with categorized reports. Organization-level reports: revenue summary, patient volume, department utilization. Branch comparison reports. Financial reports: daily collections, monthly revenue, expense analysis, profit & loss. Clinical reports: doctor performance, patient demographics, disease patterns. Operational reports: appointment statistics, average wait times, bed occupancy rates. HR reports: attendance summary, leave utilization, payroll summary. Inventory reports: stock status, consumption patterns, expiry alerts. Custom date range filtering. Export to PDF and Excel. Visual charts and graphs with trend analysis.</p>
            <p dir="rtl">مرکزی رپورٹنگ ڈیش بورڈ۔ مالیاتی، طبی، آپریشنل، ایچ آر، اور انوینٹری رپورٹس۔ حسب ضرورت تاریخ کی فلٹرنگ، PDF ایکسپورٹ۔</p>
            <p dir="rtl">لوحة تقارير مركزية. تقارير مالية وسريرية وتشغيلية وموارد بشرية ومخزون. تصفية حسب التاريخ، تصدير PDF.</p>
          </article>
        </section>

        {/* ========== AI & DIGITAL ========== */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">9. AI & Digital Features (اے آئی اور ڈیجیٹل فیچرز / الميزات الرقمية والذكاء الاصطناعي)</h2>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">9.1 Tabeebi AI Doctor (طبیبی اے آئی ڈاکٹر / طبيبي الطبيب الذكي)</h3>
            <p>AI-powered patient-facing health assistant supporting text and voice interaction in English, Urdu, and Arabic. Symptom assessment and triage guidance. Health education and medication information. Conversation history tracking. Context-aware responses based on patient profile. Voice-to-text and text-to-speech capabilities.</p>
            <p dir="rtl">اے آئی سے چلنے والا صحت معاون۔ انگریزی، اردو اور عربی میں ٹیکسٹ اور وائس انٹریکشن۔ علامات کی تشخیص اور صحت کی تعلیم۔</p>
            <p dir="rtl">مساعد صحي يعمل بالذكاء الاصطناعي. تفاعل نصي وصوتي بالإنجليزية والأردية والعربية. تقييم الأعراض والتثقيف الصحي.</p>
          </article>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">9.2 Self-Service Kiosk (سیلف سروس کیوسک / كشك الخدمة الذاتية)</h3>
            <p>Touch-screen kiosk application for patient self-check-in. Patient lookup by MR number or phone. Doctor and department selection. Automatic token generation and printing. Queue position display. Multi-language interface. Secure kiosk authentication with dedicated kiosk accounts. Remote kiosk configuration and management.</p>
            <p dir="rtl">مریض کی خود چیک ان کے لیے ٹچ اسکرین کیوسک۔ MR نمبر سے تلاش، ٹوکن جنریشن، ملٹی لینگویج انٹرفیس۔</p>
            <p dir="rtl">كشك شاشة لمس لتسجيل دخول المرضى ذاتياً. البحث برقم الملف، إصدار الرموز، واجهة متعددة اللغات.</p>
          </article>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">9.3 Public Displays (پبلک ڈسپلے / شاشات العرض العامة)</h3>
            <p>Real-time queue display screens for waiting rooms showing current and upcoming tokens per doctor. Department-filtered displays. ER status display showing ambulance alerts and triage counts. Auto-refreshing displays designed for wall-mounted TVs. Customizable display layouts per organization.</p>
            <p dir="rtl">ویٹنگ رومز کے لیے ریئل ٹائم قطار ڈسپلے اسکرینز۔ ER اسٹیٹس ڈسپلے۔ آٹو ریفریشنگ TV ڈسپلے۔</p>
            <p dir="rtl">شاشات عرض الطوابير في الوقت الفعلي لغرف الانتظار. عرض حالة الطوارئ. شاشات تلفزيون ذاتية التحديث.</p>
          </article>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">9.4 Mobile App (موبائل ایپ / تطبيق الجوال)</h3>
            <p>Native mobile application (iOS & Android via Capacitor) with role-based dashboards. Push notifications for appointments, lab results, and tasks. Quick access to patient queue, pharmacy orders, and lab orders. Biometric authentication support. Offline-capable for critical functions. Haptic feedback for key interactions. Mobile-optimized consultation and prescription writing.</p>
            <p dir="rtl">نیٹو موبائل ایپلیکیشن۔ پُش نوٹیفکیشنز، کوئیک ایکسیس، بائیومیٹرک تصدیق، آف لائن سپورٹ۔</p>
            <p dir="rtl">تطبيق جوال أصلي. إشعارات فورية، وصول سريع، مصادقة بيومترية، دعم بدون اتصال.</p>
          </article>
        </section>

        {/* ========== TECHNOLOGY ========== */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">10. Technology Stack (ٹیکنالوجی اسٹیک / المنصة التقنية)</h2>

          <article className="space-y-2">
            <h3 className="text-xl font-medium">Platform & Architecture</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong>Frontend:</strong> React 18 with TypeScript, Vite build system, Tailwind CSS with shadcn/ui component library</li>
              <li><strong>Backend:</strong> Supabase (PostgreSQL database, Row Level Security, Edge Functions, Realtime subscriptions)</li>
              <li><strong>Mobile:</strong> Capacitor for iOS and Android native builds with PWA fallback</li>
              <li><strong>AI:</strong> Lovable AI Gateway with multi-model support (Gemini, GPT, Claude)</li>
              <li><strong>Authentication:</strong> Supabase Auth with email/password, session management, and role-based access</li>
              <li><strong>State Management:</strong> TanStack React Query for server state, React Context for auth state</li>
              <li><strong>Reporting:</strong> Recharts for data visualization, jsPDF for PDF generation, html2canvas for print layouts</li>
              <li><strong>Internationalization:</strong> Multi-language support (English, Urdu, Arabic) with RTL layout support</li>
              <li><strong>Security:</strong> Row Level Security on all tables, role-based permissions, audit logging, encrypted secrets</li>
            </ul>
          </article>
        </section>

        {/* Footer */}
        <footer className="border-t border-border pt-8 text-center text-muted-foreground">
          <p className="text-lg font-medium text-foreground">Smart HMS — Intelligent Hospital Management</p>
          <p>Built for healthcare organizations of all sizes</p>
          <p dir="rtl">ہر سائز کی صحت کی دیکھ بھال کی تنظیموں کے لیے بنایا گیا</p>
          <p dir="rtl">مصمم لمنظمات الرعاية الصحية بجميع أحجامها</p>
        </footer>
      </div>
    </div>
  );
}
