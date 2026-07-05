import { Module } from '@nestjs/common';
import { CategoriesModule } from '../categories/categories.module';
import { UsersModule } from '../users/users.module';
import { TicketsController } from './tickets.controller';
import { TicketsRepository } from './tickets.repository';
import { TicketsService } from './tickets.service';

@Module({
  imports: [CategoriesModule, UsersModule],
  controllers: [TicketsController],
  providers: [TicketsRepository, TicketsService],
  exports: [TicketsRepository, TicketsService]
})
export class TicketsModule {}
