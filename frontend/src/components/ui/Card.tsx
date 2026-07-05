import clsx from 'clsx';
import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  action?: ReactNode;
}

export function Card({ className, title, action, children, ...props }: CardProps) {
  return (
    <section
      className={clsx('rounded-lg border border-slate-200 bg-white p-5 shadow-panel', className)}
      {...props}
    >
      {title || action ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title ? <h2 className="text-base font-semibold text-slate-900">{title}</h2> : <span />}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}
