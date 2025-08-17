import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { ReportsService } from './reports.service';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  @ApiOperation({ summary: 'Generate sales report' })
  @ApiQuery({ name: 'startDate', description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Sales report generated successfully' })
  generateSalesReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.reportsService.generateSalesReport(start, end);
  }

  @Get('projects')
  @ApiOperation({ summary: 'Generate project report' })
  @ApiQuery({ name: 'startDate', description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Project report generated successfully' })
  generateProjectReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.reportsService.generateProjectReport(start, end);
  }

  @Get('tasks')
  @ApiOperation({ summary: 'Generate task report' })
  @ApiQuery({ name: 'startDate', description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Task report generated successfully' })
  generateTaskReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.reportsService.generateTaskReport(start, end);
  }

  @Get('users/performance')
  @ApiOperation({ summary: 'Generate user performance report' })
  @ApiQuery({ name: 'startDate', description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'User performance report generated successfully' })
  generateUserPerformanceReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.reportsService.generateUserPerformanceReport(start, end);
  }

  @Get('companies')
  @ApiOperation({ summary: 'Generate company report' })
  @ApiQuery({ name: 'startDate', description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Company report generated successfully' })
  generateCompanyReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.reportsService.generateCompanyReport(start, end);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Generate summary report for all areas' })
  @ApiQuery({ name: 'startDate', description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Summary report generated successfully' })
  async generateSummaryReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const [salesReport, projectReport, taskReport, userReport, companyReport] = await Promise.all([
      this.reportsService.generateSalesReport(start, end),
      this.reportsService.generateProjectReport(start, end),
      this.reportsService.generateTaskReport(start, end),
      this.reportsService.generateUserPerformanceReport(start, end),
      this.reportsService.generateCompanyReport(start, end),
    ]);

    return {
      period: { startDate: start, endDate: end },
      sales: salesReport.summary,
      projects: projectReport.summary,
      tasks: taskReport.summary,
      users: userReport.userPerformance.length,
      companies: companyReport.summary,
      generatedAt: new Date().toISOString(),
    };
  }
}