// مواصفات شاشات EDU Pro الحقيقية (مستخرجة من صفحات البرنامج الفعلية) لبناء معاينة تفاعلية مطابقة.
// المفاتيح تطابق GATEABLE_GROUPS + الشاشات الدائمة (__home, __s_*).

export type ScreenKind =
  | 'dashboard' | 'table' | 'cards' | 'tree' | 'calendar' | 'form' | 'split' | 'hub';

export interface ScreenSpec {
  key: string;
  title: string;
  kind: ScreenKind;
  toolbar: string[];
  filters: string[];
  columns: string[];
  stats: string[];
  sampleRows: number;
  note: string;
}

export const SCREEN_SPECS: Record<string, ScreenSpec> = {
  // ── الرئيسية ──
  __home: {
    key: '__home', title: 'لوحة التحكم', kind: 'dashboard',
    toolbar: ['تخصيص'], filters: [], columns: [],
    stats: ['المبالغ المتأخرة', 'الطلاب النشطون', 'إجمالي المدفوعات', 'المعلمون والموظفون',
            'إجمالي الطلاب', 'الصفوف الدراسية', 'الشعب', 'الطلاب المؤرشفون'],
    sampleRows: 0, note: 'بطاقات بطل + إجراءات سريعة + رسوم بيانية + بطاقات إحصائية ثانوية.',
  },

  // ── العمليات اليومية ──
  'daily.attendance': {
    key: 'daily.attendance', title: 'الحضور والغياب', kind: 'table',
    toolbar: ['تحميل', 'حفظ الحضور', 'حذف سجلات هذا اليوم'],
    filters: ['الصف', 'الشعبة', 'التاريخ'],
    columns: ['#', 'اسم الطالب', 'حاضر', 'غائب', 'مجاز', 'جزئي', 'ملاحظات'],
    stats: ['حاضر', 'غائب', 'مجاز', 'جزئي'], sampleRows: 7,
    note: 'جدول تفاعلي لتسجيل الحضور اليومي مع حالات ملونة وملاحظات.',
  },
  'daily.biometric-log': {
    key: 'daily.biometric-log', title: 'سجل بصمات الطلاب', kind: 'table',
    toolbar: ['عرض', 'تحديث'],
    filters: ['نوع العرض', 'من تاريخ', 'إلى تاريخ'],
    columns: ['#', 'اسم الطالب', 'التاريخ', 'الوقت', 'النوع', 'الطريقة', 'الجهاز', 'حذف'],
    stats: [], sampleRows: 8, note: 'سجل بصمات مع فلاتر حسب النوع والتواريخ.',
  },
  'daily.lectures': {
    key: 'daily.lectures', title: 'سجل المحاضرات', kind: 'table',
    toolbar: ['إضافة محاضرة'],
    filters: ['السنة الدراسية', 'الصف', 'الشعبة', 'من تاريخ', 'إلى تاريخ'],
    columns: ['#', 'التاريخ', 'المادة', 'المعلم', 'الصف / الشعبة', 'الموضوع', 'إجراءات'],
    stats: [], sampleRows: 6, note: 'جدول المحاضرات مع فلاتر متعددة وإجراءات.',
  },

  // ── الامتحانات والدرجات ──
  'grades.gradebook': {
    key: 'grades.gradebook', title: 'دفتر درجات المادة', kind: 'table',
    toolbar: ['احتساب النتيجة النهائية', 'حفظ الدرجات'],
    filters: ['الصف', 'الشعبة', 'المادة'],
    columns: ['م', 'اسم الطالب', 'تحريري', 'يومي', 'الشهر 1', 'تحريري', 'يومي', 'الشهر 2',
              'تحريري', 'يومي', 'الشهر 3', 'الفصل الأول', 'نصف السنة', 'تحريري', 'يومي', 'الشهر 1',
              'تحريري', 'يومي', 'الشهر 2', 'الفصل الثاني', 'الامتحان النهائي', 'السعي السنوي',
              'النتيجة النهائية', 'النجاح', 'ملاحظات'],
    stats: [], sampleRows: 8,
    note: 'جدول عريض أفقياً لإدخال الدرجات مع احتساب فوري وتلوين الراسبين.',
  },
  'grades.entry': {
    key: 'grades.entry', title: 'لوحة إدخال الدرجات', kind: 'form',
    toolbar: ['حفظ البيانات'],
    filters: ['الصف', 'الشعبة', 'المادة', 'نوع الدرجة'],
    columns: ['م', 'اسم الطالب', 'الدرجة'], stats: [], sampleRows: 8,
    note: 'نموذج إدخال درجات مبسط بصفوف، كل درجة في حقل منفصل.',
  },
  'grades.student-card': {
    key: 'grades.student-card', title: 'البطاقة المدرسية للطالب', kind: 'table',
    toolbar: ['طباعة'], filters: ['الطالب'],
    columns: ['المادة', 'الفصل الأول', 'الفصل الثاني', 'نصف السنة', 'السعي السنوي', 'النتيجة النهائية', 'النتيجة'],
    stats: ['عدد المواد', 'مواد بها درجات', 'ناجح في', 'راسب في'], sampleRows: 7,
    note: 'بطاقة قابلة للطباعة تعرض درجات الطالب مع ملخص إحصائي.',
  },
  'grades.section-summary': {
    key: 'grades.section-summary', title: 'ملخص الشعبة', kind: 'table',
    toolbar: ['تصدير CSV', 'طباعة'],
    filters: ['الصف', 'الشعبة', 'المواد', 'أنواع الدرجات'],
    columns: ['م', 'اسم الطالب', 'الرياضيات', 'العلوم', 'اللغة العربية', 'الإنجليزية', 'المعدل'],
    stats: [], sampleRows: 8, note: 'مصفوفة درجات الشعبة الكاملة قابلة للتصدير والطباعة.',
  },
  'grades.whatsapp': {
    key: 'grades.whatsapp', title: 'إرسال رسائل واتساب', kind: 'table',
    toolbar: ['توليد الرسائل', 'فتح كل الروابط'],
    filters: ['الصف', 'الشعبة', 'المادة', 'نوع الدرجة'],
    columns: ['الطالب', 'الدرجة', 'الرسالة', 'الإرسال'], stats: [], sampleRows: 6,
    note: 'جدول رسائل واتساب مخصصة لكل طالب مع أزرار إرسال.',
  },
  'grades.monthly-followup': {
    key: 'grades.monthly-followup', title: 'تقرير المتابعة الشهرية', kind: 'cards',
    toolbar: ['عرض التقرير', 'طباعة'],
    filters: ['الصف', 'الشعبة', 'المادة', 'الفصل', 'الشهر'],
    columns: [], stats: ['الغياب (غ)', 'المجاز (م)', 'أقل من 50'], sampleRows: 6,
    note: 'ثلاث قوائم جنباً إلى جنب: الغياب والمجاز والطلاب أقل من 50.',
  },
  'grades.save-log': {
    key: 'grades.save-log', title: 'سجل حفظ الدرجات', kind: 'table',
    toolbar: [], filters: [],
    columns: ['التاريخ والوقت', 'الشعبة', 'المادة', 'نوع الدرجة', 'الموظف', 'عدد الدرجات'],
    stats: [], sampleRows: 9, note: 'جدول تاريخي لعمليات حفظ الدرجات مع ترقيم صفحات.',
  },

  // ── مركز الأشخاص ──
  'people.students': {
    key: 'people.students', title: 'قائمة الطلاب', kind: 'table',
    toolbar: ['طالب جديد'], filters: ['بحث بالاسم أو رقم القيد…'],
    columns: ['الصورة', 'الاسم الكامل', 'الجنس', 'الهاتف', 'العنوان', 'الصف / الشعبة', 'رقم القيد', 'الإجراءات'],
    stats: [], sampleRows: 9, note: 'جدول الطلاب مع تبويب نشطين/محذوفين وبحث وإجراءات.',
  },
  'people.teachers': {
    key: 'people.teachers', title: 'قائمة المعلمين', kind: 'table',
    toolbar: ['معلم جديد'], filters: ['بحث بالاسم أو التخصص أو الهاتف…'],
    columns: ['الصورة', 'الاسم الكامل', 'هاتف المعلم', 'العنوان', 'التخصص', 'الإجراءات'],
    stats: [], sampleRows: 8, note: 'جدول المعلمين مع تبويب فعّالين/محذوفين وبحث.',
  },
  'people.employees': {
    key: 'people.employees', title: 'قائمة الموظفين', kind: 'table',
    toolbar: ['موظف جديد'], filters: ['بحث بالاسم أو الهاتف أو الوظيفة…'],
    columns: ['الصورة', 'الاسم الكامل', 'الهاتف', 'العنوان', 'المسمى الوظيفي', 'الإجراءات'],
    stats: [], sampleRows: 7, note: 'جدول الموظفين مع تبويب فعّالين/محذوفين.',
  },
  'people.persons': {
    key: 'people.persons', title: 'قائمة الأشخاص', kind: 'table',
    toolbar: ['شخص جديد'], filters: ['بحث بالاسم أو رقم الهاتف…'],
    columns: ['الصورة', 'الاسم الكامل', 'الجنس', 'الهاتف', 'العنوان', 'الإجراءات'],
    stats: [], sampleRows: 8, note: 'جدول الأشخاص العام مع بحث وإجراءات.',
  },
  'people.drivers': {
    key: 'people.drivers', title: 'قائمة السائقين', kind: 'table',
    toolbar: ['سائق جديد'], filters: ['بحث بالاسم أو الهاتف أو نوع المركبة…'],
    columns: ['الصورة', 'الاسم الكامل', 'الحالة', 'الهاتف', 'نوع المركبة', 'عدد المقاعد', 'الإجراءات'],
    stats: [], sampleRows: 6, note: 'جدول السائقين مع تفعيل/إيقاف.',
  },

  // ── الشؤون المالية ──
  'finance.installments': {
    key: 'finance.installments', title: 'إدارة الأقساط', kind: 'hub',
    toolbar: [], filters: ['الصف', 'الشعبة', 'بحث باسم الطالب…'],
    columns: ['إدارة الأقساط', 'قبض أقساط', 'ترجيع قسط', 'أقساط الحجوزات', 'أقساط السنوات السابقة'],
    stats: ['إجمالي الأقساط', 'المقبوض', 'المتبقي'], sampleRows: 6,
    note: 'صفحة بخمسة أوضاع (تبويبات) لإدارة وقبض وترجيع الأقساط.',
  },
  'finance.salaries': {
    key: 'finance.salaries', title: 'الرواتب', kind: 'split',
    toolbar: ['صرف راتب'], filters: ['الشهر'],
    columns: ['رواتب الموظفين', 'رواتب المحاضرين'], stats: [], sampleRows: 6,
    note: 'تبويبان: رواتب الموظفين ورواتب المحاضرين، قائمة + تفاصيل.',
  },
  'finance.advances': {
    key: 'finance.advances', title: 'سلف الموظفين', kind: 'table',
    toolbar: ['سلفة جديدة'], filters: ['بحث باسم الموظف…', 'الحالة'],
    columns: ['#', 'اسم الموظف', 'إجمالي السلفة', 'المبلغ المسدد', 'المبلغ المتبقي', 'تاريخ السلفة', 'الحالة', 'الإجراءات'],
    stats: ['إجمالي السلف', 'إجمالي المسدد', 'إجمالي المتبقي'], sampleRows: 6,
    note: 'جدول السلف مع بطاقات إجماليات وإجراءات متعددة.',
  },
  'finance.vouchers': {
    key: 'finance.vouchers', title: 'السندات', kind: 'split',
    toolbar: ['سند جديد'], filters: ['من تاريخ', 'إلى تاريخ'],
    columns: ['سندات قبض', 'سندات صرف'], stats: [], sampleRows: 6,
    note: 'تبويبان: سندات قبض وسندات صرف.',
  },
  'finance.sales-invoices': {
    key: 'finance.sales-invoices', title: 'فواتير المبيعات', kind: 'table',
    toolbar: ['إضافة فاتورة'], filters: ['بحث باسم الطالب…', 'من تاريخ', 'إلى تاريخ'],
    columns: ['#', 'التاريخ', 'الطالب', 'نوع الدفع', 'المخزن', 'الإجمالي', 'الخصم', 'الصافي', 'المتبقي', 'الإجراءات'],
    stats: [], sampleRows: 6, note: 'جدول فواتير المبيعات مع تصفية وإجراءات.',
  },
  'finance.purchase-invoices': {
    key: 'finance.purchase-invoices', title: 'فواتير المشتريات', kind: 'table',
    toolbar: ['إضافة فاتورة'], filters: ['بحث باسم المورد…', 'من تاريخ', 'إلى تاريخ'],
    columns: ['#', 'التاريخ', 'المورد', 'نوع الدفع', 'المخزن', 'الإجمالي', 'الصافي', 'المتبقي', 'الإجراءات'],
    stats: [], sampleRows: 6, note: 'جدول فواتير المشتريات مع تصفية وإجراءات.',
  },
  'finance.statement': {
    key: 'finance.statement', title: 'كشف حساب', kind: 'table',
    toolbar: ['عرض الكشف', 'طباعة'], filters: ['الحساب', 'من تاريخ', 'إلى تاريخ'],
    columns: ['تاريخ العملية', 'البيان', 'المصدر', 'مدين', 'دائن', 'الرصيد', 'المستخدم'],
    stats: ['الرصيد السابق', 'إجمالي المدين', 'إجمالي الدائن', 'الرصيد الختامي'], sampleRows: 8,
    note: 'جدول الحركات المحاسبية مع بطاقات الإجماليات.',
  },
  'finance.chart': {
    key: 'finance.chart', title: 'دليل الحسابات', kind: 'tree',
    toolbar: ['حساب جديد'], filters: ['بحث بالاسم أو الرمز…', 'فتح الكل', 'إغلاق الكل'],
    columns: [], stats: [], sampleRows: 0,
    note: 'شجرة حسابات قابلة للتوسع مع الرصيد ونوع الحساب وإجراءات.',
  },
  'finance.opening': {
    key: 'finance.opening', title: 'الرصيد الافتتاحي', kind: 'table',
    toolbar: ['إضافة رصيد'], filters: [],
    columns: ['#', 'التاريخ', 'الحساب', 'البيان', 'المبلغ (مدين)', 'حذف'],
    stats: ['إجمالي الأرصدة الافتتاحية'], sampleRows: 6,
    note: 'جدول الأرصدة الافتتاحية مع بطاقة إجمالي.',
  },

  // ── الموارد والمخزون ──
  'resources.uniforms': {
    key: 'resources.uniforms', title: 'بكجات الزي', kind: 'split',
    toolbar: ['حفظ', 'جديد'], filters: [],
    columns: ['الصف', 'الصنف', 'المقاس', 'اللون', 'الكمية'], stats: [], sampleRows: 6,
    note: 'قائمة البكجات + نموذج تحرير (صف/صنف/مقاس/لون/كمية).',
  },
  'resources.supplies': {
    key: 'resources.supplies', title: 'بكجات القرطاسية', kind: 'split',
    toolbar: ['حفظ', 'جديد'], filters: [],
    columns: ['الصف', 'الصنف', 'الكمية'], stats: [], sampleRows: 6,
    note: 'قائمة البكجات + نموذج تحرير (صف/صنف/كمية).',
  },
  'resources.warehouses': {
    key: 'resources.warehouses', title: 'المخازن والأصناف', kind: 'hub',
    toolbar: [], filters: [], columns: ['الأصناف', 'المخازن'], stats: [], sampleRows: 0,
    note: 'بطاقتان: الأصناف والمخازن لفتح الإدارات المقابلة.',
  },

  // ── التقارير ──
  reports: {
    key: 'reports', title: 'التقارير', kind: 'cards',
    toolbar: [], filters: [],
    columns: ['باجات الخطوط', 'الطلاب', 'الأقساط', 'الدفعات', 'المتأخرات', 'الخصومات', 'الحضور',
              'أرشيف الطلاب', 'المتخرجون', 'السلف', 'رواتب الموظفين', 'رواتب المحاضرين', 'المبيعات', 'الملخص الإحصائي'],
    stats: [], sampleRows: 0, note: 'شبكة بطاقات تقارير (14 تقريراً).',
  },

  // ── الإعدادات (ظاهرة دائماً) ──
  __s_general: {
    key: '__s_general', title: 'الإعدادات العامة', kind: 'hub',
    toolbar: [], filters: [],
    columns: ['بيانات المدرسة', 'السنوات الدراسية', 'البصمة والحضور', 'هويات الطلاب', 'الإجراءات السريعة', 'النسخ الاحتياطي'],
    stats: [], sampleRows: 0, note: 'بطاقات إعدادات تفتح نوافذ منبثقة.',
  },
  __s_lookups: {
    key: '__s_lookups', title: 'القوائم المرجعية', kind: 'hub',
    toolbar: [], filters: [],
    columns: ['المدن والمناطق', 'المواد الدراسية', 'أنواع الوظائف', 'أنواع الخدمات', 'أنواع الخصومات',
              'نماذج الدفع', 'الألوان', 'القياسات', 'تصنيفات الأصناف', 'الأصناف', 'المخازن', 'حجز المقاعد',
              'الصفوف والشعب', 'الجدول الأسبوعي', 'تنسيب المعلمين والمواد', 'ترحيل الطلاب', 'سجل النقل والانسحاب'],
    stats: [], sampleRows: 0, note: 'بطاقات القوائم المرجعية (17 عنصراً).',
  },
  __s_security: {
    key: '__s_security', title: 'المستخدمون والأمان', kind: 'hub',
    toolbar: [], filters: [], columns: ['المستخدمون', 'الأدوار والصلاحيات', 'سجل التدقيق'],
    stats: [], sampleRows: 0, note: 'بطاقات الأمان والمستخدمين.',
  },
  __s_requests: {
    key: '__s_requests', title: 'الطلبات والاشتراك', kind: 'hub',
    toolbar: [], filters: [], columns: ['طلبات التقديم', 'طلبات التوظيف', 'الاشتراك والدفع'],
    stats: [], sampleRows: 0, note: 'بطاقات الطلبات والاشتراك.',
  },
};
