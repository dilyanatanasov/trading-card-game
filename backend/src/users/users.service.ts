import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingEmail = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const existingUsername = await this.usersRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'email', 'username', 'coins', 'createdAt'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'username', 'coins', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { username },
      select: ['id', 'email', 'username', 'coins', 'createdAt'],
    });
  }

  async updateCoins(userId: string, amount: number): Promise<User> {
    const user = await this.findOne(userId);
    user.coins += amount;
    return this.usersRepository.save(user);
  }

  async updateLastDailyCard(userId: string): Promise<User> {
    const user = await this.findOne(userId);
    user.lastDailyCardAt = new Date();
    return this.usersRepository.save(user);
  }
}
