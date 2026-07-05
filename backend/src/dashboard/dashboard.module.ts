import { Module } from '@nestjs/common';
import { CategoriesModule } from '../categories/categories.module';
import { TicketsModule } from '../tickets/tickets.module';
import { UsersModule } from '../users/users.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [CategoriesModule, TicketsModule, UsersModule],
  controllers: [DashboardController],
  providers: [DashboardService]
})
export class DashboardModule {}
