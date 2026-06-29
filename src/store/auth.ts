import { create } from 'zustand';

export interface AdminInfo {
  userName: string;
  fullName: string;
}

interface AuthState {
  token: string | null;
  admin: AdminInfo | null;
  isAuthenticated: boolean;
  login: (token: string, admin: AdminInfo) => void;
  logout: () => void;
}

const TOKEN_KEY = 'subsys_token';
const ADMIN_KEY = 'subsys_admin';

const readAdmin = (): AdminInfo | null => {
  try { return JSON.parse(localStorage.getItem(ADMIN_KEY) || 'null'); }
  catch { return null; }
};

export const useAuth = create<AuthState>((set) => ({
  token: localStorage.getItem(TOKEN_KEY),
  admin: readAdmin(),
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
  login: (token, admin) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
    set({ token, admin, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
    set({ token: null, admin: null, isAuthenticated: false });
  },
}));
