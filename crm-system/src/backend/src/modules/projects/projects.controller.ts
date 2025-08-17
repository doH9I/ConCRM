import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectStatus, ProjectPriority } from './entities/project.entity';

@ApiTags('Projects')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
  findAll() {
    return this.projectsService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search projects' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiResponse({ status: 200, description: 'Search results' })
  search(@Query('q') query: string) {
    return this.projectsService.searchProjects(query);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get projects by status' })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
  findByStatus(@Param('status') status: ProjectStatus) {
    return this.projectsService.findByStatus(status);
  }

  @Get('priority/:priority')
  @ApiOperation({ summary: 'Get projects by priority' })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
  findByPriority(@Param('priority') priority: ProjectPriority) {
    return this.projectsService.findByPriority(priority);
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Get projects by company' })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
  findByCompany(@Param('companyId') companyId: string) {
    return this.projectsService.findByCompany(+companyId);
  }

  @Get('manager/:managerId')
  @ApiOperation({ summary: 'Get projects by manager' })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
  findByManager(@Param('managerId') managerId: string) {
    return this.projectsService.findByManager(+managerId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active projects' })
  @ApiResponse({ status: 200, description: 'Active projects retrieved successfully' })
  getActiveProjects() {
    return this.projectsService.getActiveProjects();
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue projects' })
  @ApiResponse({ status: 200, description: 'Overdue projects retrieved successfully' })
  getOverdueProjects() {
    return this.projectsService.getOverdueProjects();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get project statistics' })
  @ApiResponse({ status: 200, description: 'Project statistics retrieved' })
  getProjectStats() {
    return this.projectsService.getProjectStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiResponse({ status: 200, description: 'Project retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update project' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(+id, updateProjectDto);
  }

  @Put(':id/progress')
  @ApiOperation({ summary: 'Update project progress' })
  @ApiResponse({ status: 200, description: 'Project progress updated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  updateProgress(@Param('id') id: string, @Body('progress') progress: number) {
    return this.projectsService.updateProgress(+id, progress);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  remove(@Param('id') id: string) {
    return this.projectsService.remove(+id);
  }
}