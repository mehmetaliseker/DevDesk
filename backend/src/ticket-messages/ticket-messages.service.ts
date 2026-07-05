import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';
import { TicketStatus } from '../common/enums/ticket-status.enum';
import { TicketAccessRecord, TicketsRepository } from '../tickets/tickets.repository';
import { CreateTicketMessageDto } from './dto/create-ticket-message.dto';
import { TicketMessagesRepository } from './ticket-messages.repository';

type MessageTicketAccessShape = Pick<
  TicketAccessRecord,
  'customerId' | 'assignedAgentId' | 'status'
>;

@Injectable()
export class TicketMessagesService {
  constructor(
    private readonly ticketsRepository: TicketsRepository,
    private readonly ticketMessagesRepository: TicketMessagesRepository
  ) {}

  async create(ticketId: string, dto: CreateTicketMessageDto, user: AuthenticatedUser) {
    const ticket = await this.ticketsRepository.findAccessById(ticketId);

    if (!ticket) {
      throw new NotFoundException('Ticket not found.');
    }

    if (ticket.status === TicketStatus.CLOSED) {
      throw new BadRequestException('Closed tickets cannot receive new messages.');
    }

    this.ensureCanMessage(ticket, user);

    return this.ticketMessagesRepository.createMessage({
      ticketId,
      senderId: user.id,
      message: dto.message.trim()
    });
  }

  private ensureCanMessage(ticket: MessageTicketAccessShape, user: AuthenticatedUser): void {
    if (user.role === Role.ADMIN) {
      return;
    }

    if (user.role === Role.CUSTOMER && ticket.customerId === user.id) {
      return;
    }

    if (
      user.role === Role.SUPPORT_AGENT &&
      (ticket.status === TicketStatus.OPEN || ticket.assignedAgentId === user.id)
    ) {
      return;
    }

    throw new ForbiddenException('You cannot write a message on this ticket.');
  }
}
