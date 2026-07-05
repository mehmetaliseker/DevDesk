'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <label className="block">
        {label ? <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span> : null}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-100',
            className
          )}
          {...props}
        />
        {error ? <span className="mt-1 block text-sm text-red-600">{error}</span> : null}
      </label>
    );
  }
);

Input.displayName = 'Input';
