import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md';
  loading?: boolean;
  icon?: React.ReactNode;
}

const sizes: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
};

const variants: Record<string, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 border-transparent shadow-sm',
  secondary: 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
  danger: 'bg-red-500 text-white hover:bg-red-600 border-transparent',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary', size = 'md', loading = false, icon, children, className = '', disabled, ...props
}) => (
  <button
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center font-semibold border rounded-xl transition-all duration-150 active:scale-95 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${variants[variant]} ${className}`}
    {...props}
  >
    {loading ? (
      <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    ) : icon ? (
      <span className="shrink-0">{icon}</span>
    ) : null}
    {children}
  </button>
);
