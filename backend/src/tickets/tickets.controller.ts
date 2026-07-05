import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthenticatedUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketQueryDto } from './dto/ticket-query.dto';
import { UpdateTicketPriorityDto } from './dto/update-ticket-priority.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { TicketsService } from './tickets.service';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Roles(Role.CUSTOMER)
  create(@Body() dto: CreateTicketDto, @CurrentUser() user: AuthenticatedUser) {
    return this.ticketsService.create(dto, user);
  }

  @Get()
  findAll(@Query() query: TicketQueryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.ticketsService.findAll(query, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.ticketsService.findOne(id, user);
  }

  @Patch(':id/status')
  @Roles(Role.SUPPORT_AGENT, Role.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTicketStatusDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.ticketsService.updateStatus(id, dto, user);
  }

  @Patch(':id/priority')
  @Roles(Role.SUPPORT_AGENT, Role.ADMIN)
  updatePriority(
    @Param('id') id: string,
    @Body() dto: UpdateTicketPriorityDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.ticketsService.updatePriority(id, dto, user);
  }

  @Patch(':id/assign')
  @Roles(Role.SUPPORT_AGENT, Role.ADMIN)
  assign(
    @Param('id') id: string,
    @Body() dto: AssignTicketDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.ticketsService.assign(id, dto, user);
  }
}
