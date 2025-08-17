import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password if provided
    if (createUserDto.password) {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      createUserDto.passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);
    }

    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'department', 'isActive', 'createdAt'],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Hash password if provided
    if (updateUserDto.password) {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      updateUserDto.passwordHash = await bcrypt.hash(updateUserDto.password, saltRounds);
      delete updateUserDto.password;
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async activate(id: number): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = true;
    return this.usersRepository.save(user);
  }

  async deactivate(id: number): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = false;
    return this.usersRepository.save(user);
  }

  async changeRole(id: number, role: UserRole): Promise<User> {
    const user = await this.findOne(id);
    user.role = role;
    return this.usersRepository.save(user);
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.usersRepository.find({ where: { role } });
  }

  async findByDepartment(department: string): Promise<User[]> {
    return this.usersRepository.find({ where: { department } });
  }

  async getActiveUsers(): Promise<User[]> {
    return this.usersRepository.find({ where: { isActive: true } });
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.usersRepository.update(id, { lastLogin: new Date() });
  }
}