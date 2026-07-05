import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import configuration from './config/configuration';
import { DashboardModule } from './dashboard/dashboard.module';
import { DatabaseModule } from './database/database.module';
import { TicketMessagesModule } from './ticket-messages/ticket-messages.module';
import { TicketsModule } from './tickets/tickets.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    TicketsModule,
    TicketMessagesModule,
    CategoriesModule,
    DashboardModule
  ]
})
export class AppModule {}
