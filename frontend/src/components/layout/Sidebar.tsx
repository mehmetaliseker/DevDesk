'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderKanban, LayoutDashboard, LifeBuoy, PlusCircle, Tags, X } from 'lucide-react';
import clsx from 'clsx';
import type { AuthUser } from '@/types/auth';
import { Button } from '@/components/ui/Button';

interface SidebarProps {
  user: AuthUser;
  open: boolean;
  onClose: () => void;
}

const baseLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tickets', label: 'Tickets', icon: LifeBuoy }
];

export function Sidebar({ user, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const roleLinks =
    user.role === 'CUSTOMER'
      ? [{ href: '/tickets/new', label: 'New ticket', icon: PlusCircle }]
      : user.role === 'ADMIN'
        ? [{ href: '/admin/categories', label: 'Categories', icon: Tags }]
        : [];
  const links = [...baseLinks, ...roleLinks];

  return (
    <>
      <div
        className={clsx(
          'fixed inset-0 z-30 bg-slate-900/30 transition lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex w-72 transform flex-col border-r border-slate-200 bg-white transition lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-indigo-600 text-sm font-bold text-white">
              DD
            </span>
            <span className="text-lg font-semibold text-slate-950">DevDesk</span>
          </Link>
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={onClose} aria-label="Close menu">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={clsx(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition',
                  active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3 rounded-md bg-slate-50 p-3">
            <FolderKanban className="h-5 w-5 text-indigo-600" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
