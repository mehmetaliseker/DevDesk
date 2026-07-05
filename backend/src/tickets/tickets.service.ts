import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';
import { TicketStatus } from '../common/enums/ticket-status.enum';
import { CategoriesRepository } from '../categories/categories.repository';
import { UsersRepository } from '../users/users.repository';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketQueryDto } from './dto/ticket-query.dto';
import { UpdateTicketPriorityDto } from './dto/update-ticket-priority.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import {
  TicketAccessRecord,
  TicketResponse,
  TicketsRepository
} from './tickets.repository';

type TicketAccessShape = Pick<
  TicketAccessRecord,
  'customerId' | 'assignedAgentId' | 'status'
>;

@Injectable()
export class TicketsService {
  constructor(
    private readonly ticketsRepository: TicketsRepository,
    private readonly categoriesRepository: CategoriesRepository,
    private readonly usersRepository: UsersRepository
  ) {}

  async create(dto: CreateTicketDto, user: AuthenticatedUser): Promise<TicketResponse> {
    const category = await this.categoriesRepository.findActiveById(dto.categoryId);

    if (!category) {
      throw new BadRequestException('Category is not active or does not exist.');
    }

    return this.ticketsRepository.createTicket({
      title: dto.title.trim(),
      description: dto.description.trim(),
      priority: dto.priority,
      customerId: user.id,
      categoryId: dto.categoryId
    });
  }

  async findAll(query: TicketQueryDto, user: AuthenticatedUser): Promise<TicketResponse[]> {
    if (user.role === Role.ADMIN) {
      return this.ticketsRepository.findAllTicketsForAdmin(query);
    }

    if (user.role === Role.CUSTOMER) {
      return this.ticketsRepository.findTicketsForCustomer(user.id, query);
    }

    return this.ticketsRepository.findTicketsForSupportAgent(user.id, query);
  }

  async findOne(id: string, user: AuthenticatedUser): Promise<TicketResponse> {
    const ticket = await this.ticketsRepository.findByIdWithRelations(id);

    if (!ticket) {
      throw new NotFoundException('Ticket not found.');
    }

    this.ensureCanAccess(ticket, user);

    return ticket;
  }

  async updateStatus(
    id: string,
    dto: UpdateTicketStatusDto,
    user: AuthenticatedUser
  ): Promise<TicketResponse> {
    const ticket = await this.findTicketForMutation(id, user);

    return this.ticketsRepository.updateStatus(ticket.id, dto.status);
  }

  async updatePriority(
    id: string,
    dto: UpdateTicketPriorityDto,
    user: AuthenticatedUser
  ): Promise<TicketResponse> {
    const ticket = await this.findTicketForMutation(id, user);

    return this.ticketsRepository.updatePriority(ticket.id, dto.priority);
  }

  async assign(
    id: string,
    dto: AssignTicketDto,
    user: AuthenticatedUser
  ): Promise<TicketResponse> {
    const ticket = await this.findTicketForMutation(id, user);

    if (user.role === Role.SUPPORT_AGENT) {
      if (dto.assignedAgentId && dto.assignedAgentId !== user.id) {
        throw new ForbiddenException('Support agents can only assign tickets to themselves.');
      }

      return this.ticketsRepository.assignTicket(
        ticket.id,
        user.id,
        ticket.status === TicketStatus.OPEN ? TicketStatus.IN_PROGRESS : ticket.status
      );
    }

    if (!dto.assignedAgentId) {
      throw new BadRequestException('assignedAgentId is required for admin assignment.');
    }

    const agent = await this.usersRepository.findById(dto.assignedAgentId);

    if (!agent || agent.role !== Role.SUPPORT_AGENT) {
      throw new BadRequestException('Assigned user must be a support agent.');
    }

    return this.ticketsRepository.assignTicket(
      ticket.id,
      dto.assignedAgentId,
      ticket.status === TicketStatus.OPEN ? TicketStatus.IN_PROGRESS : ticket.status
    );
  }

  ensureCanAccess(ticket: TicketAccessShape, user: AuthenticatedUser): void {
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

    throw new ForbiddenException('You do not have access to this ticket.');
  }

  private async findTicketForMutation(
    id: string,
    user: AuthenticatedUser
  ): Promise<TicketAccessRecord> {
    const ticket = await this.ticketsRepository.findAccessById(id);

    if (!ticket) {
      throw new NotFoundException('Ticket not found.');
    }

    this.ensureCanAccess(ticket, user);

    if (![Role.SUPPORT_AGENT, Role.ADMIN].includes(user.role)) {
      throw new ForbiddenException('Only support agents and admins can update tickets.');
    }

    if (ticket.status === TicketStatus.CLOSED && user.role !== Role.ADMIN) {
      throw new BadRequestException('Closed tickets can only be changed by an admin.');
    }

    return ticket;
  }
}
