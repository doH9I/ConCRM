import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
}

@Entity('users')
export class User {
  @ApiProperty({ description: 'User ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'User email address' })
  @Column({ unique: true })
  @Index()
  email: string;

  @ApiProperty({ description: 'Hashed password' })
  @Column()
  passwordHash: string;

  @ApiProperty({ description: 'User first name' })
  @Column()
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  @Column()
  lastName: string;

  @ApiProperty({ description: 'User role', enum: UserRole })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @ApiProperty({ description: 'Whether the user account is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'User department' })
  @Column({ nullable: true })
  department: string;

  @ApiProperty({ description: 'User phone number' })
  @Column({ nullable: true })
  phone: string;

  @ApiProperty({ description: 'Last login timestamp' })
  @Column({ nullable: true })
  lastLogin: Date;

  @ApiProperty({ description: 'User avatar URL' })
  @Column({ nullable: true })
  avatar: string;

  @ApiProperty({ description: 'User preferences (JSON)' })
  @Column({ type: 'json', nullable: true })
  preferences: any;

  @ApiProperty({ description: 'Account creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get displayName(): string {
    return this.fullName;
  }

  // Methods
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  isManager(): boolean {
    return this.role === UserRole.MANAGER || this.role === UserRole.ADMIN;
  }

  hasPermission(permission: string): boolean {
    switch (permission) {
      case 'admin':
        return this.role === UserRole.ADMIN;
      case 'manager':
        return this.role === UserRole.MANAGER || this.role === UserRole.ADMIN;
      case 'user':
        return true;
      default:
        return false;
    }
  }
}