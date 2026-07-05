import { Injectable } from '@nestjs/common';
import { Role } from '../common/enums/role.enum';
import { DatabaseService } from '../database/database.service';
import { TicketMessageResponse, mapTicketMessageRow } from '../tickets/tickets.repository';

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

@Injectable()
export class TicketMessagesRepository {
  constructor(private readonly database: DatabaseService) {}

  async createMessage(data: {
    ticketId: string;
    senderId: string;
    message: string;
  }): Promise<TicketMessageResponse> {
    const insertResult = await this.database.query<{ id: string }>(
      `
        INSERT INTO ticket_messages (ticket_id, sender_id, message)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      [data.ticketId, data.senderId, data.message]
    );

    const message = await this.findById(insertResult.rows[0].id);

    if (!message) {
      throw new Error('Created message could not be loaded.');
    }

    return message;
  }

  async findByTicketId(ticketId: string): Promise<TicketMessageResponse[]> {
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

  private async findById(id: string): Promise<TicketMessageResponse | null> {
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
        WHERE tm.id = $1
      `,
      [id]
    );

    return result.rows[0] ? mapTicketMessageRow(result.rows[0]) : null;
  }
}
