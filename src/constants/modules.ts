// قوالب جاهزة + بنية الشاشات (مع أيقونات) لمعاينة واجهة EDU Pro داخل نظام الاشتراكات.
// المفاتيح تطابق كتالوج الوحدات في الخادم (ModuleCatalog.cs) وEDU Pro.
// 'ALL' و'NONE' حالتان خاصتان تُحسبان وقت التشغيل من الكتالوج المُحمَّل.

import {
  LayoutGrid, CalendarCheck, ClipboardList, Users, Wallet, Boxes, BarChart3, Settings,
  ClipboardCheck, Fingerprint, NotebookPen, IdCard, MessageCircle, CalendarDays, History,
  GraduationCap, UserCheck, Briefcase, Truck, Receipt, Banknote, HandCoins, FileText,
  ShoppingCart, ShoppingBag, Network, Coins, Shirt, Warehouse, SlidersHorizontal, Database, Shield,
  type LucideIcon,
} from 'lucide-react';

export interface PreviewLeaf { key: string; label: string; icon: LucideIcon; }
export interface PreviewGroup { key: string; label: string; icon: LucideIcon; children: PreviewLeaf[]; }

/** المجموعات القابلة للتخصيص (تطابق شريط EDU Pro + كتالوج الخادم). تُستخدم للتحديد والمعاينة. */
export const GATEABLE_GROUPS: PreviewGroup[] = [
  { key: 'daily', label: 'العمليات اليومية', icon: CalendarCheck, children: [
    { key: 'daily.attendance',    label: 'الحضور والغياب',    icon: ClipboardCheck },
    { key: 'daily.biometric-log', label: 'سجل بصمات الطلاب',  icon: Fingerprint },
    { key: 'daily.lectures',      label: 'المحاضرات',         icon: NotebookPen },
  ]},
  { key: 'grades', label: 'الامتحانات والدرجات', icon: ClipboardList, children: [
    { key: 'grades.gradebook',        label: 'دفتر درجات المادة',  icon: NotebookPen },
    { key: 'grades.entry',            label: 'لوحة إدخال الدرجات', icon: ClipboardCheck },
    { key: 'grades.student-card',     label: 'البطاقة المدرسية',   icon: IdCard },
    { key: 'grades.section-summary',  label: 'ملخص الشعبة',        icon: BarChart3 },
    { key: 'grades.whatsapp',         label: 'رسائل واتساب',       icon: MessageCircle },
    { key: 'grades.monthly-followup', label: 'المتابعة الشهرية',   icon: CalendarDays },
    { key: 'grades.save-log',         label: 'سجل حفظ الدرجات',    icon: History },
  ]},
  { key: 'people', label: 'مركز الأشخاص', icon: Users, children: [
    { key: 'people.students',  label: 'الطلاب',    icon: GraduationCap },
    { key: 'people.teachers',  label: 'المعلمون',  icon: UserCheck },
    { key: 'people.employees', label: 'الموظفون',  icon: Briefcase },
    { key: 'people.persons',   label: 'الأشخاص',   icon: Users },
    { key: 'people.drivers',   label: 'السائقون',  icon: Truck },
  ]},
  { key: 'finance', label: 'الشؤون المالية', icon: Wallet, children: [
    { key: 'finance.installments',      label: 'الأقساط',           icon: Receipt },
    { key: 'finance.salaries',          label: 'الرواتب',           icon: Banknote },
    { key: 'finance.advances',          label: 'السلف',             icon: HandCoins },
    { key: 'finance.vouchers',          label: 'السندات والقيود',   icon: FileText },
    { key: 'finance.sales-invoices',    label: 'فواتير المبيعات',   icon: ShoppingCart },
    { key: 'finance.purchase-invoices', label: 'فواتير المشتريات',  icon: ShoppingBag },
    { key: 'finance.statement',         label: 'كشف الحساب',        icon: Wallet },
    { key: 'finance.chart',             label: 'شجرة الحسابات',     icon: Network },
    { key: 'finance.opening',           label: 'الرصيد الافتتاحي',  icon: Coins },
  ]},
  { key: 'resources', label: 'الموارد والمخزون', icon: Boxes, children: [
    { key: 'resources.uniforms',   label: 'بكجات الزي',       icon: Shirt },
    { key: 'resources.supplies',   label: 'بكجات القرطاسية',  icon: ShoppingBag },
    { key: 'resources.warehouses', label: 'المخازن والأصناف', icon: Warehouse },
  ]},
  { key: 'reports', label: 'التقارير', icon: BarChart3, children: [
    { key: 'reports', label: 'التقارير', icon: BarChart3 },
  ]},
];

/** عناصر ظاهرة دائماً (غير قابلة للإخفاء) — تُعرض في المعاينة فقط. */
export const PREVIEW_HOME: PreviewLeaf = { key: '__home', label: 'الرئيسية', icon: LayoutGrid };
export const PREVIEW_SETTINGS: PreviewGroup = {
  key: 'system', label: 'الإعدادات', icon: Settings, children: [
    { key: '__s_general',  label: 'الإعدادات العامة',   icon: SlidersHorizontal },
    { key: '__s_lookups',  label: 'القوائم المرجعية',    icon: Database },
    { key: '__s_security', label: 'المستخدمون والأمان', icon: Shield },
    { key: '__s_requests', label: 'الطلبات والاشتراك',  icon: ClipboardList },
  ],
};

export const ALL_GATEABLE_KEYS: string[] = GATEABLE_GROUPS.flatMap((g) => g.children.map((c) => c.key));

/** هل المفتاح ظاهر؟ (قائمة فارغة ⇒ كل الشاشات ظاهرة — مطابق لسلوك EDU Pro). */
export const isKeyVisible = (key: string, enabled: string[]): boolean =>
  enabled.length === 0 || enabled.includes(key);

export interface ModulePreset {
  name: string;
  /** قائمة مفاتيح صريحة، أو 'ALL' لكل الوحدات، أو 'NONE' لإلغاء التحديد. */
  keys: string[] | 'ALL' | 'NONE';
}

export const MODULE_PRESETS: ModulePreset[] = [
  { name: 'الكل', keys: 'ALL' },
  { name: 'إلغاء التحديد', keys: 'NONE' },
  {
    name: 'الأكاديمية',
    keys: [
      'grades.gradebook', 'grades.entry', 'grades.student-card', 'grades.section-summary',
      'grades.whatsapp', 'grades.monthly-followup', 'grades.save-log',
      'people.students', 'daily.attendance', 'daily.biometric-log',
    ],
  },
  {
    name: 'المالية الكاملة',
    keys: [
      'finance.installments', 'finance.salaries', 'finance.advances', 'finance.vouchers',
      'finance.sales-invoices', 'finance.purchase-invoices', 'finance.statement',
      'finance.chart', 'finance.opening', 'people.students',
    ],
  },
  { name: 'الأقساط فقط', keys: ['finance.installments', 'people.students'] },
  { name: 'الحضور فقط', keys: ['daily.attendance', 'daily.biometric-log'] },
];
