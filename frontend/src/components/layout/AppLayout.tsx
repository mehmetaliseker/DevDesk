'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { authApi } from '@/lib/api';
import { clearSession, getCurrentUser, getToken, updateStoredUser } from '@/lib/auth';
import type { AuthUser } from '@/types/auth';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace('/login');
      return;
    }

    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }

    authApi
      .me()
      .then((freshUser) => {
        updateStoredUser(freshUser);
        setUser(freshUser);
      })
      .catch(() => {
        clearSession();
        router.replace('/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface px-4">
        <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-panel">
          Loading DevDesk...
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar user={user} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header user={user} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
