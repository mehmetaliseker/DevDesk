import { Module } from '@nestjs/common';
import { TicketsModule } from '../tickets/tickets.module';
import { TicketMessagesController } from './ticket-messages.controller';
import { TicketMessagesRepository } from './ticket-messages.repository';
import { TicketMessagesService } from './ticket-messages.service';

@Module({
  imports: [TicketsModule],
  controllers: [TicketMessagesController],
  providers: [TicketMessagesRepository, TicketMessagesService]
})
export class TicketMessagesModule {}
