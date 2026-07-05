import type { AuthUser, Role } from './auth';
import type { Category } from './category';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TicketUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  message: string;
  createdAt: string;
  sender: TicketUser;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  customerId: string;
  assignedAgentId: string | null;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  customer?: TicketUser | AuthUser;
  assignedAgent?: TicketUser | AuthUser | null;
  category?: Category;
  messages?: TicketMessage[];
}

export interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  categoryId?: string;
  search?: string;
}
