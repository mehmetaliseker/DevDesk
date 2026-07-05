'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Check, Pencil, Plus, X } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Table, TBody, Td, Th, THead } from '@/components/ui/Table';
import { ApiError, categoriesApi } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import type { Category } from '@/types/category';

export default function AdminCategoriesPage() {
  const user = getCurrentUser();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState('');
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadCategories() {
    setLoading(true);
    setError('');

    try {
      setCategories(await categoriesApi.adminList());
    } catch {
      setError('Categories could not be loaded.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      void loadCategories();
    } else {
      setLoading(false);
    }
  }, [user?.role]);

  async function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      await categoriesApi.create({ name });
      setName('');
      await loadCategories();
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Category could not be created.');
    } finally {
      setSaving(false);
    }
  }

  async function saveCategory(categoryId: string) {
    if (!editingName.trim()) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      await categoriesApi.update(categoryId, { name: editingName });
      setEditingId('');
      setEditingName('');
      await loadCategories();
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Category could not be updated.');
    } finally {
      setSaving(false);
    }
  }

  async function deactivateCategory(categoryId: string) {
    setSaving(true);
    setError('');

    try {
      await categoriesApi.deactivate(categoryId);
      await loadCategories();
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Category could not be deactivated.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-950">Categories</h1>
        <p className="mt-1 text-sm text-slate-500">Manage ticket category availability.</p>
      </div>

      {user && user.role !== 'ADMIN' ? (
        <Card>Only admins can manage categories.</Card>
      ) : (
        <div className="space-y-5">
          <Card>
            <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={createCategory}>
              <Input
                label="New category"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                minLength={2}
                maxLength={80}
              />
              <Button type="submit" disabled={saving || !name.trim()}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </form>
          </Card>

          {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          {loading ? (
            <Card>Loading categories...</Card>
          ) : (
            <Card>
              <Table>
                <THead>
                  <tr>
                    <Th>Name</Th>
                    <Th>Status</Th>
                    <Th>Created</Th>
                    <Th className="text-right">Actions</Th>
                  </tr>
                </THead>
                <TBody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <Td>
                        {editingId === category.id ? (
                          <Input
                            value={editingName}
                            onChange={(event) => setEditingName(event.target.value)}
                            minLength={2}
                            maxLength={80}
                          />
                        ) : (
                          <span className="font-medium text-slate-900">{category.name}</span>
                        )}
                      </Td>
                      <Td>
                        <Badge tone={category.isActive ? 'green' : 'gray'}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </Td>
                      <Td>{new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' }).format(new Date(category.createdAt))}</Td>
                      <Td>
                        <div className="flex justify-end gap-2">
                          {editingId === category.id ? (
                            <>
                              <Button size="sm" onClick={() => void saveCategory(category.id)} disabled={saving}>
                                <Check className="h-4 w-4" />
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  setEditingId('');
                                  setEditingName('');
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  setEditingId(category.id);
                                  setEditingName(category.name);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                                Edit
                              </Button>
                              {category.isActive ? (
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => void deactivateCategory(category.id)}
                                  disabled={saving}
                                >
                                  Deactivate
                                </Button>
                              ) : null}
                            </>
                          )}
                        </div>
                      </Td>
                    </tr>
                  ))}
                </TBody>
              </Table>
            </Card>
          )}
        </div>
      )}
    </AppLayout>
  );
}
