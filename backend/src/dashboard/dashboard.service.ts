import { Injectable } from '@nestjs/common';
import { CategoriesRepository } from '../categories/categories.repository';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';
import { TicketStatus } from '../common/enums/ticket-status.enum';
import { TicketsRepository } from '../tickets/tickets.repository';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class DashboardService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly ticketsRepository: TicketsRepository,
    private readonly categoriesRepository: CategoriesRepository
  ) {}

  async getDashboard(user: AuthenticatedUser) {
    if (user.role === Role.ADMIN) {
      const [totalUsers, totalTickets, openTickets, categories] = await Promise.all([
        this.usersRepository.countUsers(),
        this.ticketsRepository.countTickets(),
        this.ticketsRepository.countByStatus(TicketStatus.OPEN),
        this.categoriesRepository.countCategories()
      ]);

      return {
        role: user.role,
        totalUsers,
        totalTickets,
        openTickets,
        categories
      };
    }

    if (user.role === Role.SUPPORT_AGENT) {
      const [assignedTickets, openTickets, priorityTickets] = await Promise.all([
        this.ticketsRepository.countForAgent(user.id),
        this.ticketsRepository.countByStatus(TicketStatus.OPEN),
        this.ticketsRepository.findPriorityTicketsForAgent(user.id)
      ]);

      return {
        role: user.role,
        assignedTickets,
        openTickets,
        priorityTickets
      };
    }

    const [openTickets, resolvedTickets, recentTickets] = await Promise.all([
      this.ticketsRepository.countForCustomer(user.id, [
        TicketStatus.OPEN,
        TicketStatus.IN_PROGRESS,
        TicketStatus.PENDING_CUSTOMER
      ]),
      this.ticketsRepository.countForCustomer(user.id, [TicketStatus.RESOLVED]),
      this.ticketsRepository.findRecentTicketsForCustomer(user.id)
    ]);

    return {
      role: user.role,
      openTickets,
      resolvedTickets,
      recentTickets
    };
  }
}
