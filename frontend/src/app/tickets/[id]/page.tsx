'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Send, UserPlus } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { ApiError, ticketsApi, usersApi } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import {
  PRIORITY_LABELS,
  PRIORITY_OPTIONS,
  ROLE_LABELS,
  STATUS_LABELS,
  STATUS_OPTIONS
} from '@/lib/constants';
import { PriorityBadge, StatusBadge } from '@/features/tickets/TicketBadges';
import type { AuthUser } from '@/types/auth';
import type { Ticket, TicketPriority, TicketStatus } from '@/types/ticket';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const ticketId = params.id;
  const user = getCurrentUser();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [agents, setAgents] = useState<AuthUser[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadTicket() {
    setLoading(true);
    setError('');

    try {
      const data = await ticketsApi.detail(ticketId);
      setTicket(data);
      setSelectedAgentId(data.assignedAgentId ?? '');
    } catch {
      setError('Ticket could not be loaded.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTicket();
  }, [ticketId]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      usersApi
        .supportAgents()
        .then(setAgents)
        .catch(() => setAgents([]));
    }
  }, [user?.role]);

  async function updateStatus(status: TicketStatus) {
    if (!ticket) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      setTicket(await ticketsApi.updateStatus(ticket.id, status));
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Status could not be updated.');
    } finally {
      setSaving(false);
    }
  }

  async function updatePriority(priority: TicketPriority) {
    if (!ticket) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      setTicket(await ticketsApi.updatePriority(ticket.id, priority));
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Priority could not be updated.');
    } finally {
      setSaving(false);
    }
  }

  async function assignTicket() {
    if (!ticket) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      const nextTicket = await ticketsApi.assign(
        ticket.id,
        user?.role === 'ADMIN' ? selectedAgentId : undefined
      );
      setTicket(nextTicket);
      setSelectedAgentId(nextTicket.assignedAgentId ?? '');
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Ticket could not be assigned.');
    } finally {
      setSaving(false);
    }
  }

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!ticket || !message.trim()) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      const newMessage = await ticketsApi.createMessage(ticket.id, message);
      setTicket({
        ...ticket,
        messages: [...(ticket.messages ?? []), newMessage]
      });
      setMessage('');
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Message could not be sent.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout>
      {loading ? (
        <Card>Loading ticket...</Card>
      ) : error && !ticket ? (
        <Card>{error}</Card>
      ) : ticket ? (
        <div className="space-y-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
                {ticket.category ? <Badge tone="gray">{ticket.category.name}</Badge> : null}
              </div>
              <h1 className="text-2xl font-semibold text-slate-950">{ticket.title}</h1>
              <p className="mt-1 text-sm text-slate-500">
                Created by {ticket.customer?.name ?? 'Customer'} on {formatDate(ticket.createdAt)}
              </p>
            </div>
            {user?.role !== 'CUSTOMER' ? (
              <Card className="w-full lg:w-[380px]">
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <Select
                      label="Status"
                      value={ticket.status}
                      onChange={(event) => void updateStatus(event.target.value as TicketStatus)}
                      disabled={saving}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </Select>
                    <Select
                      label="Priority"
                      value={ticket.priority}
                      onChange={(event) => void updatePriority(event.target.value as TicketPriority)}
                      disabled={saving}
                    >
                      {PRIORITY_OPTIONS.map((priority) => (
                        <option key={priority} value={priority}>
                          {PRIORITY_LABELS[priority]}
                        </option>
                      ))}
                    </Select>
                  </div>
                  {user?.role === 'ADMIN' ? (
                    <div className="flex gap-2">
                      <Select
                        label="Agent"
                        value={selectedAgentId}
                        onChange={(event) => setSelectedAgentId(event.target.value)}
                        disabled={saving}
                      >
                        <option value="">Select agent</option>
                        {agents.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name}
                          </option>
                        ))}
                      </Select>
                      <Button className="mt-6" onClick={assignTicket} disabled={saving || !selectedAgentId}>
                        <UserPlus className="h-4 w-4" />
                        Assign
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={assignTicket} disabled={saving}>
                      <UserPlus className="h-4 w-4" />
                      Assign to me
                    </Button>
                  )}
                </div>
              </Card>
            ) : null}
          </div>

          {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <Card title="Description">
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{ticket.description}</p>
            <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600 sm:grid-cols-2">
              <p>
                <span className="font-medium text-slate-900">Assigned:</span>{' '}
                {ticket.assignedAgent?.name ?? 'Unassigned'}
              </p>
              <p>
                <span className="font-medium text-slate-900">Updated:</span> {formatDate(ticket.updatedAt)}
              </p>
            </div>
          </Card>

          <Card title="Messages">
            <div className="space-y-3">
              {(ticket.messages ?? []).length === 0 ? (
                <p className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                  No messages yet.
                </p>
              ) : (
                ticket.messages?.map((ticketMessage) => (
                  <div key={ticketMessage.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-slate-950">{ticketMessage.sender.name}</p>
                      <Badge tone="gray">{ROLE_LABELS[ticketMessage.sender.role]}</Badge>
                      <span className="text-xs text-slate-500">{formatDate(ticketMessage.createdAt)}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{ticketMessage.message}</p>
                  </div>
                ))
              )}
            </div>

            <form className="mt-5 space-y-3" onSubmit={submitMessage}>
              <Textarea
                label="Reply"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                disabled={ticket.status === 'CLOSED' || saving}
                placeholder={ticket.status === 'CLOSED' ? 'Closed tickets cannot receive replies.' : 'Write a reply'}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={ticket.status === 'CLOSED' || saving || !message.trim()}>
                  <Send className="h-4 w-4" />
                  Send
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}
    </AppLayout>
  );
}
