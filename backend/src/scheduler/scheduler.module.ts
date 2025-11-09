import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { CardsModule } from '../cards/cards.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [CardsModule, UsersModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
