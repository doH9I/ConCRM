import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, IsArray } from 'class-validator';
import { TaskStatus, TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Task title',
    example: 'Foundation Inspection',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Task description',
    example: 'Conduct thorough inspection of building foundation',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Task status',
    enum: TaskStatus,
    example: TaskStatus.PENDING,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({
    description: 'Task priority',
    enum: TaskPriority,
    example: TaskPriority.HIGH,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiProperty({
    description: 'Project ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  projectId?: number;

  @ApiProperty({
    description: 'Assigned user ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  assignedToId?: number;

  @ApiProperty({
    description: 'Task due date',
    example: '2024-02-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({
    description: 'Task estimated hours',
    example: 8.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  estimatedHours?: number;

  @ApiProperty({
    description: 'Task tags',
    example: ['inspection', 'foundation', 'critical'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: 'Task notes',
    example: 'Requires structural engineer approval',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}