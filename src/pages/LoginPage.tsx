import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { GraduationCap } from 'lucide-react';
import { adminLogin } from '../api/subscriptionsApi';
import { useAuth } from '../store/auth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () => adminLogin(userName.trim(), password),
    onSuccess: (r) => {
      login(r.token, { userName: r.userName, fullName: r.fullName });
      navigate('/');
    },
    onError: () => toast.error('اسم المستخدم أو كلمة المرور غير صحيحة'),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !password) { toast.error('أدخل اسم المستخدم وكلمة المرور'); return; }
    mutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4" dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }}>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg mb-3">
            <GraduationCap size={26} />
          </div>
          <h1 className="text-xl font-bold text-slate-800">نظام إدارة الاشتراكات</h1>
          <p className="text-sm text-slate-400 mt-1">لوحة تحكم المورّد</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Input label="اسم المستخدم" value={userName} onChange={(e) => setUserName(e.target.value)} required placeholder="admin" />
          <Input label="كلمة المرور" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
          <Button type="submit" loading={mutation.isPending} className="w-full">تسجيل الدخول</Button>
        </form>
      </div>
    </div>
  );
};
