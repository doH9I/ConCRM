import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard overview data' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  getDashboardData() {
    return this.dashboardService.getDashboardData();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get all statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStats() {
    return Promise.all([
      this.dashboardService.getUserStats(),
      this.dashboardService.getCompanyStats(),
      this.dashboardService.getProjectStats(),
      this.dashboardService.getLeadStats(),
      this.dashboardService.getTaskStats(),
    ]).then(([userStats, companyStats, projectStats, leadStats, taskStats]) => ({
      userStats,
      companyStats,
      projectStats,
      leadStats,
      taskStats,
    }));
  }

  @Get('projects/recent')
  @ApiOperation({ summary: 'Get recent projects' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of projects to return' })
  @ApiResponse({ status: 200, description: 'Recent projects retrieved successfully' })
  getRecentProjects(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 5;
    return this.dashboardService.getRecentProjects(limitNum);
  }

  @Get('leads/recent')
  @ApiOperation({ summary: 'Get recent leads' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of leads to return' })
  @ApiResponse({ status: 200, description: 'Recent leads retrieved successfully' })
  getRecentLeads(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 5;
    return this.dashboardService.getRecentLeads(limitNum);
  }

  @Get('tasks/overdue')
  @ApiOperation({ summary: 'Get overdue tasks' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of tasks to return' })
  @ApiResponse({ status: 200, description: 'Overdue tasks retrieved successfully' })
  getOverdueTasks(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.dashboardService.getOverdueTasks(limitNum);
  }

  @Get('projects/progress')
  @ApiOperation({ summary: 'Get project progress data' })
  @ApiResponse({ status: 200, description: 'Project progress data retrieved successfully' })
  getProjectProgress() {
    return this.dashboardService.getProjectProgress();
  }

  @Get('leads/pipeline')
  @ApiOperation({ summary: 'Get lead pipeline data' })
  @ApiResponse({ status: 200, description: 'Lead pipeline data retrieved successfully' })
  getLeadPipeline() {
    return this.dashboardService.getLeadPipeline();
  }
}