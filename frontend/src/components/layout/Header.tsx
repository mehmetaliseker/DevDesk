'use client';

import { LogOut, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ROLE_LABELS } from '@/lib/constants';
import { clearSession } from '@/lib/auth';
import type { AuthUser } from '@/types/auth';

interface HeaderProps {
  user: AuthUser;
  onMenuClick: () => void;
}

export function Header({ user, onMenuClick }: HeaderProps) {
  const router = useRouter();

  function handleLogout() {
    clearSession();
    router.replace('/login');
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="lg:hidden" onClick={onMenuClick} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <p className="text-sm font-semibold text-slate-950">{user.name}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge tone="blue">{ROLE_LABELS[user.role]}</Badge>
        <Button variant="secondary" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}
