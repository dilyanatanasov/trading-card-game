import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CardsService } from '../cards/cards.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private cardsService: CardsService,
    private usersService: UsersService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async distributeDailyCards() {
    this.logger.log('Starting daily card distribution...');

    try {
      const users = await this.usersService.findAll();

      for (const user of users) {
        const now = new Date();
        const lastDaily = user['lastDailyCardAt'];

        // Check if user already received card today
        if (lastDaily) {
          const lastDailyDate = new Date(lastDaily);
          const isSameDay =
            now.getFullYear() === lastDailyDate.getFullYear() &&
            now.getMonth() === lastDailyDate.getMonth() &&
            now.getDate() === lastDailyDate.getDate();

          if (isSameDay) {
            continue; // Skip if already received today
          }
        }

        // Get random card and add to user
        const randomCard = await this.cardsService.getRandomCard();
        await this.cardsService.addCardToUser(user.id, randomCard.id);
        await this.usersService.updateLastDailyCard(user.id);

        this.logger.log(`Distributed card ${randomCard.name} to user ${user.username}`);
      }

      this.logger.log('Daily card distribution completed');
    } catch (error) {
      this.logger.error('Error during daily card distribution', error);
    }
  }

  // Manual trigger for testing
  async manualDistribute(userId: string) {
    const randomCard = await this.cardsService.getRandomCard();
    await this.cardsService.addCardToUser(userId, randomCard.id);
    await this.usersService.updateLastDailyCard(userId);
    return { message: 'Daily card distributed', card: randomCard };
  }
}
