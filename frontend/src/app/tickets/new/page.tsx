'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { ApiError, categoriesApi, ticketsApi } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import { PRIORITY_LABELS, PRIORITY_OPTIONS } from '@/lib/constants';
import type { Category } from '@/types/category';
import type { TicketPriority } from '@/types/ticket';

export default function NewTicketPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const user = getCurrentUser();

  useEffect(() => {
    categoriesApi
      .list()
      .then((data) => {
        setCategories(data);
        setCategoryId(data[0]?.id ?? '');
      })
      .catch(() => setError('Categories could not be loaded.'));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const ticket = await ticketsApi.create({ title, description, categoryId, priority });
      router.replace(`/tickets/${ticket.id}`);
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Ticket could not be created.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-950">New ticket</h1>
        <p className="mt-1 text-sm text-slate-500">Create a support request for your team.</p>
      </div>

      {user && user.role !== 'CUSTOMER' ? (
        <Card>Only customers can create new tickets.</Card>
      ) : (
        <Card className="max-w-3xl">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              minLength={3}
              maxLength={160}
            />
            <Textarea
              label="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              minLength={10}
              maxLength={5000}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Category"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                required
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
              <Select
                label="Priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value as TicketPriority)}
              >
                {PRIORITY_OPTIONS.map((priorityOption) => (
                  <option key={priorityOption} value={priorityOption}>
                    {PRIORITY_LABELS[priorityOption]}
                  </option>
                ))}
              </Select>
            </div>
            {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
            <div className="flex justify-end">
              <Button type="submit" disabled={loading || !categoryId}>
                {loading ? 'Creating...' : 'Create ticket'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </AppLayout>
  );
}
