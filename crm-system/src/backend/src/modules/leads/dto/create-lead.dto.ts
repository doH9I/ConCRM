import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsNumber, IsEnum, IsArray } from 'class-validator';
import { LeadStatus, LeadSource } from '../entities/lead.entity';

export class CreateLeadDto {
  @ApiProperty({
    description: 'Lead first name',
    example: 'John',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'Lead last name',
    example: 'Doe',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'Lead email address',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Lead phone number',
    example: '+1-555-0123',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Lead company name',
    example: 'ABC Corporation',
    required: false,
  })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiProperty({
    description: 'Lead source',
    enum: LeadSource,
    example: LeadSource.WEBSITE,
    required: false,
  })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @ApiProperty({
    description: 'Lead status',
    enum: LeadStatus,
    example: LeadStatus.NEW,
    required: false,
  })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiProperty({
    description: 'Lead value',
    example: 50000.00,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiProperty({
    description: 'Assigned user ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  assignedToId?: number;

  @ApiProperty({
    description: 'Lead notes',
    example: 'Interested in office renovation project',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Lead tags',
    example: ['commercial', 'renovation', 'high-value'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}