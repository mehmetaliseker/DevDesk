import Link from 'next/link';
import { Table, TBody, Td, Th, THead } from '@/components/ui/Table';
import { PriorityBadge, StatusBadge } from './TicketBadges';
import type { Ticket } from '@/types/ticket';

interface TicketTableProps {
  tickets: Ticket[];
  emptyText?: string;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

export function TicketTable({ tickets, emptyText = 'No tickets found.' }: TicketTableProps) {
  if (tickets.length === 0) {
    return <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">{emptyText}</p>;
  }

  return (
    <Table>
      <THead>
        <tr>
          <Th>Title</Th>
          <Th>Status</Th>
          <Th>Priority</Th>
          <Th>Category</Th>
          <Th>Assigned</Th>
          <Th>Created</Th>
        </tr>
      </THead>
      <TBody>
        {tickets.map((ticket) => (
          <tr key={ticket.id} className="hover:bg-slate-50">
            <Td>
              <Link href={`/tickets/${ticket.id}`} className="font-medium text-indigo-700 hover:text-indigo-900">
                {ticket.title}
              </Link>
            </Td>
            <Td>
              <StatusBadge status={ticket.status} />
            </Td>
            <Td>
              <PriorityBadge priority={ticket.priority} />
            </Td>
            <Td>{ticket.category?.name ?? '-'}</Td>
            <Td>{ticket.assignedAgent?.name ?? 'Unassigned'}</Td>
            <Td>{formatDate(ticket.createdAt)}</Td>
          </tr>
        ))}
      </TBody>
    </Table>
  );
}
