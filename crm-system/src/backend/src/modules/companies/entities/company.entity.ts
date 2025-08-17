import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Project } from '../../projects/entities/project.entity';

@Entity('companies')
export class Company {
  @ApiProperty({ description: 'Company ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Company name' })
  @Column()
  @Index()
  name: string;

  @ApiProperty({ description: 'Company industry' })
  @Column({ nullable: true })
  industry: string;

  @ApiProperty({ description: 'Company size' })
  @Column({ nullable: true })
  size: string;

  @ApiProperty({ description: 'Company address' })
  @Column({ type: 'text', nullable: true })
  address: string;

  @ApiProperty({ description: 'Company phone number' })
  @Column({ nullable: true })
  phone: string;

  @ApiProperty({ description: 'Company email' })
  @Column({ nullable: true })
  @Index()
  email: string;

  @ApiProperty({ description: 'Company website' })
  @Column({ nullable: true })
  website: string;

  @ApiProperty({ description: 'Company status' })
  @Column({ default: 'Active' })
  status: string;

  @ApiProperty({ description: 'Primary contact person' })
  @Column({ nullable: true })
  contactPerson: string;

  @ApiProperty({ description: 'Primary contact email' })
  @Column({ nullable: true })
  contactEmail: string;

  @ApiProperty({ description: 'Primary contact phone' })
  @Column({ nullable: true })
  contactPhone: string;

  @ApiProperty({ description: 'Company description' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Company notes' })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'Company tags (JSON)' })
  @Column({ type: 'json', nullable: true })
  tags: string[];

  @ApiProperty({ description: 'Company custom fields (JSON)' })
  @Column({ type: 'json', nullable: true })
  customFields: any;

  @ApiProperty({ description: 'Company creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Project, project => project.company)
  projects: Project[];

  // Virtual properties
  get displayName(): string {
    return this.name;
  }

  get fullAddress(): string {
    return this.address || 'No address provided';
  }

  get contactInfo(): string {
    if (this.contactPerson && this.contactEmail) {
      return `${this.contactPerson} (${this.contactEmail})`;
    }
    return this.contactPerson || this.contactEmail || 'No contact info';
  }

  // Methods
  isActive(): boolean {
    return this.status.toLowerCase() === 'active';
  }

  hasContactInfo(): boolean {
    return !!(this.contactPerson || this.contactEmail || this.contactPhone);
  }

  getProjectCount(): number {
    return this.projects ? this.projects.length : 0;
  }
}