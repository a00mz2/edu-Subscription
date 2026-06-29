import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Edit, Trash2, Search, RefreshCw, Users, History,
  CreditCard, ShieldCheck, ChevronLeft, ChevronRight,
  Database, Plug, AlertTriangle, Link2, Copy, PauseCircle, PlayCircle,
  LayoutGrid, CheckSquare, Square,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatNumber, formatDate } from '../utils/format';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { MODULE_PRESETS } from '../constants/modules';
import {
  getSubscriptionAccounts, getAccountsSummary, createSubscriptionAccount, updateSubscriptionAccount, deleteSubscriptionAccount,
  testClientConnection, getClientRoles, regenerateAccessToken, buildAccessUrl, getModulesCatalog,
  getSubscriptionTypes, getAccountSubscriptions, createSubscription, renewSubscription, deleteSubscription,
  suspendSubscription, resumeSubscription,
  getAccountUsers, createSubscriptionUser, updateSubscriptionUser, deleteSubscriptionUser, runExpiryCheck,
  type SubscriptionAccountDto, type SubscriptionUserDto,
} from '../api/subscriptionsApi';

const copyLink = (token: string) => {
  navigator.clipboard.writeText(buildAccessUrl(token))
    .then(() => toast.success('تم نسخ رابط الدخول'))
    .catch(() => toast.error('تعذّر نسخ الرابط'));
};

const getErr = (e: any): string => e?.response?.data?.message || 'حدث خطأ غير متوقع';

const emptyAccount = {
  subscriberName: '', address: '', phone: '', isActive: true,
  dbHost: '', dbPort: '5432', dbName: '', dbUsername: '', dbPassword: '', programUrl: '',
  enabledModules: [] as string[],
};
const emptyUser = { userName: '', password: '', fullName: '', clientRoleId: 0, isSuperAdmin: false, isActive: true };

export const AccountsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('');

  const [accModalOpen, setAccModalOpen] = useState(false);
  const [editingAcc, setEditingAcc] = useState<SubscriptionAccountDto | null>(null);
  const [accForm, setAccForm] = useState(emptyAccount);

  const [subModalOpen, setSubModalOpen] = useState(false);
  const [subAccount, setSubAccount] = useState<SubscriptionAccountDto | null>(null);
  const [subTypeId, setSubTypeId] = useState(0);

  const [histAccount, setHistAccount] = useState<SubscriptionAccountDto | null>(null);

  const [usersAccount, setUsersAccount] = useState<SubscriptionAccountDto | null>(null);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SubscriptionUserDto | null>(null);
  const [userForm, setUserForm] = useState(emptyUser);

  const { data: paged, isLoading } = useQuery({
    queryKey: ['accounts', page, search, status],
    queryFn: () => getSubscriptionAccounts(page, 20, search, status),
  });

  const { data: summary } = useQuery({
    queryKey: ['accounts-summary'],
    queryFn: getAccountsSummary,
  });

  const { data: types } = useQuery({
    queryKey: ['types', 'active'],
    queryFn: () => getSubscriptionTypes(true),
  });

  const { data: modulesCatalog } = useQuery({
    queryKey: ['modules-catalog'],
    queryFn: getModulesCatalog,
    staleTime: Infinity,
  });

  const { data: history } = useQuery({
    queryKey: ['account-subscriptions', histAccount?.subscriptionAccountId],
    queryFn: () => getAccountSubscriptions(histAccount!.subscriptionAccountId),
    enabled: !!histAccount,
  });

  const { data: users } = useQuery({
    queryKey: ['account-users', usersAccount?.subscriptionAccountId],
    queryFn: () => getAccountUsers(usersAccount!.subscriptionAccountId),
    enabled: !!usersAccount,
  });

  const { data: clientRoles, isError: rolesError } = useQuery({
    queryKey: ['client-roles', usersAccount?.subscriptionAccountId],
    queryFn: () => getClientRoles(usersAccount!.subscriptionAccountId),
    enabled: !!usersAccount && !!usersAccount.dbConfigured,
    retry: false,
  });

  const invalidateAccounts = () => {
    queryClient.invalidateQueries({ queryKey: ['accounts'] });
    queryClient.invalidateQueries({ queryKey: ['accounts-summary'] });
  };

  const saveAccMutation = useMutation({
    mutationFn: async () => {
      const dbPort = parseInt(accForm.dbPort, 10) || 5432;
      if (editingAcc) {
        await updateSubscriptionAccount(editingAcc.subscriptionAccountId, {
          subscriberName: accForm.subscriberName.trim(),
          address: accForm.address.trim(),
          phone: accForm.phone.trim(),
          dbHost: accForm.dbHost.trim(),
          dbPort,
          dbName: accForm.dbName.trim(),
          dbUsername: accForm.dbUsername.trim(),
          dbPassword: accForm.dbPassword ? accForm.dbPassword : undefined,
          programUrl: accForm.programUrl.trim(),
          enabledModules: accForm.enabledModules,
          isActive: accForm.isActive,
        });
        return;
      }
      await createSubscriptionAccount({
        subscriberName: accForm.subscriberName.trim(),
        address: accForm.address.trim(),
        phone: accForm.phone.trim(),
        dbHost: accForm.dbHost.trim(),
        dbPort,
        dbName: accForm.dbName.trim(),
        dbUsername: accForm.dbUsername.trim(),
        dbPassword: accForm.dbPassword,
        programUrl: accForm.programUrl.trim(),
        enabledModules: accForm.enabledModules,
        isActive: accForm.isActive,
      });
    },
    onSuccess: () => { toast.success(editingAcc ? 'تم تعديل الحساب' : 'تم إنشاء الحساب'); invalidateAccounts(); closeAccModal(); },
    onError: (e) => toast.error(getErr(e)),
  });

  const deleteAccMutation = useMutation({
    mutationFn: (id: number) => deleteSubscriptionAccount(id),
    onSuccess: () => { toast.success('تم حذف الحساب'); invalidateAccounts(); },
    onError: (e) => toast.error(getErr(e)),
  });

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      if (subAccount!.currentSubscriptionId) {
        await renewSubscription(subAccount!.subscriptionAccountId, { subscriptionTypeId: subTypeId });
        return;
      }
      await createSubscription({ subscriptionAccountId: subAccount!.subscriptionAccountId, subscriptionTypeId: subTypeId });
    },
    onSuccess: () => {
      toast.success('تم حفظ الاشتراك');
      invalidateAccounts();
      queryClient.invalidateQueries({ queryKey: ['account-subscriptions'] });
      setSubModalOpen(false);
      setSubAccount(null);
    },
    onError: (e) => toast.error(getErr(e)),
  });

  const deleteSubMutation = useMutation({
    mutationFn: (id: number) => deleteSubscription(id),
    onSuccess: () => {
      toast.success('تم حذف الاشتراك');
      invalidateAccounts();
      queryClient.invalidateQueries({ queryKey: ['account-subscriptions'] });
    },
    onError: (e) => toast.error(getErr(e)),
  });

  const suspendMutation = useMutation({
    mutationFn: (accountId: number) => suspendSubscription(accountId),
    onSuccess: () => { toast.success('تم إيقاف الاشتراك مؤقتاً'); invalidateAccounts(); },
    onError: (e) => toast.error(getErr(e)),
  });

  const resumeMutation = useMutation({
    mutationFn: (accountId: number) => resumeSubscription(accountId),
    onSuccess: () => { toast.success('تم استئناف الاشتراك'); invalidateAccounts(); },
    onError: (e) => toast.error(getErr(e)),
  });

  const saveUserMutation = useMutation({
    mutationFn: async () => {
      if (editingUser) {
        await updateSubscriptionUser(editingUser.subscriptionUserId, {
          userName: userForm.userName.trim(),
          password: userForm.password ? userForm.password : undefined,
          fullName: userForm.fullName.trim(),
          clientRoleId: userForm.clientRoleId,
          isSuperAdmin: userForm.isSuperAdmin,
          isActive: userForm.isActive,
        });
        return;
      }
      await createSubscriptionUser({
        subscriptionAccountId: usersAccount!.subscriptionAccountId,
        userName: userForm.userName.trim(),
        password: userForm.password,
        fullName: userForm.fullName.trim(),
        clientRoleId: userForm.clientRoleId,
        isSuperAdmin: userForm.isSuperAdmin,
        isActive: userForm.isActive,
      });
    },
    onSuccess: () => {
      toast.success(editingUser ? 'تم تعديل المستخدم' : 'تم إنشاء المستخدم');
      queryClient.invalidateQueries({ queryKey: ['account-users'] });
      invalidateAccounts();
      setUserFormOpen(false);
      setEditingUser(null);
      setUserForm(emptyUser);
    },
    onError: (e) => toast.error(getErr(e)),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => deleteSubscriptionUser(id),
    onSuccess: () => {
      toast.success('تم حذف المستخدم');
      queryClient.invalidateQueries({ queryKey: ['account-users'] });
      invalidateAccounts();
    },
    onError: (e) => toast.error(getErr(e)),
  });

  const expiryMutation = useMutation({
    mutationFn: runExpiryCheck,
    onSuccess: (count) => { toast.success(`تم تعليم ${count} اشتراك كمنتهٍ`); invalidateAccounts(); },
    onError: (e) => toast.error(getErr(e)),
  });

  const closeAccModal = () => { setAccModalOpen(false); setEditingAcc(null); setAccForm(emptyAccount); };
  const openAddAcc = () => { setEditingAcc(null); setAccForm(emptyAccount); setAccModalOpen(true); };
  const openEditAcc = (a: SubscriptionAccountDto) => {
    setEditingAcc(a);
    setAccForm({
      subscriberName: a.subscriberName, address: a.address, phone: a.phone,
      dbHost: a.dbHost, dbPort: String(a.dbPort || 5432), dbName: a.dbName, dbUsername: a.dbUsername, dbPassword: '',
      programUrl: a.programUrl, enabledModules: a.enabledModules ?? [], isActive: a.isActive,
    });
    setAccModalOpen(true);
  };

  const testConnMutation = useMutation({
    mutationFn: () => testClientConnection(editingAcc!.subscriptionAccountId),
    onSuccess: (msg) => toast.success(msg),
    onError: (e) => toast.error(getErr(e)),
  });

  const regenMutation = useMutation({
    mutationFn: () => regenerateAccessToken(editingAcc!.subscriptionAccountId),
    onSuccess: (newToken) => {
      toast.success('تم توليد رابط جديد — الرابط القديم لم يعد صالحاً');
      setEditingAcc((prev) => (prev ? { ...prev, accessToken: newToken } : prev));
      invalidateAccounts();
    },
    onError: (e) => toast.error(getErr(e)),
  });

  const openSub = (a: SubscriptionAccountDto) => { setSubAccount(a); setSubTypeId(0); setSubModalOpen(true); };

  const openUserAdd = () => { setEditingUser(null); setUserForm(emptyUser); setUserFormOpen(true); };
  const openUserEdit = (u: SubscriptionUserDto) => {
    setEditingUser(u);
    setUserForm({ userName: u.userName, password: '', fullName: u.fullName, clientRoleId: u.clientRoleId, isSuperAdmin: u.isSuperAdmin, isActive: u.isActive });
    setUserFormOpen(true);
  };

  const handleSaveAcc = () => {
    if (!accForm.subscriberName.trim()) { toast.error('اسم المشترك مطلوب'); return; }
    if (!accForm.phone.trim()) { toast.error('رقم الهاتف مطلوب'); return; }
    saveAccMutation.mutate();
  };

  const handleSaveSub = () => {
    if (!subTypeId) { toast.error('نوع الاشتراك مطلوب'); return; }
    subscribeMutation.mutate();
  };

  const handleSaveUser = () => {
    if (!userForm.userName.trim()) { toast.error('اسم المستخدم مطلوب'); return; }
    if (!editingUser && !userForm.password) { toast.error('كلمة المرور مطلوبة'); return; }
    if (!userForm.clientRoleId) { toast.error('يجب اختيار الدور'); return; }
    saveUserMutation.mutate();
  };

  const submitSearch = () => { setSearch(searchInput.trim()); setPage(1); };

  const statusBadge = (a: SubscriptionAccountDto) => {
    if (!a.currentSubscriptionId)
      return <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">بدون اشتراك</span>;
    if (a.isSubscriptionSuspended)
      return <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">موقوف مؤقتاً · {a.remainingDays} يوم</span>;
    if (a.isSubscriptionActive)
      return <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">فعّال · {a.remainingDays} يوم</span>;
    return <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">منتهٍ</span>;
  };

  const accounts = paged?.data ?? [];

  // ── منطق اختيار الوحدات ──
  const allModuleKeys = (modulesCatalog ?? []).flatMap((g) => g.items.map((i) => i.key));
  const enabledSet = new Set(accForm.enabledModules);
  const toggleModule = (key: string) => {
    const next = new Set(enabledSet);
    next.has(key) ? next.delete(key) : next.add(key);
    setAccForm({ ...accForm, enabledModules: [...next] });
  };
  const toggleGroup = (keys: string[]) => {
    const allOn = keys.every((k) => enabledSet.has(k));
    const next = new Set(enabledSet);
    keys.forEach((k) => (allOn ? next.delete(k) : next.add(k)));
    setAccForm({ ...accForm, enabledModules: [...next] });
  };
  const applyPreset = (keys: string[] | 'ALL' | 'NONE') => {
    if (keys === 'ALL') setAccForm({ ...accForm, enabledModules: [...allModuleKeys] });
    else if (keys === 'NONE') setAccForm({ ...accForm, enabledModules: [] });
    else setAccForm({ ...accForm, enabledModules: keys.filter((k) => allModuleKeys.includes(k)) });
  };

  return (
    <div className="p-6" style={{ fontFamily: "'Tajawal', sans-serif" }} dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إدارة الاشتراكات</h1>
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-600">{summary?.total ?? 0} حساب</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />{summary?.active ?? 0} فعّال</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" />{summary?.suspended ?? 0} موقوف مؤقتاً</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" />{summary?.expired ?? 0} منتهٍ</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300" />{summary?.none ?? 0} بدون اشتراك</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={<RefreshCw size={15} />} loading={expiryMutation.isPending} onClick={() => expiryMutation.mutate()}>فحص الانتهاء الآن</Button>
          <Button icon={<Plus size={16} />} onClick={openAddAcc}>حساب جديد</Button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Input icon={<Search size={15} />} placeholder="بحث بالاسم أو الهاتف"
            value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submitSearch(); }} className="flex-1" />
          <Button variant="secondary" onClick={submitSearch}>بحث</Button>
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500">
          <option value="">كل الحالات</option>
          <option value="active">فعّال</option>
          <option value="suspended">موقوف مؤقتاً</option>
          <option value="expired">منتهٍ</option>
          <option value="none">بدون اشتراك</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-right">
              <th className="px-5 py-3 font-semibold">المشترك</th>
              <th className="px-5 py-3 font-semibold">الهاتف</th>
              <th className="px-5 py-3 font-semibold">الاشتراك الحالي</th>
              <th className="px-5 py-3 font-semibold">الانتهاء</th>
              <th className="px-5 py-3 font-semibold">الحالة</th>
              <th className="px-5 py-3 font-semibold text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && <tr><td colSpan={6} className="text-center py-16 text-slate-400">جارٍ التحميل…</td></tr>}
            {!isLoading && !accounts.length && <tr><td colSpan={6} className="text-center py-16 text-slate-400">لا توجد حسابات</td></tr>}
            {accounts.map((a) => (
              <tr key={a.subscriptionAccountId} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3.5 font-semibold text-slate-800">{a.subscriberName}</td>
                <td className="px-5 py-3.5 text-slate-600">{a.phone}</td>
                <td className="px-5 py-3.5 text-slate-600">{a.currentSubscriptionTypeName ?? '—'}</td>
                <td className="px-5 py-3.5 text-slate-600">{formatDate(a.currentEndDate)}</td>
                <td className="px-5 py-3.5">{statusBadge(a)}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => openSub(a)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="اشتراك / تجديد"><CreditCard size={15} /></button>
                    <button onClick={() => setHistAccount(a)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="سجل الاشتراكات"><History size={15} /></button>
                    <button onClick={() => setUsersAccount(a)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="المستخدمون">
                      <span className="relative inline-flex"><Users size={15} />
                        {a.usersCount > 0 && <span className="absolute -top-1.5 -left-1.5 text-[9px] bg-blue-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center">{a.usersCount}</span>}
                      </span>
                    </button>
                    <button onClick={() => copyLink(a.accessToken)} className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors" title="نسخ رابط الدخول"><Link2 size={15} /></button>
                    {a.isSubscriptionSuspended ? (
                      <button onClick={() => resumeMutation.mutate(a.subscriptionAccountId)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="استئناف الاشتراك"><PlayCircle size={15} /></button>
                    ) : (a.currentSubscriptionId && a.isSubscriptionActive) ? (
                      <button onClick={() => { if (confirm('إيقاف الاشتراك مؤقتاً؟ تُجمَّد الأيام المتبقية حتى الاستئناف.')) suspendMutation.mutate(a.subscriptionAccountId); }} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="إيقاف مؤقت"><PauseCircle size={15} /></button>
                    ) : null}
                    <div className="w-px h-5 bg-slate-200 mx-0.5" />
                    <button onClick={() => openEditAcc(a)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="تعديل"><Edit size={15} /></button>
                    <button onClick={() => { if (confirm('أرشفة حساب المشترك؟')) deleteAccMutation.mutate(a.subscriptionAccountId); }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="حذف"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(paged?.totalPages ?? 0) > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 text-sm text-slate-500">
            <span>صفحة {paged?.page} من {paged?.totalPages}</span>
            <div className="flex items-center gap-1">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40"><ChevronRight size={16} /></button>
              <button disabled={page >= (paged?.totalPages ?? 1)} onClick={() => setPage((p) => p + 1)} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40"><ChevronLeft size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Account Modal */}
      <Modal isOpen={accModalOpen} onClose={closeAccModal} title={editingAcc ? 'تعديل حساب المشترك' : 'حساب مشترك جديد'} size="md">
        <div className="space-y-4">
          <Input label="اسم المشترك" value={accForm.subscriberName} required onChange={(e) => setAccForm({ ...accForm, subscriberName: e.target.value })} />
          <Input label="العنوان" value={accForm.address} onChange={(e) => setAccForm({ ...accForm, address: e.target.value })} />
          <Input label="رقم الهاتف" value={accForm.phone} required onChange={(e) => setAccForm({ ...accForm, phone: e.target.value })} />
          <div className="rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Database size={15} className="text-indigo-600" /> بيانات قاعدة بيانات العميل
              </div>
              {editingAcc && (
                <Button size="sm" variant="secondary" icon={<Plug size={13} />} loading={testConnMutation.isPending} onClick={() => testConnMutation.mutate()}>
                  اختبار الاتصال
                </Button>
              )}
            </div>
            <p className="text-xs text-slate-400">مطلوبة قبل إضافة المستخدمين — يُدرَج كل مستخدم في هذه القاعدة ليدخل إلى EDU Pro.</p>
            <div className="flex gap-3">
              <div className="flex-[2]"><Input label="الخادم (Host)" value={accForm.dbHost} onChange={(e) => setAccForm({ ...accForm, dbHost: e.target.value })} placeholder="localhost" /></div>
              <div className="flex-1"><Input label="المنفذ" type="number" value={accForm.dbPort} onChange={(e) => setAccForm({ ...accForm, dbPort: e.target.value })} placeholder="5432" /></div>
            </div>
            <Input label="اسم قاعدة البيانات" value={accForm.dbName} onChange={(e) => setAccForm({ ...accForm, dbName: e.target.value })} placeholder="edu_pro_client1" />
            <div className="flex gap-3">
              <div className="flex-1"><Input label="مستخدم القاعدة" value={accForm.dbUsername} onChange={(e) => setAccForm({ ...accForm, dbUsername: e.target.value })} placeholder="postgres" /></div>
              <div className="flex-1"><Input label={editingAcc ? 'كلمة مرور القاعدة (فارغة = بلا تغيير)' : 'كلمة مرور القاعدة'} type="password" value={accForm.dbPassword} onChange={(e) => setAccForm({ ...accForm, dbPassword: e.target.value })} /></div>
            </div>
            {!editingAcc && <p className="text-xs text-slate-400">احفظ الحساب أولاً ثم استخدم «اختبار الاتصال».</p>}
          </div>

          <Input
            label="رابط برنامج العميل (EDU Pro)"
            value={accForm.programUrl}
            onChange={(e) => setAccForm({ ...accForm, programUrl: e.target.value })}
            placeholder="http://client-server:5173"
          />

          {editingAcc && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Link2 size={15} className="text-indigo-600" /> رابط الدخول الخاص بالحساب
              </div>
              <p className="text-xs text-slate-500">يُسلَّم للعميل للدخول إلى البرنامج. يُحوِّل إلى البرنامج عند الاشتراك الفعّال، ويعرض «عليك الاشتراك» عند الانتهاء.</p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={buildAccessUrl(editingAcc.accessToken)}
                  onFocus={(e) => e.target.select()}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 ltr text-left"
                  style={{ direction: 'ltr' }}
                />
                <Button size="sm" variant="secondary" icon={<Copy size={13} />} onClick={() => copyLink(editingAcc.accessToken)}>نسخ</Button>
                <Button size="sm" variant="secondary" icon={<RefreshCw size={13} />} loading={regenMutation.isPending}
                  onClick={() => { if (confirm('توليد رابط جديد سيُبطل الرابط القديم. متابعة؟')) regenMutation.mutate(); }}>تجديد</Button>
              </div>
            </div>
          )}

          {/* الوحدات المتاحة */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <LayoutGrid size={15} className="text-indigo-600" /> الوحدات المتاحة للحساب
              </div>
              <span className="text-xs font-medium text-slate-500">
                {accForm.enabledModules.length === 0
                  ? 'كل الوحدات (افتراضي)'
                  : `${accForm.enabledModules.length} شاشة مفعّلة`}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              اختر الشاشات التي تظهر للعميل في البرنامج. اتركها فارغة لإتاحة كل الوحدات. «الرئيسية» و«الإعدادات» متاحة دائماً.
            </p>

            <div className="flex flex-wrap gap-1.5">
              {MODULE_PRESETS.map((p) => (
                <button key={p.name} type="button" onClick={() => applyPreset(p.keys)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                  {p.name}
                </button>
              ))}
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pe-1">
              {(modulesCatalog ?? []).map((g) => {
                const groupKeys = g.items.map((i) => i.key);
                const allOn = groupKeys.every((k) => enabledSet.has(k));
                const someOn = !allOn && groupKeys.some((k) => enabledSet.has(k));
                return (
                  <div key={g.group} className="rounded-lg border border-slate-100 bg-slate-50/50">
                    <button type="button" onClick={() => toggleGroup(groupKeys)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100/70 rounded-t-lg transition-colors">
                      <span className="flex items-center gap-2">
                        {allOn ? <CheckSquare size={15} className="text-indigo-600" />
                          : someOn ? <Square size={15} className="text-indigo-400 fill-indigo-100" />
                          : <Square size={15} className="text-slate-300" />}
                        {g.groupLabel}
                      </span>
                      <span className="text-[11px] font-normal text-slate-400">{groupKeys.filter((k) => enabledSet.has(k)).length}/{groupKeys.length}</span>
                    </button>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 px-3 pb-2.5 pt-1">
                      {g.items.map((it) => (
                        <label key={it.key} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer py-0.5">
                          <input type="checkbox" checked={enabledSet.has(it.key)} onChange={() => toggleModule(it.key)}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600" />
                          {it.label}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" checked={accForm.isActive} onChange={(e) => setAccForm({ ...accForm, isActive: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-indigo-600" />
            الحساب فعّال
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={closeAccModal}>إلغاء</Button>
            <Button onClick={handleSaveAcc} loading={saveAccMutation.isPending}>{editingAcc ? 'حفظ التعديلات' : 'إنشاء'}</Button>
          </div>
        </div>
      </Modal>

      {/* Subscribe / Renew Modal */}
      <Modal isOpen={subModalOpen} onClose={() => setSubModalOpen(false)} title={subAccount?.currentSubscriptionId ? 'تجديد الاشتراك' : 'اشتراك جديد'} subtitle={subAccount?.subscriberName} size="sm">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">نوع الاشتراك <span className="text-red-500">*</span></label>
            <select value={subTypeId} onChange={(e) => setSubTypeId(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500">
              <option value={0}>اختر النوع</option>
              {types?.map((t) => (
                <option key={t.subscriptionTypeId} value={t.subscriptionTypeId}>
                  {t.subscriptionTypeName} — {t.durationDays} يوم — {formatNumber(t.price)}{t.isTrial ? ' (تجريبي)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setSubModalOpen(false)}>إلغاء</Button>
            <Button onClick={handleSaveSub} loading={subscribeMutation.isPending}>حفظ</Button>
          </div>
        </div>
      </Modal>

      {/* History Modal */}
      <Modal isOpen={!!histAccount} onClose={() => setHistAccount(null)} title="سجل الاشتراكات" subtitle={histAccount?.subscriberName} size="lg">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-right">
                <th className="px-4 py-2.5 font-semibold">النوع</th>
                <th className="px-4 py-2.5 font-semibold">البداية</th>
                <th className="px-4 py-2.5 font-semibold">الانتهاء</th>
                <th className="px-4 py-2.5 font-semibold">المبلغ</th>
                <th className="px-4 py-2.5 font-semibold">الحالة</th>
                <th className="px-4 py-2.5 font-semibold text-left"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!history?.length && <tr><td colSpan={6} className="text-center py-10 text-slate-400">لا توجد اشتراكات</td></tr>}
              {history?.map((s) => (
                <tr key={s.subscriptionId} className="hover:bg-slate-50/60">
                  <td className="px-4 py-2.5 font-medium text-slate-800">{s.subscriptionTypeName}{s.isTrial ? ' (تجريبي)' : ''}</td>
                  <td className="px-4 py-2.5 text-slate-600">{formatDate(s.startDate)}</td>
                  <td className="px-4 py-2.5 text-slate-600">{formatDate(s.endDate)}</td>
                  <td className="px-4 py-2.5 text-slate-600">{formatNumber(s.amount)}</td>
                  <td className="px-4 py-2.5">
                    {s.isExpired
                      ? <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600">منتهٍ</span>
                      : <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">فعّال · {s.remainingDays} يوم</span>}
                  </td>
                  <td className="px-4 py-2.5 text-left">
                    <button onClick={() => { if (confirm('حذف هذا الاشتراك؟')) deleteSubMutation.mutate(s.subscriptionId); }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="حذف"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* Users Modal */}
      <Modal isOpen={!!usersAccount} onClose={() => { setUsersAccount(null); setUserFormOpen(false); }} title="مستخدمو الحساب" subtitle={usersAccount?.subscriberName} size="lg">
        <div className="space-y-4">
          {!usersAccount?.dbConfigured ? (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>يجب تعريف بيانات قاعدة بيانات العميل لهذا الحساب أولاً (من «تعديل الحساب») قبل إضافة المستخدمين.</span>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button size="sm" icon={<Plus size={14} />} onClick={openUserAdd}>إضافة مستخدم</Button>
            </div>
          )}

          {userFormOpen && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex gap-3">
                <div className="flex-1"><Input label="اسم المستخدم" value={userForm.userName} required onChange={(e) => setUserForm({ ...userForm, userName: e.target.value })} /></div>
                <div className="flex-1"><Input label={editingUser ? 'كلمة المرور (فارغة = بلا تغيير)' : 'كلمة المرور'} type="password" value={userForm.password} required={!editingUser} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} /></div>
              </div>
              <Input label="الاسم الكامل" value={userForm.fullName} onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })} />
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">الدور في نظام المدرسة <span className="text-red-500">*</span></label>
                <select value={userForm.clientRoleId} onChange={(e) => setUserForm({ ...userForm, clientRoleId: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500">
                  <option value={0}>اختر الدور</option>
                  {clientRoles?.map((r) => <option key={r.roleId} value={r.roleId}>{r.roleName}</option>)}
                </select>
                {rolesError && <p className="text-xs text-red-500 mt-1">تعذّر جلب أدوار قاعدة العميل — تحقق من بيانات الاتصال.</p>}
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={userForm.isSuperAdmin} onChange={(e) => setUserForm({ ...userForm, isSuperAdmin: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-indigo-600" />
                  سوبر أدمن
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={userForm.isActive} onChange={(e) => setUserForm({ ...userForm, isActive: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-indigo-600" />
                  فعّال
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="secondary" onClick={() => { setUserFormOpen(false); setEditingUser(null); setUserForm(emptyUser); }}>إلغاء</Button>
                <Button size="sm" onClick={handleSaveUser} loading={saveUserMutation.isPending}>{editingUser ? 'حفظ' : 'إضافة'}</Button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-right">
                  <th className="px-4 py-2.5 font-semibold">اسم المستخدم</th>
                  <th className="px-4 py-2.5 font-semibold">الاسم الكامل</th>
                  <th className="px-4 py-2.5 font-semibold">الدور</th>
                  <th className="px-4 py-2.5 font-semibold">الحالة</th>
                  <th className="px-4 py-2.5 font-semibold text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!users?.length && <tr><td colSpan={5} className="text-center py-10 text-slate-400">لا يوجد مستخدمون</td></tr>}
                {users?.map((u) => (
                  <tr key={u.subscriptionUserId} className="hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 font-medium text-slate-800">{u.userName}</td>
                    <td className="px-4 py-2.5 text-slate-600">{u.fullName || '—'}</td>
                    <td className="px-4 py-2.5">
                      {u.isSuperAdmin
                        ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-600"><ShieldCheck size={11} />سوبر أدمن</span>
                        : <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">مستخدم</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      {u.isActive
                        ? <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">فعّال</span>
                        : <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">معطّل</span>}
                    </td>
                    <td className="px-4 py-2.5 text-left">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openUserEdit(u)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="تعديل"><Edit size={14} /></button>
                        <button onClick={() => { if (confirm('حذف المستخدم؟')) deleteUserMutation.mutate(u.subscriptionUserId); }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="حذف"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
};
