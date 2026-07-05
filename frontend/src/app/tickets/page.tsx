'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { categoriesApi, ticketsApi } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import { PRIORITY_LABELS, PRIORITY_OPTIONS, STATUS_LABELS, STATUS_OPTIONS } from '@/lib/constants';
import { TicketTable } from '@/features/tickets/TicketTable';
import type { Category } from '@/types/category';
import type { Ticket, TicketFilters, TicketPriority, TicketStatus } from '@/types/ticket';

interface FilterState {
  status: TicketStatus | '';
  priority: TicketPriority | '';
  categoryId: string;
  search: string;
}

const defaultFilters: FilterState = {
  status: '',
  priority: '',
  categoryId: '',
  search: ''
};

function normalizeFilters(filters: FilterState): TicketFilters {
  return {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.priority ? { priority: filters.priority } : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.search.trim() ? { search: filters.search.trim() } : {})
  };
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = getCurrentUser();

  async function loadTickets(nextFilters = filters) {
    setLoading(true);
    setError('');

    try {
      const data = await ticketsApi.list(normalizeFilters(nextFilters));
      setTickets(data);
    } catch {
      setError('Tickets could not be loaded.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    categoriesApi
      .list()
      .then(setCategories)
      .catch(() => setCategories([]));
    void loadTickets(defaultFilters);
  }, []);

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadTickets(filters);
  }

  function handleReset() {
    setFilters(defaultFilters);
    void loadTickets(defaultFilters);
  }

  return (
    <AppLayout>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Tickets</h1>
          <p className="mt-1 text-sm text-slate-500">Track requests, assignments and priorities.</p>
        </div>
        {user?.role === 'CUSTOMER' ? (
          <Link href="/tickets/new">
            <Button>
              <Plus className="h-4 w-4" />
              New ticket
            </Button>
          </Link>
        ) : null}
      </div>

      <Card className="mb-5">
        <form className="grid gap-3 md:grid-cols-5" onSubmit={handleFilterSubmit}>
          <Input
            label="Search"
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="Ticket title"
          />
          <Select
            label="Status"
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                status: event.target.value as FilterState['status']
              }))
            }
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
          <Select
            label="Priority"
            value={filters.priority}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                priority: event.target.value as FilterState['priority']
              }))
            }
          >
            <option value="">All priorities</option>
            {PRIORITY_OPTIONS.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </Select>
          <Select
            label="Category"
            value={filters.categoryId}
            onChange={(event) => setFilters((current) => ({ ...current, categoryId: event.target.value }))}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <div className="flex items-end gap-2">
            <Button type="submit" className="flex-1">
              <Search className="h-4 w-4" />
              Filter
            </Button>
            <Button type="button" variant="secondary" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </form>
      </Card>

      {error ? <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {loading ? <Card>Loading tickets...</Card> : <TicketTable tickets={tickets} />}
    </AppLayout>
  );
}
