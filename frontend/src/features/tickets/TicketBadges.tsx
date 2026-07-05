import { Badge } from '@/components/ui/Badge';
import { PRIORITY_LABELS, STATUS_LABELS, priorityTone, statusTone } from '@/lib/constants';
import type { TicketPriority, TicketStatus } from '@/types/ticket';

export function StatusBadge({ status }: { status: TicketStatus }) {
  return <Badge tone={statusTone[status]}>{STATUS_LABELS[status]}</Badge>;
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return <Badge tone={priorityTone[priority]}>{PRIORITY_LABELS[priority]}</Badge>;
}
