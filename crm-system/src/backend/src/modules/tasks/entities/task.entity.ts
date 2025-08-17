import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Project } from '../../projects/entities/project.entity';
import { User } from '../../users/entities/user.entity';

export enum TaskStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  ON_HOLD = 'On Hold',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

@Entity('tasks')
export class Task {
  @ApiProperty({ description: 'Task ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Task title' })
  @Column()
  @Index()
  title: string;

  @ApiProperty({ description: 'Task description' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Task status', enum: TaskStatus })
  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @ApiProperty({ description: 'Task priority', enum: TaskPriority })
  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @ApiProperty({ description: 'Project ID' })
  @Column({ nullable: true })
  projectId: number;

  @ApiProperty({ description: 'Assigned user ID' })
  @Column({ nullable: true })
  assignedToId: number;

  @ApiProperty({ description: 'Task due date' })
  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @ApiProperty({ description: 'Task estimated hours' })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  estimatedHours: number;

  @ApiProperty({ description: 'Task actual hours' })
  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  actualHours: number;

  @ApiProperty({ description: 'Task progress percentage' })
  @Column({ type: 'int', default: 0 })
  progress: number;

  @ApiProperty({ description: 'Task tags (JSON)' })
  @Column({ type: 'json', nullable: true })
  tags: string[];

  @ApiProperty({ description: 'Task custom fields (JSON)' })
  @Column({ type: 'json', nullable: true })
  customFields: any;

  @ApiProperty({ description: 'Task notes' })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'Task creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Project, project => project.tasks)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @ManyToOne(() => User, user => user.tasks)
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User;

  // Virtual properties
  get displayName(): string {
    return this.title;
  }

  get isOverdue(): boolean {
    if (this.dueDate && this.status !== TaskStatus.COMPLETED) {
      return new Date() > new Date(this.dueDate);
    }
    return false;
  }

  get timeVariance(): number {
    if (this.estimatedHours && this.actualHours) {
      return this.actualHours - this.estimatedHours;
    }
    return 0;
  }

  get isOverTime(): boolean {
    return this.timeVariance > 0;
  }

  get completionRate(): number {
    return this.progress;
  }

  // Methods
  isActive(): boolean {
    return this.status === TaskStatus.PENDING || this.status === TaskStatus.IN_PROGRESS;
  }

  isCompleted(): boolean {
    return this.status === TaskStatus.COMPLETED;
  }

  isOnHold(): boolean {
    return this.status === TaskStatus.ON_HOLD;
  }

  isCancelled(): boolean {
    return this.status === TaskStatus.CANCELLED;
  }

  isAssigned(): boolean {
    return !!this.assignedToId;
  }

  isHighPriority(): boolean {
    return this.priority === TaskPriority.HIGH || this.priority === TaskPriority.CRITICAL;
  }

  getTimeEfficiency(): number {
    if (this.estimatedHours && this.actualHours && this.actualHours > 0) {
      return (this.estimatedHours / this.actualHours) * 100;
    }
    return 0;
  }

  isEfficient(): boolean {
    return this.getTimeEfficiency() >= 100;
  }
}