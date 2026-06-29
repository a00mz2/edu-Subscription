import React, { useEffect, useState } from 'react';
import {
  Search, Bell, X, ChevronDown, Plus, Printer, Download, Save, RefreshCw, Send,
  GraduationCap, Eye, Pencil, Trash2, Folder, ChevronLeft, Moon, Palette, type LucideIcon,
} from 'lucide-react';
import {
  GATEABLE_GROUPS, PREVIEW_HOME, PREVIEW_SETTINGS, isKeyVisible,
} from '../constants/modules';
import { SCREEN_SPECS, type ScreenSpec } from '../constants/previewScreens';

const NAMES = ['محمد أحمد', 'زينب علي', 'حسن كريم', 'فاطمة جواد', 'عمر صالح',
  'نور الهدى', 'يوسف حيدر', 'مريم سعد', 'علي رياض', 'سارة ناصر'];

const btnIcon = (label: string): LucideIcon => {
  if (/طباعة/.test(label)) return Printer;
  if (/تصدير|CSV|Excel/.test(label)) return Download;
  if (/حفظ/.test(label)) return Save;
  if (/تحديث|تحميل|عرض|توليد/.test(label)) return RefreshCw;
  if (/إرسال|فتح/.test(label)) return Send;
  return Plus;
};

const groupOf = (key: string): string | null =>
  GATEABLE_GROUPS.find((g) => g.children.some((c) => c.key === key))?.key
  ?? (key.startsWith('__s_') ? 'system' : null);

// ── shell ──────────────────────────────────────────────────────────────────
export const EduProPreview: React.FC<{ enabled: string[]; subscriberName: string }> = ({ enabled, subscriberName }) => {
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set(['daily', 'people', 'finance']));
  const [activeKey, setActiveKey] = useState('__home');
  const [tabs, setTabs] = useState<{ key: string; title: string }[]>([{ key: '__home', title: 'الرئيسية' }]);

  // إن أصبحت الشاشة النشطة مخفيّة بعد تغيير التحديد → عُد للرئيسية ونظّف التبويبات
  useEffect(() => {
    const allowed = (k: string) => k === '__home' || k.startsWith('__s_') || isKeyVisible(k, enabled);
    setTabs((t) => {
      const next = t.filter((x) => allowed(x.key));
      return next.length ? next : [{ key: '__home', title: 'الرئيسية' }];
    });
    if (!allowed(activeKey)) setActiveKey('__home');
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const openLeaf = (key: string, title: string) => {
    setActiveKey(key);
    const g = groupOf(key);
    if (g) setOpenGroups((s) => new Set(s).add(g));
    setTabs((t) => (t.some((x) => x.key === key) ? t : [...t, { key, title }]));
  };
  const closeTab = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (key === '__home') return;
    setTabs((t) => {
      const idx = t.findIndex((x) => x.key === key);
      const next = t.filter((x) => x.key !== key);
      if (activeKey === key) setActiveKey((next[idx - 1] ?? next[next.length - 1] ?? { key: '__home' }).key);
      return next.length ? next : [{ key: '__home', title: 'الرئيسية' }];
    });
  };
  const toggleGroup = (k: string) =>
    setOpenGroups((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; });

  const spec = SCREEN_SPECS[activeKey] ?? SCREEN_SPECS.__home;

  const NavLeaf: React.FC<{ leaf: { key: string; label: string; icon: LucideIcon }; sub?: boolean }> = ({ leaf, sub }) => {
    const active = activeKey === leaf.key;
    return (
      <button onClick={() => openLeaf(leaf.key, leaf.label)}
        className={`w-full flex items-center gap-2 rounded-lg transition-colors ${sub ? 'px-2 py-1.5 text-[11.5px]' : 'px-2.5 py-2 text-[12.5px] font-medium'} ${
          active ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}>
        <leaf.icon size={sub ? 13 : 15} className={active ? 'text-indigo-600' : 'text-slate-400'} />
        <span className="truncate text-right flex-1">{leaf.label}</span>
      </button>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 shadow-xl overflow-hidden bg-white select-none">
      {/* شريط العنوان */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 border-b border-slate-200">
        <span className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </span>
        <span className="text-[11px] text-slate-500 mx-auto">EDU Pro — {subscriberName}</span>
      </div>

      <div className="flex" style={{ height: 620 }} dir="rtl">
        {/* الشريط الجانبي */}
        <aside className="w-56 bg-white border-l border-slate-100 flex flex-col shrink-0">
          <div className="px-3 py-3 border-b border-slate-100 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white"><GraduationCap size={15} /></div>
            <div className="leading-tight"><div className="text-[12px] font-bold text-slate-800">EDU Pro</div><div className="text-[9px] text-slate-400">نظام إدارة المدرسة</div></div>
          </div>

          <nav className="flex-1 overflow-y-auto py-2 px-1.5 space-y-0.5">
            <NavLeaf leaf={PREVIEW_HOME} />

            {GATEABLE_GROUPS.map((g) => {
              const visible = g.children.filter((c) => isKeyVisible(c.key, enabled));
              if (visible.length === 0) return null;
              if (g.key === 'reports') return <NavLeaf key={g.key} leaf={{ key: 'reports', label: g.label, icon: g.icon }} />;
              const open = openGroups.has(g.key);
              return (
                <div key={g.key}>
                  <button onClick={() => toggleGroup(g.key)}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[12.5px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                    <span className="flex items-center gap-2"><g.icon size={15} className="text-slate-400" /> {g.label}</span>
                    <ChevronDown size={12} className={`text-slate-300 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open && (
                    <div className="mr-3 pr-2 border-r border-slate-100 space-y-px mt-0.5">
                      {visible.map((c) => <NavLeaf key={c.key} leaf={c} sub />)}
                    </div>
                  )}
                </div>
              );
            })}

            {/* الإعدادات (دائماً) */}
            <div>
              <button onClick={() => toggleGroup('system')}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[12.5px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                <span className="flex items-center gap-2"><PREVIEW_SETTINGS.icon size={15} className="text-slate-400" /> {PREVIEW_SETTINGS.label}</span>
                <ChevronDown size={12} className={`text-slate-300 transition-transform ${openGroups.has('system') ? 'rotate-180' : ''}`} />
              </button>
              {openGroups.has('system') && (
                <div className="mr-3 pr-2 border-r border-slate-100 space-y-px mt-0.5">
                  {PREVIEW_SETTINGS.children.map((c) => <NavLeaf key={c.key} leaf={c} sub />)}
                </div>
              )}
            </div>
          </nav>

          <div className="px-3 py-2.5 border-t border-slate-100 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[11px] font-bold">{subscriberName?.charAt(0)}</div>
            <div className="leading-tight min-w-0"><div className="text-[11px] font-semibold text-slate-700 truncate">{subscriberName}</div><div className="text-[9px] text-slate-400">مستخدم</div></div>
          </div>
        </aside>

        {/* العمود الرئيسي */}
        <div className="flex-1 bg-slate-50 flex flex-col min-w-0">
          {/* شريط علوي */}
          <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-slate-100">
            <div className="flex items-center gap-2 flex-1 max-w-xs bg-slate-100 rounded-lg px-2.5 py-1.5">
              <Search size={13} className="text-slate-400" /><span className="text-[11px] text-slate-400">بحث سريع… (Ctrl+K)</span>
            </div>
            <Palette size={15} className="text-slate-400" />
            <Moon size={15} className="text-slate-400" />
            <Bell size={15} className="text-slate-400" />
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-[11px] font-bold">{subscriberName?.charAt(0)}</div>
          </div>

          {/* شريط التبويبات */}
          <div className="flex items-center gap-1 px-2 py-1.5 bg-white border-b border-slate-100 overflow-x-auto">
            {tabs.map((t) => {
              const active = activeKey === t.key;
              return (
                <button key={t.key} onClick={() => setActiveKey(t.key)}
                  className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] whitespace-nowrap transition-colors ${
                    active ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}>
                  {t.title}
                  {t.key !== '__home' && (
                    <span onClick={(e) => closeTab(t.key, e)} className="opacity-50 hover:opacity-100 hover:text-red-500"><X size={12} /></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* المحتوى */}
          <div className="flex-1 overflow-auto p-4">
            <ScreenView spec={spec} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ── shared bits ──────────────────────────────────────────────────────────────
const ToolbarBtn: React.FC<{ label: string; primary?: boolean }> = ({ label, primary }) => {
  const Icon = btnIcon(label);
  return (
    <button className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-semibold border transition-colors ${
      primary ? 'bg-indigo-600 text-white border-transparent hover:bg-indigo-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
      <Icon size={13} /> {label}
    </button>
  );
};

const PageHeader: React.FC<{ spec: ScreenSpec }> = ({ spec }) => (
  <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
    <h2 className="text-lg font-bold text-slate-800">{spec.title}</h2>
    {spec.toolbar.length > 0 && (
      <div className="flex gap-2">{spec.toolbar.map((b, i) => <ToolbarBtn key={b} label={b} primary={i === 0} />)}</div>
    )}
  </div>
);

const FilterBar: React.FC<{ filters: string[] }> = ({ filters }) => filters.length === 0 ? null : (
  <div className="flex flex-wrap gap-2 mb-3">
    {filters.map((f) => /بحث|…/.test(f)
      ? <div key={f} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-400 min-w-[180px]"><Search size={12} /> {f}</div>
      : <div key={f} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-600"><span className="text-slate-400">{f}:</span> <span className="text-slate-300">الكل</span> <ChevronDown size={11} className="text-slate-300" /></div>)}
  </div>
);

const StatCards: React.FC<{ stats: string[] }> = ({ stats }) => stats.length === 0 ? null : (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
    {stats.map((s, i) => (
      <div key={s} className="bg-white rounded-xl border border-slate-100 p-3">
        <div className="text-[10px] text-slate-400 mb-1 truncate">{s}</div>
        <div className="text-base font-bold text-slate-700">{[128, 540, '12,500', 36, 18, 6, 3, 24][i % 8]}</div>
      </div>
    ))}
  </div>
);

const colType = (col: string): string => {
  if (col === '#' || col === 'م') return 'index';
  if (/الصورة/.test(col)) return 'avatar';
  if (/^(حاضر|غائب|مجاز|جزئي)$/.test(col)) return 'check';
  if (/اسم|الطالب|المعلم|الموظف|المورد|الحساب|التخصص|المادة|البيان|الموضوع|الرسالة/.test(col)) return 'name';
  if (/تاريخ|التاريخ|الوقت/.test(col)) return 'date';
  if (/إجراءات|الإجراءات|حذف|الإرسال/.test(col)) return 'actions';
  if (/الحالة|النجاح|النتيجة|النوع|الجنس|نوع الدفع|الطريقة/.test(col)) return 'badge';
  if (/مدين|دائن|الرصيد|الإجمالي|الصافي|المتبقي|الخصم|المبلغ|إجمالي|الدرجة|الكمية|عدد|درجة|الشهر|تحريري|يومي|الفصل|نصف|السعي|الامتحان|المعدل|الرياضيات|العلوم|اللغة|الإنجليزية|المقاعد/.test(col)) return 'num';
  if (/الصف|الشعبة|المقاس|اللون|الجهاز/.test(col)) return 'text';
  return 'bar';
};

const Cell: React.FC<{ col: string; i: number }> = ({ col, i }) => {
  switch (colType(col)) {
    case 'index': return <span className="text-slate-400">{i + 1}</span>;
    case 'avatar': return <span className="inline-flex w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 items-center justify-center text-[9px] font-bold">{NAMES[i % NAMES.length].charAt(0)}</span>;
    case 'name': return <span className="text-slate-700 font-medium">{NAMES[i % NAMES.length]}</span>;
    case 'date': return <span className="text-slate-500">2026/06/{String((i % 27) + 1).padStart(2, '0')}</span>;
    case 'num': return <span className="text-slate-600">{(i + 1) * 25 + 75}</span>;
    case 'text': return <span className="text-slate-500">—</span>;
    case 'check': return <span className={`inline-block w-3.5 h-3.5 rounded-full border ${i % 4 === 0 ? 'bg-emerald-400 border-emerald-400' : 'border-slate-300'}`} />;
    case 'badge': return <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-600">نشط</span>;
    case 'actions': return <span className="inline-flex gap-1 text-slate-300"><Eye size={12} /><Pencil size={12} /><Trash2 size={12} /></span>;
    default: return <span className="inline-block h-2 w-12 rounded bg-slate-100" />;
  }
};

const MockTable: React.FC<{ spec: ScreenSpec }> = ({ spec }) => (
  <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-[11px] whitespace-nowrap">
        <thead><tr className="bg-slate-50 text-slate-500 text-right">
          {spec.columns.map((c, i) => <th key={i} className="px-3 py-2 font-semibold">{c}</th>)}
        </tr></thead>
        <tbody className="divide-y divide-slate-50">
          {Array.from({ length: spec.sampleRows || 6 }).map((_, r) => (
            <tr key={r} className="hover:bg-slate-50/50">
              {spec.columns.map((c, ci) => <td key={ci} className="px-3 py-2"><Cell col={c} i={r} /></td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="flex items-center justify-between px-3 py-2 border-t border-slate-50 text-[10px] text-slate-400">
      <span>عرض {spec.sampleRows || 6} من 142</span>
      <span className="flex items-center gap-1"><ChevronLeft size={12} /> صفحة 1 من 12</span>
    </div>
  </div>
);

const FeatureGrid: React.FC<{ items: string[] }> = ({ items }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
    {items.map((t, i) => (
      <div key={t} className="bg-white rounded-xl border border-slate-100 p-4 hover:border-indigo-200 hover:shadow-sm transition cursor-pointer">
        <div className={`w-9 h-9 rounded-lg mb-2.5 flex items-center justify-center ${['bg-indigo-100 text-indigo-600', 'bg-emerald-100 text-emerald-600', 'bg-amber-100 text-amber-600', 'bg-blue-100 text-blue-600', 'bg-violet-100 text-violet-600', 'bg-rose-100 text-rose-600'][i % 6]}`}>
          <Folder size={17} />
        </div>
        <div className="text-[12.5px] font-semibold text-slate-700">{t}</div>
        <div className="text-[10px] text-slate-400 mt-0.5">فتح الإدارة</div>
      </div>
    ))}
  </div>
);

const MultiColLists: React.FC<{ titles: string[] }> = ({ titles }) => (
  <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${titles.length}, minmax(0,1fr))` }}>
    {titles.map((t) => (
      <div key={t} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="px-3 py-2 bg-slate-50 text-[11.5px] font-semibold text-slate-600 border-b border-slate-100">{t}</div>
        <div className="divide-y divide-slate-50">
          {NAMES.slice(0, 6).map((n, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2 text-[11px]">
              <span className="text-slate-600">{n}</span><span className="text-slate-300">{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const TwoPane: React.FC<{ spec: ScreenSpec }> = ({ spec }) => {
  const tabbed = spec.key === 'finance.salaries' || spec.key === 'finance.vouchers';
  const fields = tabbed ? ['التاريخ', 'الحساب', 'المبلغ', 'البيان'] : spec.columns;
  return (
    <div>
      {tabbed && (
        <div className="flex gap-1.5 mb-3">
          {spec.columns.map((t, i) => (
            <button key={t} className={`px-3 py-1.5 rounded-lg text-[11.5px] font-semibold ${i === 0 ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>{t}</button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-[1.1fr_1fr] gap-3">
        {/* قائمة */}
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <div className="px-3 py-2 bg-slate-50 text-[11.5px] font-semibold text-slate-600 border-b border-slate-100 flex items-center justify-between">القائمة <ToolbarBtn label="جديد" primary /></div>
          <div className="divide-y divide-slate-50">
            {NAMES.slice(0, spec.sampleRows || 6).map((n, i) => (
              <div key={i} className={`flex items-center justify-between px-3 py-2 text-[11px] cursor-pointer ${i === 0 ? 'bg-indigo-50/60' : 'hover:bg-slate-50'}`}>
                <span className="text-slate-700 font-medium">{n}</span><ChevronLeft size={12} className="text-slate-300" />
              </div>
            ))}
          </div>
        </div>
        {/* تفاصيل/نموذج */}
        <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-3 self-start">
          <div className="text-[12px] font-bold text-slate-700">التفاصيل</div>
          {fields.map((f) => (
            <div key={f}>
              <div className="text-[10.5px] text-slate-400 mb-1">{f}</div>
              <div className="h-7 rounded-lg border border-slate-200 bg-slate-50/50" />
            </div>
          ))}
          <div className="flex gap-2 pt-1">{spec.toolbar.map((b, i) => <ToolbarBtn key={b} label={b} primary={i === 0} />)}</div>
        </div>
      </div>
    </div>
  );
};

const AccountTree: React.FC = () => {
  const tree = [
    { code: '1', name: 'الأصول', bal: '85,000,000', depth: 0, parent: true },
    { code: '11', name: 'الأصول المتداولة', bal: '60,000,000', depth: 1, parent: true },
    { code: '1101', name: 'الصندوق', bal: '12,500,000', depth: 2 },
    { code: '1102', name: 'المصارف', bal: '32,000,000', depth: 2 },
    { code: '1103', name: 'العملاء (الطلاب)', bal: '15,500,000', depth: 2 },
    { code: '2', name: 'الالتزامات', bal: '20,000,000', depth: 0, parent: true },
    { code: '21', name: 'الموردون', bal: '8,000,000', depth: 1 },
    { code: '4', name: 'الإيرادات', bal: '120,000,000', depth: 0, parent: true },
    { code: '41', name: 'إيرادات الأقساط', bal: '110,000,000', depth: 1 },
  ];
  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
      <div className="grid grid-cols-[1fr_auto_auto] gap-3 px-3 py-2 bg-slate-50 text-[10.5px] font-semibold text-slate-500 border-b border-slate-100">
        <span>اسم الحساب</span><span>النوع</span><span>الرصيد</span>
      </div>
      <div className="divide-y divide-slate-50">
        {tree.map((a) => (
          <div key={a.code} className="grid grid-cols-[1fr_auto_auto] gap-3 px-3 py-2 text-[11px] hover:bg-slate-50/50 items-center">
            <span className="flex items-center gap-1.5 text-slate-700" style={{ paddingRight: a.depth * 16 }}>
              {a.parent ? <ChevronDown size={12} className="text-slate-400" /> : <span className="w-3" />}
              <span className="text-slate-400 text-[10px]">{a.code}</span>
              <span className={a.parent ? 'font-semibold' : ''}>{a.name}</span>
            </span>
            <span><span className="px-2 py-0.5 rounded-full text-[9px] bg-slate-100 text-slate-500">{a.parent ? 'رئيسي' : 'فرعي'}</span></span>
            <span className="text-slate-600 tabular-nums">{a.bal}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const DashboardView: React.FC<{ spec: ScreenSpec }> = ({ spec }) => {
  const hero = spec.stats.slice(0, 4);
  const rest = spec.stats.slice(4);
  const heroColors = ['from-rose-500 to-rose-600', 'from-indigo-500 to-indigo-600', 'from-emerald-500 to-emerald-600', 'from-amber-500 to-amber-600'];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {hero.map((s, i) => (
          <div key={s} className={`rounded-xl p-3.5 text-white bg-gradient-to-br ${heroColors[i % 4]} shadow-sm`}>
            <div className="text-[10.5px] opacity-90 mb-1">{s}</div>
            <div className="text-xl font-bold">{['1,250,000', '540', '12,500,000', '36'][i % 4]}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {['تسجيل طالب', 'قبض قسط', 'تسجيل حضور', 'إصدار سند'].map((q) => (
          <button key={q} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-50">{q}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 p-3">
          <div className="text-[11.5px] font-semibold text-slate-600 mb-3">المدفوعات الشهرية</div>
          <div className="flex items-end gap-2 h-32">
            {[40, 65, 50, 80, 60, 90, 75, 55, 85, 70, 95, 60].map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-indigo-200" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-3 flex flex-col items-center justify-center">
          <div className="text-[11.5px] font-semibold text-slate-600 mb-3 self-start">توزيع الطلاب</div>
          <div className="w-28 h-28 rounded-full" style={{ background: 'conic-gradient(#6366f1 0 45%, #34d399 45% 72%, #fbbf24 72% 90%, #f43f5e 90% 100%)' }} />
        </div>
      </div>
      {rest.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {rest.map((s, i) => (
            <div key={s} className="bg-white rounded-xl border border-slate-100 p-3">
              <div className="text-[10px] text-slate-400 mb-1">{s}</div>
              <div className="text-base font-bold text-slate-700">{[1240, 12, 28, 96][i % 4]}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FormView: React.FC<{ spec: ScreenSpec }> = ({ spec }) => (
  <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
    <div className="grid grid-cols-[auto_1fr_120px] gap-3 px-3 py-2 bg-slate-50 text-[10.5px] font-semibold text-slate-500 border-b border-slate-100">
      {spec.columns.map((c) => <span key={c}>{c}</span>)}
    </div>
    <div className="divide-y divide-slate-50">
      {Array.from({ length: spec.sampleRows || 8 }).map((_, i) => (
        <div key={i} className="grid grid-cols-[auto_1fr_120px] gap-3 px-3 py-2 items-center text-[11px]">
          <span className="text-slate-400 w-5">{i + 1}</span>
          <span className="text-slate-700 font-medium">{NAMES[i % NAMES.length]}</span>
          <input className="h-7 rounded-lg border border-slate-200 bg-slate-50/40 px-2 text-[11px]" placeholder="0-100" />
        </div>
      ))}
    </div>
  </div>
);

// ── screen dispatcher ──────────────────────────────────────────────────────
const ScreenView: React.FC<{ spec: ScreenSpec }> = ({ spec }) => {
  if (spec.kind === 'dashboard') return (<><PageHeader spec={spec} /><DashboardView spec={spec} /></>);
  if (spec.kind === 'hub') return (<><PageHeader spec={spec} /><FilterBar filters={spec.filters} /><StatCards stats={spec.stats} /><FeatureGrid items={spec.columns.length ? spec.columns : spec.toolbar} /></>);
  if (spec.kind === 'tree') return (<><PageHeader spec={spec} /><FilterBar filters={spec.filters} /><AccountTree /></>);
  if (spec.kind === 'split') return (<><PageHeader spec={spec} /><FilterBar filters={spec.filters} /><TwoPane spec={spec} /></>);
  if (spec.kind === 'form') return (<><PageHeader spec={spec} /><FilterBar filters={spec.filters} /><FormView spec={spec} /></>);
  if (spec.kind === 'cards') {
    if (spec.columns.length) return (<><PageHeader spec={spec} /><FeatureGrid items={spec.columns} /></>);
    return (<><PageHeader spec={spec} /><FilterBar filters={spec.filters} /><MultiColLists titles={spec.stats} /></>);
  }
  // table
  return (<><PageHeader spec={spec} /><FilterBar filters={spec.filters} /><StatCards stats={spec.stats} /><MockTable spec={spec} /></>);
};
