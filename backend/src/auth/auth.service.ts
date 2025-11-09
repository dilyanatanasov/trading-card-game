import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CardsService } from '../cards/cards.service';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private cardsService: CardsService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        coins: user.coins,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    // Give new users 3 starter cards
    try {
      for (let i = 0; i < 3; i++) {
        const randomCard = await this.cardsService.getRandomCard();
        await this.cardsService.addCardToUser(user.id, randomCard.id);
      }
    } catch (error) {
      // If no cards available yet, that's okay
      console.log('No cards available for new user starter pack');
    }

    return this.login(user);
  }

  async getProfile(userId: string) {
    return this.usersService.findOne(userId);
  }
}
