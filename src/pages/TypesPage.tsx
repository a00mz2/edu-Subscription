import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Clock, BadgeCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatNumber } from '../utils/format';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import {
  getSubscriptionTypes, createSubscriptionType, updateSubscriptionType, deleteSubscriptionType,
  type SubscriptionTypeDto,
} from '../api/subscriptionsApi';

const emptyForm = {
  subscriptionTypeName: '',
  durationDays: '30',
  price: '0',
  description: '',
  isTrial: false,
  isActive: true,
};

const getErr = (e: any): string => e?.response?.data?.message || 'حدث خطأ غير متوقع';

export const TypesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<SubscriptionTypeDto | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: types, isLoading } = useQuery({
    queryKey: ['types'],
    queryFn: () => getSubscriptionTypes(false),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['types'] });

  const buildRequest = () => ({
    subscriptionTypeName: form.subscriptionTypeName.trim(),
    durationDays: parseInt(form.durationDays, 10) || 0,
    price: parseFloat(form.price) || 0,
    description: form.description.trim(),
    isTrial: form.isTrial,
    isActive: form.isActive,
  });

  const createMutation = useMutation({
    mutationFn: () => createSubscriptionType(buildRequest()),
    onSuccess: () => { toast.success('تم إضافة نوع الاشتراك'); invalidate(); close(); },
    onError: (e) => toast.error(getErr(e)),
  });

  const updateMutation = useMutation({
    mutationFn: (id: number) => updateSubscriptionType(id, buildRequest()),
    onSuccess: () => { toast.success('تم تعديل نوع الاشتراك'); invalidate(); close(); },
    onError: (e) => toast.error(getErr(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSubscriptionType(id),
    onSuccess: () => { toast.success('تم حذف نوع الاشتراك'); invalidate(); },
    onError: (e) => toast.error(getErr(e)),
  });

  const close = () => { setIsOpen(false); setEditing(null); setForm(emptyForm); };
  const openAdd = () => { setEditing(null); setForm(emptyForm); setIsOpen(true); };
  const openEdit = (t: SubscriptionTypeDto) => {
    setEditing(t);
    setForm({
      subscriptionTypeName: t.subscriptionTypeName,
      durationDays: t.durationDays.toString(),
      price: t.price.toString(),
      description: t.description,
      isTrial: t.isTrial,
      isActive: t.isActive,
    });
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!form.subscriptionTypeName.trim()) { toast.error('اسم نوع الاشتراك مطلوب'); return; }
    if ((parseInt(form.durationDays, 10) || 0) < 1) { toast.error('عدد الأيام يجب أن يكون أكبر من صفر'); return; }
    if (editing) updateMutation.mutate(editing.subscriptionTypeId);
    else createMutation.mutate();
  };

  return (
    <div className="p-6" style={{ fontFamily: "'Tajawal', sans-serif" }} dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">أنواع الاشتراكات</h1>
          <p className="text-sm text-slate-500 mt-1">{types?.length ?? 0} نوع اشتراك</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openAdd}>إضافة نوع</Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-right">
              <th className="px-5 py-3 font-semibold">الاسم</th>
              <th className="px-5 py-3 font-semibold">المدة (أيام)</th>
              <th className="px-5 py-3 font-semibold">السعر</th>
              <th className="px-5 py-3 font-semibold">النوع</th>
              <th className="px-5 py-3 font-semibold">الحالة</th>
              <th className="px-5 py-3 font-semibold text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && <tr><td colSpan={6} className="text-center py-16 text-slate-400">جارٍ التحميل…</td></tr>}
            {!isLoading && !types?.length && <tr><td colSpan={6} className="text-center py-16 text-slate-400">لا توجد أنواع اشتراكات</td></tr>}
            {types?.map((t) => (
              <tr key={t.subscriptionTypeId} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3.5 font-semibold text-slate-800">{t.subscriptionTypeName}</td>
                <td className="px-5 py-3.5 text-slate-600">
                  <span className="inline-flex items-center gap-1.5"><Clock size={13} className="text-slate-400" />{t.durationDays}</span>
                </td>
                <td className="px-5 py-3.5 text-slate-600">{formatNumber(t.price)}</td>
                <td className="px-5 py-3.5">
                  {t.isTrial
                    ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100"><BadgeCheck size={11} />تجريبي</span>
                    : <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">عادي</span>}
                </td>
                <td className="px-5 py-3.5">
                  {t.isActive
                    ? <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">فعّال</span>
                    : <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">معطّل</span>}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => openEdit(t)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="تعديل"><Edit size={15} /></button>
                    <button onClick={() => { if (confirm('حذف نوع الاشتراك؟')) deleteMutation.mutate(t.subscriptionTypeId); }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="حذف"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isOpen} onClose={close} title={editing ? 'تعديل نوع الاشتراك' : 'إضافة نوع اشتراك'} size="sm">
        <div className="space-y-4">
          <Input label="اسم نوع الاشتراك" value={form.subscriptionTypeName} required
            onChange={(e) => setForm({ ...form, subscriptionTypeName: e.target.value })} placeholder="مثال: اشتراك شهري" />
          <div className="flex gap-4">
            <div className="flex-1"><Input label="عدد الأيام" type="number" value={form.durationDays} required onChange={(e) => setForm({ ...form, durationDays: e.target.value })} /></div>
            <div className="flex-1"><Input label="السعر" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
          </div>
          <Input label="الوصف" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="وصف اختياري" />
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={form.isTrial} onChange={(e) => setForm({ ...form, isTrial: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-indigo-600" />
              اشتراك تجريبي
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-indigo-600" />
              فعّال
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={close}>إلغاء</Button>
            <Button onClick={handleSave} loading={createMutation.isPending || updateMutation.isPending}>{editing ? 'حفظ التعديلات' : 'إضافة'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
