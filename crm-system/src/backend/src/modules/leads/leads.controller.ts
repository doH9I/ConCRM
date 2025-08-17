import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadStatus, LeadSource } from './entities/lead.entity';

@ApiTags('Leads')
@Controller('leads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lead' })
  @ApiResponse({ status: 201, description: 'Lead created successfully' })
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all leads' })
  @ApiResponse({ status: 200, description: 'Leads retrieved successfully' })
  findAll() {
    return this.leadsService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search leads' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiResponse({ status: 200, description: 'Search results' })
  search(@Query('q') query: string) {
    return this.leadsService.searchLeads(query);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get leads by status' })
  @ApiResponse({ status: 200, description: 'Leads retrieved successfully' })
  findByStatus(@Param('status') status: LeadStatus) {
    return this.leadsService.findByStatus(status);
  }

  @Get('source/:source')
  @ApiOperation({ summary: 'Get leads by source' })
  @ApiResponse({ status: 200, description: 'Leads retrieved successfully' })
  findBySource(@Param('source') source: LeadSource) {
    return this.leadsService.findBySource(source);
  }

  @Get('assigned/:userId')
  @ApiOperation({ summary: 'Get leads assigned to user' })
  @ApiResponse({ status: 200, description: 'Leads retrieved successfully' })
  findByAssignedUser(@Param('userId') userId: string) {
    return this.leadsService.findByAssignedUser(+userId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active leads' })
  @ApiResponse({ status: 200, description: 'Active leads retrieved successfully' })
  getActiveLeads() {
    return this.leadsService.getActiveLeads();
  }

  @Get('qualified')
  @ApiOperation({ summary: 'Get qualified leads' })
  @ApiResponse({ status: 200, description: 'Qualified leads retrieved successfully' })
  getQualifiedLeads() {
    return this.leadsService.getQualifiedLeads();
  }

  @Get('closed')
  @ApiOperation({ summary: 'Get closed leads' })
  @ApiResponse({ status: 200, description: 'Closed leads retrieved successfully' })
  getClosedLeads() {
    return this.leadsService.getClosedLeads();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get lead statistics' })
  @ApiResponse({ status: 200, description: 'Lead statistics retrieved' })
  getLeadStats() {
    return this.leadsService.getLeadStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lead by ID' })
  @ApiResponse({ status: 200, description: 'Lead retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update lead' })
  @ApiResponse({ status: 200, description: 'Lead updated successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    return this.leadsService.update(+id, updateLeadDto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update lead status' })
  @ApiResponse({ status: 200, description: 'Lead status updated successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  updateStatus(@Param('id') id: string, @Body('status') status: LeadStatus) {
    return this.leadsService.updateLeadStatus(+id, status);
  }

  @Put(':id/assign')
  @ApiOperation({ summary: 'Assign lead to user' })
  @ApiResponse({ status: 200, description: 'Lead assigned successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  assignLead(@Param('id') id: string, @Body('userId') userId: number) {
    return this.leadsService.assignLead(+id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete lead' })
  @ApiResponse({ status: 200, description: 'Lead deleted successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  remove(@Param('id') id: string) {
    return this.leadsService.remove(+id);
  }
}