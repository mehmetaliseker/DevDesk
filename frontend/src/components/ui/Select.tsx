'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <label className="block">
        {label ? <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span> : null}
        <select
          ref={ref}
          id={inputId}
          className={clsx(
            'h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-100',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error ? <span className="mt-1 block text-sm text-red-600">{error}</span> : null}
      </label>
    );
  }
);

Select.displayName = 'Select';
