import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, IsArray } from 'class-validator';
import { ProjectStatus, ProjectPriority } from '../entities/project.entity';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Project name',
    example: 'Office Building Construction',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Project description',
    example: 'Construction of a 5-story office building in downtown area',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Project status',
    enum: ProjectStatus,
    example: ProjectStatus.PLANNING,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiProperty({
    description: 'Project priority',
    enum: ProjectPriority,
    example: ProjectPriority.HIGH,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProjectPriority)
  priority?: ProjectPriority;

  @ApiProperty({
    description: 'Project start date',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Project end date',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Project budget',
    example: 2500000.00,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  budget?: number;

  @ApiProperty({
    description: 'Project manager ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  managerId?: number;

  @ApiProperty({
    description: 'Company ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  companyId?: number;

  @ApiProperty({
    description: 'Project location',
    example: '123 Main St, Downtown',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Project type',
    example: 'Commercial',
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    description: 'Project category',
    example: 'Office Buildings',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: 'Project tags',
    example: ['commercial', 'office', 'downtown'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: 'Project notes',
    example: 'High-profile client project with strict timeline',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}