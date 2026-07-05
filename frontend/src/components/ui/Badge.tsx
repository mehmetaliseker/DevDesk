import clsx from 'clsx';
import { HTMLAttributes } from 'react';

type BadgeTone = 'gray' | 'blue' | 'yellow' | 'purple' | 'green' | 'orange' | 'red';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  gray: 'bg-slate-100 text-slate-700 ring-slate-200',
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  yellow: 'bg-yellow-50 text-yellow-800 ring-yellow-200',
  purple: 'bg-purple-50 text-purple-700 ring-purple-200',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  orange: 'bg-orange-50 text-orange-700 ring-orange-200',
  red: 'bg-red-50 text-red-700 ring-red-200'
};

export function Badge({ className, tone = 'gray', ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
