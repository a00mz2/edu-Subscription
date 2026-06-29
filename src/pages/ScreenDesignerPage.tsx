import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Monitor, Save, CheckSquare, Square, MinusSquare, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { EduProPreview } from '../components/EduProPreview';
import { GATEABLE_GROUPS, ALL_GATEABLE_KEYS, MODULE_PRESETS } from '../constants/modules';
import { getSubscriptionAccounts, updateSubscriptionAccount } from '../api/subscriptionsApi';

const getErr = (e: any): string => e?.response?.data?.message || 'حدث خطأ غير متوقع';

export const ScreenDesignerPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [accountId, setAccountId] = useState(0);
  const [enabled, setEnabled] = useState<string[]>([]);
  const loadedRef = useRef<number | null>(null);

  const { data: paged } = useQuery({
    queryKey: ['accounts', 'designer'],
    queryFn: () => getSubscriptionAccounts(1, 200, '', ''),
  });
  const accounts = paged?.data ?? [];
  const selected = accounts.find((a) => a.subscriptionAccountId === accountId);

  useEffect(() => {
    if (accounts.length && accountId === 0) setAccountId(accounts[0].subscriptionAccountId);
  }, [accounts, accountId]);

  useEffect(() => {
    const sel = accounts.find((a) => a.subscriptionAccountId === accountId);
    if (sel && loadedRef.current !== accountId) {
      setEnabled(sel.enabledModules ?? []);
      loadedRef.current = accountId;
    }
  }, [accountId, accounts]);

  const enabledSet = new Set(enabled);
  const baseline = selected?.enabledModules ?? [];
  const dirty = accountId !== 0 &&
    (enabled.length !== baseline.length || [...enabled].sort().join(',') !== [...baseline].sort().join(','));

  const toggleKey = (key: string) => {
    const next = new Set(enabledSet);
    next.has(key) ? next.delete(key) : next.add(key);
    setEnabled([...next]);
  };
  const toggleGroup = (keys: string[]) => {
    const allOn = keys.every((k) => enabledSet.has(k));
    const next = new Set(enabledSet);
    keys.forEach((k) => (allOn ? next.delete(k) : next.add(k)));
    setEnabled([...next]);
  };
  const applyPreset = (keys: string[] | 'ALL' | 'NONE') => {
    if (keys === 'ALL') setEnabled([...ALL_GATEABLE_KEYS]);
    else if (keys === 'NONE') setEnabled([]);
    else setEnabled(keys.filter((k) => ALL_GATEABLE_KEYS.includes(k)));
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const a = selected!;
      return updateSubscriptionAccount(a.subscriptionAccountId, {
        subscriberName: a.subscriberName, address: a.address, phone: a.phone,
        dbHost: a.dbHost, dbPort: a.dbPort, dbName: a.dbName, dbUsername: a.dbUsername,
        programUrl: a.programUrl, enabledModules: enabled, isActive: a.isActive,
      });
    },
    onSuccess: () => {
      toast.success('تم حفظ التصميم — سيظهر للعميل خلال لحظات');
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['accounts-summary'] });
    },
    onError: (e) => toast.error(getErr(e)),
  });

  const visibleCount = enabled.length === 0 ? ALL_GATEABLE_KEYS.length : enabled.length;

  return (
    <div className="p-6" style={{ fontFamily: "'Tajawal', sans-serif" }} dir="rtl">
      {/* Header */}
      <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Monitor size={22} className="text-indigo-600" /> تصميم واجهة العميل
          </h1>
          <p className="text-sm text-slate-500 mt-1">حدّد الشاشات الظاهرة لكل عميل، وتصفّح معاينة تفاعلية لواجهته كأنك داخل البرنامج.</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={accountId} onChange={(e) => setAccountId(parseInt(e.target.value, 10))}
            className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 min-w-[200px]">
            <option value={0}>اختر الحساب…</option>
            {accounts.map((a) => <option key={a.subscriptionAccountId} value={a.subscriptionAccountId}>{a.subscriberName}</option>)}
          </select>
          <Button icon={<Save size={16} />} loading={saveMutation.isPending} disabled={!dirty} onClick={() => saveMutation.mutate()}>
            حفظ التصميم
          </Button>
        </div>
      </div>

      {!selected ? (
        <div className="bg-white rounded-2xl border border-slate-200 py-20 text-center text-slate-400">
          اختر حسابًا من القائمة أعلاه للبدء بتصميم واجهته.
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-6 items-start">
          {/* ── لوحة التحكّم ── */}
          <div className="w-full xl:w-[400px] shrink-0 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700">الشاشات المتاحة</h2>
              <span className="text-xs font-medium text-slate-500">{visibleCount} من {ALL_GATEABLE_KEYS.length} شاشة ظاهرة</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {MODULE_PRESETS.map((p) => (
                <button key={p.name} type="button" onClick={() => applyPreset(p.keys)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                  {p.name}
                </button>
              ))}
            </div>

            {enabled.length === 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-700">
                <Eye size={14} /> لم تحدّد أي شاشة — سيرى العميل <b>كل الشاشات</b> (الوضع الافتراضي).
              </div>
            )}

            <div className="space-y-3 max-h-[62vh] overflow-y-auto pe-1">
              {GATEABLE_GROUPS.map((g) => {
                const keys = g.children.map((c) => c.key);
                const on = keys.filter((k) => enabledSet.has(k)).length;
                const allOn = on === keys.length;
                const GroupCheck = allOn ? CheckSquare : on > 0 ? MinusSquare : Square;
                return (
                  <div key={g.key} className="rounded-xl border border-slate-100 bg-slate-50/40">
                    <button type="button" onClick={() => toggleGroup(keys)}
                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-100/70 rounded-t-xl transition-colors">
                      <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <GroupCheck size={16} className={on > 0 ? 'text-indigo-600' : 'text-slate-300'} />
                        <g.icon size={15} className="text-slate-400" />
                        {g.label}
                      </span>
                      <span className="text-[11px] text-slate-400">{on}/{keys.length}</span>
                    </button>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 px-3 pb-3 pt-1">
                      {g.children.map((it) => (
                        <label key={it.key} className="flex items-center gap-2 text-[13px] text-slate-600 cursor-pointer py-0.5">
                          <input type="checkbox" checked={enabledSet.has(it.key)} onChange={() => toggleKey(it.key)}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600" />
                          <it.icon size={14} className="text-slate-400 shrink-0" />
                          <span className="truncate">{it.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── المعاينة التفاعلية ── */}
          <div className="flex-1 min-w-0 w-full xl:sticky xl:top-6">
            <div className="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700">
              <Eye size={15} className="text-indigo-600" /> معاينة تفاعلية — اضغط على القوائم وادخل الشاشات
            </div>
            <EduProPreview enabled={enabled} subscriberName={selected.subscriberName} />
          </div>
        </div>
      )}
    </div>
  );
};
