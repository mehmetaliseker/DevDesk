import { IsEnum } from 'class-validator';
import { TicketPriority } from '../../common/enums/ticket-priority.enum';

export class UpdateTicketPriorityDto {
  @IsEnum(TicketPriority)
  priority: TicketPriority;
}
