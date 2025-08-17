import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export enum LeadStatus {
  NEW = 'New',
  CONTACTED = 'Contacted',
  QUALIFIED = 'Qualified',
  PROPOSAL = 'Proposal',
  NEGOTIATION = 'Negotiation',
  CLOSED_WON = 'Closed Won',
  CLOSED_LOST = 'Closed Lost',
}

export enum LeadSource {
  WEBSITE = 'Website',
  REFERRAL = 'Referral',
  COLD_CALL = 'Cold Call',
  TRADE_SHOW = 'Trade Show',
  SOCIAL_MEDIA = 'Social Media',
  EMAIL_CAMPAIGN = 'Email Campaign',
  OTHER = 'Other',
}

@Entity('leads')
export class Lead {
  @ApiProperty({ description: 'Lead ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Lead first name' })
  @Column()
  firstName: string;

  @ApiProperty({ description: 'Lead last name' })
  @Column()
  lastName: string;

  @ApiProperty({ description: 'Lead email address' })
  @Column({ nullable: true })
  @Index()
  email: string;

  @ApiProperty({ description: 'Lead phone number' })
  @Column({ nullable: true })
  phone: string;

  @ApiProperty({ description: 'Lead company name' })
  @Column({ nullable: true })
  @Index()
  company: string;

  @ApiProperty({ description: 'Lead source', enum: LeadSource })
  @Column({
    type: 'enum',
    enum: LeadSource,
    default: LeadSource.OTHER,
  })
  source: LeadSource;

  @ApiProperty({ description: 'Lead status', enum: LeadStatus })
  @Column({
    type: 'enum',
    enum: LeadStatus,
    default: LeadStatus.NEW,
  })
  status: LeadStatus;

  @ApiProperty({ description: 'Lead value' })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  value: number;

  @ApiProperty({ description: 'Assigned user ID' })
  @Column({ nullable: true })
  assignedToId: number;

  @ApiProperty({ description: 'Lead notes' })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'Lead tags (JSON)' })
  @Column({ type: 'json', nullable: true })
  tags: string[];

  @ApiProperty({ description: 'Lead custom fields (JSON)' })
  @Column({ type: 'json', nullable: true })
  customFields: any;

  @ApiProperty({ description: 'Lead creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.leads)
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User;

  // Virtual properties
  get displayName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get fullContact(): string {
    const contact = [];
    if (this.email) contact.push(this.email);
    if (this.phone) contact.push(this.phone);
    return contact.join(' | ') || 'No contact info';
  }

  get isQualified(): boolean {
    return this.status === LeadStatus.QUALIFIED || 
           this.status === LeadStatus.PROPOSAL || 
           this.status === LeadStatus.NEGOTIATION;
  }

  get isClosed(): boolean {
    return this.status === LeadStatus.CLOSED_WON || this.status === LeadStatus.CLOSED_LOST;
  }

  get isWon(): boolean {
    return this.status === LeadStatus.CLOSED_WON;
  }

  get isLost(): boolean {
    return this.status === LeadStatus.CLOSED_LOST;
  }

  get isActive(): boolean {
    return !this.isClosed;
  }

  // Methods
  isNew(): boolean {
    return this.status === LeadStatus.NEW;
  }

  isContacted(): boolean {
    return this.status === LeadStatus.CONTACTED;
  }

  isInPipeline(): boolean {
    return this.status === LeadStatus.QUALIFIED || 
           this.status === LeadStatus.PROPOSAL || 
           this.status === LeadStatus.NEGOTIATION;
  }

  hasCompany(): boolean {
    return !!this.company;
  }

  hasContactInfo(): boolean {
    return !!(this.email || this.phone);
  }

  isAssigned(): boolean {
    return !!this.assignedToId;
  }

  getAgeInDays(): number {
    const now = new Date();
    const created = new Date(this.createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isStale(daysThreshold: number = 30): boolean {
    return this.getAgeInDays() > daysThreshold;
  }
}