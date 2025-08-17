import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@ApiTags('Companies')
@Controller('companies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  @ApiResponse({ status: 201, description: 'Company created successfully' })
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  @ApiResponse({ status: 200, description: 'Companies retrieved successfully' })
  findAll() {
    return this.companiesService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search companies' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiResponse({ status: 200, description: 'Search results' })
  search(@Query('q') query: string) {
    return this.companiesService.searchCompanies(query);
  }

  @Get('industry/:industry')
  @ApiOperation({ summary: 'Get companies by industry' })
  @ApiResponse({ status: 200, description: 'Companies retrieved successfully' })
  findByIndustry(@Param('industry') industry: string) {
    return this.companiesService.findByIndustry(industry);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get companies by status' })
  @ApiResponse({ status: 200, description: 'Companies retrieved successfully' })
  findByStatus(@Param('status') status: string) {
    return this.companiesService.findByStatus(status);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active companies' })
  @ApiResponse({ status: 200, description: 'Active companies retrieved successfully' })
  getActiveCompanies() {
    return this.companiesService.getActiveCompanies();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get company statistics' })
  @ApiResponse({ status: 200, description: 'Company statistics retrieved' })
  getCompanyStats() {
    return this.companiesService.getCompanyStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiResponse({ status: 200, description: 'Company retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update company' })
  @ApiResponse({ status: 200, description: 'Company updated successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(+id, updateCompanyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete company' })
  @ApiResponse({ status: 200, description: 'Company deleted successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  remove(@Param('id') id: string) {
    return this.companiesService.remove(+id);
  }
}