import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AuthenticatedUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TicketMessagesService } from './ticket-messages.service';
import { CreateTicketMessageDto } from './dto/create-ticket-message.dto';

@Controller('tickets/:ticketId/messages')
@UseGuards(JwtAuthGuard)
export class TicketMessagesController {
  constructor(private readonly ticketMessagesService: TicketMessagesService) {}

  @Post()
  create(
    @Param('ticketId') ticketId: string,
    @Body() dto: CreateTicketMessageDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.ticketMessagesService.create(ticketId, dto, user);
  }
}
