import type { Role } from '@/types/auth';
import type { TicketPriority, TicketStatus } from '@/types/ticket';

export const ROLE_LABELS: Record<Role, string> = {
  CUSTOMER: 'Customer',
  SUPPORT_AGENT: 'Support Agent',
  ADMIN: 'Admin'
};

export const STATUS_OPTIONS: TicketStatus[] = [
  'OPEN',
  'IN_PROGRESS',
  'PENDING_CUSTOMER',
  'RESOLVED',
  'CLOSED'
];

export const PRIORITY_OPTIONS: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  PENDING_CUSTOMER: 'Pending customer',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed'
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent'
};

export const statusTone: Record<TicketStatus, 'blue' | 'yellow' | 'purple' | 'green' | 'gray'> = {
  OPEN: 'blue',
  IN_PROGRESS: 'yellow',
  PENDING_CUSTOMER: 'purple',
  RESOLVED: 'green',
  CLOSED: 'gray'
};

export const priorityTone: Record<TicketPriority, 'gray' | 'blue' | 'orange' | 'red'> = {
  LOW: 'gray',
  MEDIUM: 'blue',
  HIGH: 'orange',
  URGENT: 'red'
};
