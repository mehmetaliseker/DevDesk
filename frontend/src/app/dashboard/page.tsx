'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Inbox, Tags, TicketCheck, Users, type LucideIcon } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { dashboardApi } from '@/lib/api';
import type { Ticket } from '@/types/ticket';
import { TicketTable } from '@/features/tickets/TicketTable';

type DashboardData =
  | {
      role: 'ADMIN';
      totalUsers: number;
      totalTickets: number;
      openTickets: number;
      categories: number;
    }
  | {
      role: 'SUPPORT_AGENT';
      assignedTickets: number;
      openTickets: number;
      priorityTickets: Ticket[];
    }
  | {
      role: 'CUSTOMER';
      openTickets: number;
      resolvedTickets: number;
      recentTickets: Ticket[];
    };

function StatCard({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-md bg-indigo-50 text-indigo-700">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardApi
      .get()
      .then((response) => setData(response as DashboardData))
      .catch(() => setError('Dashboard data could not be loaded.'));
  }, []);

  return (
    <AppLayout>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Role-based operational summary.</p>
        </div>
        <Link href="/tickets">
          <Button variant="secondary">
            View tickets
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {error ? <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      {!data ? (
        <Card>Loading dashboard...</Card>
      ) : (
        <DashboardContent data={data} />
      )}
    </AppLayout>
  );
}

function DashboardContent({ data }: { data: DashboardData }) {
  if (data.role === 'ADMIN') {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={data.totalUsers} icon={Users} />
        <StatCard label="Total tickets" value={data.totalTickets} icon={TicketCheck} />
        <StatCard label="Open tickets" value={data.openTickets} icon={Inbox} />
        <StatCard label="Categories" value={data.categories} icon={Tags} />
      </div>
    );
  }

  if (data.role === 'SUPPORT_AGENT') {
    return (
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <StatCard label="Assigned to me" value={data.assignedTickets} icon={TicketCheck} />
          <StatCard label="Open queue" value={data.openTickets} icon={Inbox} />
        </div>
        <Card title="Priority tickets">
          <TicketTable tickets={data.priorityTickets} emptyText="No high priority assigned tickets." />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard label="Open tickets" value={data.openTickets} icon={Inbox} />
        <StatCard label="Resolved tickets" value={data.resolvedTickets} icon={CheckCircle2} />
      </div>
      <Card title="Recent tickets">
        <TicketTable tickets={data.recentTickets} emptyText="No tickets created yet." />
      </Card>
    </div>
  );
}
