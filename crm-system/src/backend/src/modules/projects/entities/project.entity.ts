import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Company } from '../../companies/entities/company.entity';
import { User } from '../../users/entities/user.entity';
import { Task } from '../../tasks/entities/task.entity';

export enum ProjectStatus {
  PLANNING = 'Planning',
  IN_PROGRESS = 'In Progress',
  ON_HOLD = 'On Hold',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export enum ProjectPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

@Entity('projects')
export class Project {
  @ApiProperty({ description: 'Project ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Project name' })
  @Column()
  @Index()
  name: string;

  @ApiProperty({ description: 'Project description' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Project status', enum: ProjectStatus })
  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING,
  })
  status: ProjectStatus;

  @ApiProperty({ description: 'Project priority', enum: ProjectPriority })
  @Column({
    type: 'enum',
    enum: ProjectPriority,
    default: ProjectPriority.MEDIUM,
  })
  priority: ProjectPriority;

  @ApiProperty({ description: 'Project start date' })
  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @ApiProperty({ description: 'Project end date' })
  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @ApiProperty({ description: 'Project budget' })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  budget: number;

  @ApiProperty({ description: 'Actual project cost' })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualCost: number;

  @ApiProperty({ description: 'Project progress percentage' })
  @Column({ type: 'int', default: 0 })
  progress: number;

  @ApiProperty({ description: 'Project manager ID' })
  @Column({ nullable: true })
  managerId: number;

  @ApiProperty({ description: 'Company ID' })
  @Column({ nullable: true })
  companyId: number;

  @ApiProperty({ description: 'Project location' })
  @Column({ nullable: true })
  location: string;

  @ApiProperty({ description: 'Project type' })
  @Column({ nullable: true })
  type: string;

  @ApiProperty({ description: 'Project category' })
  @Column({ nullable: true })
  category: string;

  @ApiProperty({ description: 'Project tags (JSON)' })
  @Column({ type: 'json', nullable: true })
  tags: string[];

  @ApiProperty({ description: 'Project custom fields (JSON)' })
  @Column({ type: 'json', nullable: true })
  customFields: any;

  @ApiProperty({ description: 'Project notes' })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'Project creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Company, company => company.projects)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @ManyToOne(() => User, user => user.projects)
  @JoinColumn({ name: 'managerId' })
  manager: User;

  @OneToMany(() => Task, task => task.project)
  tasks: Task[];

  // Virtual properties
  get displayName(): string {
    return this.name;
  }

  get duration(): number {
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  }

  get isOverdue(): boolean {
    if (this.endDate && this.status !== ProjectStatus.COMPLETED) {
      return new Date() > new Date(this.endDate);
    }
    return false;
  }

  get budgetUsage(): number {
    if (this.budget && this.budget > 0) {
      return (this.actualCost / this.budget) * 100;
    }
    return 0;
  }

  get isOverBudget(): boolean {
    return this.budgetUsage > 100;
  }

  // Methods
  isActive(): boolean {
    return this.status === ProjectStatus.PLANNING || this.status === ProjectStatus.IN_PROGRESS;
  }

  isCompleted(): boolean {
    return this.status === ProjectStatus.COMPLETED;
  }

  isOnHold(): boolean {
    return this.status === ProjectStatus.ON_HOLD;
  }

  isCancelled(): boolean {
    return this.status === ProjectStatus.CANCELLED;
  }

  getTaskCount(): number {
    return this.tasks ? this.tasks.length : 0;
  }

  getCompletedTaskCount(): number {
    if (!this.tasks) return 0;
    return this.tasks.filter(task => task.status === 'Completed').length;
  }

  getTaskProgress(): number {
    const totalTasks = this.getTaskCount();
    if (totalTasks === 0) return 0;
    return (this.getCompletedTaskCount() / totalTasks) * 100;
  }
}