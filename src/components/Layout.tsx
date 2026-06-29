import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { CreditCard, Tags, LogOut, GraduationCap, Monitor } from 'lucide-react';
import { useAuth } from '../store/auth';

const navItems = [
  { to: '/', label: 'إدارة الاشتراكات', icon: <CreditCard size={18} />, end: true },
  { to: '/designer', label: 'تصميم واجهة العميل', icon: <Monitor size={18} />, end: false },
  { to: '/types', label: 'أنواع الاشتراكات', icon: <Tags size={18} />, end: false },
];

export const Layout: React.FC = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen" dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }}>
      <aside className="w-64 bg-white border-l border-slate-200 flex flex-col shrink-0">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
            <GraduationCap size={18} />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-slate-800 leading-tight">نظام الاشتراكات</h1>
            <p className="text-[10px] text-slate-400 leading-tight">EDU Pro Licensing</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {navItems.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 text-[14px] rounded-lg transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              {it.icon}
              <span>{it.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-slate-100">
          <div className="flex items-center gap-2.5 mb-2 px-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
              {admin?.userName?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[12.5px] font-semibold text-slate-700 truncate leading-tight">{admin?.fullName || admin?.userName}</p>
              <p className="text-[10.5px] text-slate-400 truncate leading-tight">مدير النظام</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={13} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-50">
        <Outlet />
      </main>
    </div>
  );
};
