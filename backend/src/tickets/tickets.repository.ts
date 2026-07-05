import { Injectable } from '@nestjs/common';
import { Role } from '../common/enums/role.enum';
import { TicketPriority } from '../common/enums/ticket-priority.enum';
import { TicketStatus } from '../common/enums/ticket-status.enum';
import { DatabaseService } from '../database/database.service';
import type { TicketQueryDto } from './dto/ticket-query.dto';

interface TicketRow {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  customer_id: string;
  assigned_agent_id: string | null;
  category_id: string;
  created_at: Date;
  updated_at: Date;
  category_id_ref: string;
  category_name: string;
  category_is_active: boolean;
  category_created_at: Date;
  category_updated_at: Date;
  customer_id_ref: string;
  customer_name: string;
  customer_email: string;
  customer_role: Role;
  agent_id_ref: string | null;
  agent_name: string | null;
  agent_email: string | null;
  agent_role: Role | null;
}

interface TicketMessageRow {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  created_at: Date;
  sender_id_ref: string;
  sender_name: string;
  sender_email: string;
  sender_role: Role;
}

export interface TicketUserResponse {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface TicketCategoryResponse {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketMessageResponse {
  id: string;
  ticketId: string;
  senderId: string;
  message: string;
  createdAt: Date;
  sender: TicketUserResponse;
}

export interface TicketResponse {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  customerId: string;
  assignedAgentId: string | null;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  category: TicketCategoryResponse;
  customer: TicketUserResponse;
  assignedAgent: TicketUserResponse | null;
  messages?: TicketMessageResponse[];
}

export interface TicketAccessRecord {
  id: string;
  customerId: string;
  assignedAgentId: string | null;
  status: TicketStatus;
}

const ticketSelect = `
  t.id,
  t.title,
  t.description,
  t.status,
  t.priority,
  t.customer_id,
  t.assigned_agent_id,
  t.category_id,
  t.created_at,
  t.updated_at,
  c.id AS category_id_ref,
  c.name AS category_name,
  c.is_active AS category_is_active,
  c.created_at AS category_created_at,
  c.updated_at AS category_updated_at,
  customer.id AS customer_id_ref,
  customer.name AS customer_name,
  customer.email AS customer_email,
  customer.role AS customer_role,
  agent.id AS agent_id_ref,
  agent.name AS agent_name,
  agent.email AS agent_email,
  agent.role AS agent_role
`;

const ticketJoin = `
  FROM tickets t
  INNER JOIN categories c ON c.id = t.category_id
  INNER JOIN users customer ON customer.id = t.customer_id
  LEFT JOIN users agent ON agent.id = t.assigned_agent_id
`;

export function mapTicketRow(row: TicketRow): TicketResponse {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    customerId: row.customer_id,
    assignedAgentId: row.assigned_agent_id,
    categoryId: row.category_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    category: {
      id: row.category_id_ref,
      name: row.category_name,
      isActive: row.category_is_active,
      createdAt: row.category_created_at,
      updatedAt: row.category_updated_at
    },
    customer: {
      id: row.customer_id_ref,
      name: row.customer_name,
      email: row.customer_email,
      role: row.customer_role
    },
    assignedAgent: row.agent_id_ref
      ? {
          id: row.agent_id_ref,
          name: row.agent_name ?? '',
          email: row.agent_email ?? '',
          role: row.agent_role ?? Role.SUPPORT_AGENT
        }
      : null
  };
}

export function mapTicketMessageRow(row: TicketMessageRow): TicketMessageResponse {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    senderId: row.sender_id,
    message: row.message,
    createdAt: row.created_at,
    sender: {
      id: row.sender_id_ref,
      name: row.sender_name,
      email: row.sender_email,
      role: row.sender_role
    }
  };
}

@Injectable()
export class TicketsRepository {
  constructor(private readonly database: DatabaseService) {}

  async createTicket(data: {
    title: string;
    description: string;
    priority: TicketPriority;
    customerId: string;
    categoryId: string;
  }): Promise<TicketResponse> {
    const result = await this.database.query<{ id: string }>(
      `
        INSERT INTO tickets (title, description, priority, customer_id, category_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `,
      [data.title, data.description, data.priority, data.customerId, data.categoryId]
    );

    const ticket = await this.findByIdWithRelations(result.rows[0].id);

    if (!ticket) {
      throw new Error('Created ticket could not be loaded.');
    }

    return ticket;
  }

  async findTicketsForCustomer(
    customerId: string,
    query: TicketQueryDto
  ): Promise<TicketResponse[]> {
    const params: unknown[] = [customerId];
    const conditions = ['t.customer_id = $1'];
    this.appendFilters(conditions, params, query);

    return this.findTicketsByConditions(conditions, params);
  }

  async findTicketsForSupportAgent(
    agentId: string,
    query: TicketQueryDto
  ): Promise<TicketResponse[]> {
    const params: unknown[] = [TicketStatus.OPEN, agentId];
    const conditions = ['(t.status = $1 OR t.assigned_agent_id = $2)'];
    this.appendFilters(conditions, params, query);

    return this.findTicketsByConditions(conditions, params);
  }

  async findAllTicketsForAdmin(query: TicketQueryDto): Promise<TicketResponse[]> {
    const params: unknown[] = [];
    const conditions: string[] = [];
    this.appendFilters(conditions, params, query);

    return this.findTicketsByConditions(conditions, params);
  }

  async findByIdWithRelations(id: string): Promise<TicketResponse | null> {
    const result = await this.database.query<TicketRow>(
      `
        SELECT ${ticketSelect}
        ${ticketJoin}
        WHERE t.id = $1
      `,
      [id]
    );

    if (!result.rows[0]) {
      return null;
    }

    const messages = await this.findMessagesByTicketId(id);

    return {
      ...mapTicketRow(result.rows[0]),
      messages
    };
  }

  async findAccessById(id: string): Promise<TicketAccessRecord | null> {
    const result = await this.database.query<{
      id: string;
      customer_id: string;
      assigned_agent_id: string | null;
      status: TicketStatus;
    }>(
      `
        SELECT id, customer_id, assigned_agent_id, status
        FROM tickets
        WHERE id = $1
      `,
      [id]
    );

    const row = result.rows[0];

    return row
      ? {
          id: row.id,
          customerId: row.customer_id,
          assignedAgentId: row.assigned_agent_id,
          status: row.status
        }
      : null;
  }

  async updateStatus(id: string, status: TicketStatus): Promise<TicketResponse> {
    await this.database.query(
      `
        UPDATE tickets
        SET status = $1, updated_at = NOW()
        WHERE id = $2
      `,
      [status, id]
    );

    return this.requireTicket(id);
  }

  async updatePriority(id: string, priority: TicketPriority): Promise<TicketResponse> {
    await this.database.query(
      `
        UPDATE tickets
        SET priority = $1, updated_at = NOW()
        WHERE id = $2
      `,
      [priority, id]
    );

    return this.requireTicket(id);
  }

  async assignTicket(
    id: string,
    assignedAgentId: string,
    status: TicketStatus
  ): Promise<TicketResponse> {
    await this.database.query(
      `
        UPDATE tickets
        SET assigned_agent_id = $1, status = $2, updated_at = NOW()
        WHERE id = $3
      `,
      [assignedAgentId, status, id]
    );

    return this.requireTicket(id);
  }

  async countTickets(): Promise<number> {
    const result = await this.database.query<{ count: string }>('SELECT COUNT(*) AS count FROM tickets');
    return Number(result.rows[0]?.count ?? 0);
  }

  async countByStatus(status: TicketStatus): Promise<number> {
    const result = await this.database.query<{ count: string }>(
      'SELECT COUNT(*) AS count FROM tickets WHERE status = $1',
      [status]
    );

    return Number(result.rows[0]?.count ?? 0);
  }

  async countForCustomer(customerId: string, statuses?: TicketStatus[]): Promise<number> {
    const params: unknown[] = [customerId];
    const conditions = ['customer_id = $1'];

    if (statuses?.length) {
      params.push(statuses);
      conditions.push(`status = ANY($${params.length})`);
    }

    const result = await this.database.query<{ count: string }>(
      `
        SELECT COUNT(*) AS count
        FROM tickets
        WHERE ${conditions.join(' AND ')}
      `,
      params
    );

    return Number(result.rows[0]?.count ?? 0);
  }

  async countForAgent(agentId: string): Promise<number> {
    const result = await this.database.query<{ count: string }>(
      'SELECT COUNT(*) AS count FROM tickets WHERE assigned_agent_id = $1',
      [agentId]
    );

    return Number(result.rows[0]?.count ?? 0);
  }

  async findPriorityTicketsForAgent(agentId: string): Promise<TicketResponse[]> {
    const result = await this.database.query<TicketRow>(
      `
        SELECT ${ticketSelect}
        ${ticketJoin}
        WHERE t.assigned_agent_id = $1
          AND t.status <> ALL($2)
          AND t.priority = ANY($3)
        ORDER BY
          CASE t.priority
            WHEN 'URGENT' THEN 1
            WHEN 'HIGH' THEN 2
            WHEN 'MEDIUM' THEN 3
            ELSE 4
          END,
          t.created_at DESC
        LIMIT 5
      `,
      [
        agentId,
        [TicketStatus.RESOLVED, TicketStatus.CLOSED],
        [TicketPriority.HIGH, TicketPriority.URGENT]
      ]
    );

    return result.rows.map(mapTicketRow);
  }

  async findRecentTicketsForCustomer(customerId: string): Promise<TicketResponse[]> {
    const result = await this.database.query<TicketRow>(
      `
        SELECT ${ticketSelect}
        ${ticketJoin}
        WHERE t.customer_id = $1
        ORDER BY t.created_at DESC
        LIMIT 5
      `,
      [customerId]
    );

    return result.rows.map(mapTicketRow);
  }

  private appendFilters(
    conditions: string[],
    params: unknown[],
    query: TicketQueryDto
  ): void {
    if (query.status) {
      params.push(query.status);
      conditions.push(`t.status = $${params.length}`);
    }

    if (query.priority) {
      params.push(query.priority);
      conditions.push(`t.priority = $${params.length}`);
    }

    if (query.categoryId) {
      params.push(query.categoryId);
      conditions.push(`t.category_id = $${params.length}`);
    }

    if (query.search?.trim()) {
      params.push(`%${query.search.trim()}%`);
      conditions.push(`t.title ILIKE $${params.length}`);
    }
  }

  private async findTicketsByConditions(
    conditions: string[],
    params: unknown[]
  ): Promise<TicketResponse[]> {
    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await this.database.query<TicketRow>(
      `
        SELECT ${ticketSelect}
        ${ticketJoin}
        ${whereClause}
        ORDER BY t.created_at DESC
      `,
      params
    );

    return result.rows.map(mapTicketRow);
  }

  private async findMessagesByTicketId(ticketId: string): Promise<TicketMessageResponse[]> {
    const result = await this.database.query<TicketMessageRow>(
      `
        SELECT
          tm.id,
          tm.ticket_id,
          tm.sender_id,
          tm.message,
          tm.created_at,
          sender.id AS sender_id_ref,
          sender.name AS sender_name,
          sender.email AS sender_email,
          sender.role AS sender_role
        FROM ticket_messages tm
        INNER JOIN users sender ON sender.id = tm.sender_id
        WHERE tm.ticket_id = $1
        ORDER BY tm.created_at ASC
      `,
      [ticketId]
    );

    return result.rows.map(mapTicketMessageRow);
  }

  private async requireTicket(id: string): Promise<TicketResponse> {
    const ticket = await this.findByIdWithRelations(id);

    if (!ticket) {
      throw new Error('Updated ticket could not be loaded.');
    }

    return ticket;
  }
}
