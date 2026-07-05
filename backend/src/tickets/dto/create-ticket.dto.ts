import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { TicketPriority } from '../../common/enums/ticket-priority.enum';

export class CreateTicketDto {
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  title: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description: string;

  @IsString()
  categoryId: string;

  @IsEnum(TicketPriority)
  priority: TicketPriority;
}
