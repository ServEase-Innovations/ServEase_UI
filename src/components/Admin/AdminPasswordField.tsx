import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

type AdminPasswordFieldProps = {
  id: string;
  name?: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  placeholder?: string;
  minLength?: number;
  required?: boolean;
  footer?: React.ReactNode;
};

export function AdminPasswordField({
  id,
  name,
  label,
  value,
  onChange,
  autoComplete,
  placeholder = "••••••••",
  minLength,
  required = true,
  footer,
}: AdminPasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <div className="relative">
        <Lock
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          aria-hidden
        />
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
          className="w-full rounded-xl border border-slate-600/60 bg-slate-900/60 py-3 pl-11 pr-11 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" strokeWidth={2} aria-hidden />
          ) : (
            <Eye className="h-4 w-4" strokeWidth={2} aria-hidden />
          )}
        </button>
      </div>
      {footer}
    </div>
  );
}
