import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsUrl } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'Company name',
    example: 'ABC Construction Co.',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Company industry',
    example: 'Construction',
    required: false,
  })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiProperty({
    description: 'Company size',
    example: '50-100 employees',
    required: false,
  })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiProperty({
    description: 'Company address',
    example: '123 Main St, City, State 12345',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'Company phone number',
    example: '+1-555-0123',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Company email',
    example: 'info@abcconstruction.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Company website',
    example: 'https://abcconstruction.com',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({
    description: 'Primary contact person',
    example: 'John Smith',
    required: false,
  })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiProperty({
    description: 'Primary contact email',
    example: 'john.smith@abcconstruction.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiProperty({
    description: 'Primary contact phone',
    example: '+1-555-0124',
    required: false,
  })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiProperty({
    description: 'Company description',
    example: 'Leading construction company specializing in commercial buildings',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Company notes',
    example: 'Potential client for office building project',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}