import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus, TaskPriority } from './entities/task.entity';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  findAll() {
    return this.tasksService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search tasks' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiResponse({ status: 200, description: 'Search results' })
  search(@Query('q') query: string) {
    return this.tasksService.searchTasks(query);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get tasks by status' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  findByStatus(@Param('status') status: TaskStatus) {
    return this.tasksService.findByStatus(status);
  }

  @Get('priority/:priority')
  @ApiOperation({ summary: 'Get tasks by priority' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  findByPriority(@Param('priority') priority: TaskPriority) {
    return this.tasksService.findByPriority(priority);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get tasks by project' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  findByProject(@Param('projectId') projectId: string) {
    return this.tasksService.findByProject(+projectId);
  }

  @Get('assigned/:userId')
  @ApiOperation({ summary: 'Get tasks assigned to user' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  findByAssignedUser(@Param('userId') userId: string) {
    return this.tasksService.findByAssignedUser(+userId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active tasks' })
  @ApiResponse({ status: 200, description: 'Active tasks retrieved successfully' })
  getActiveTasks() {
    return this.tasksService.getActiveTasks();
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue tasks' })
  @ApiResponse({ status: 200, description: 'Overdue tasks retrieved successfully' })
  getOverdueTasks() {
    return this.tasksService.getOverdueTasks();
  }

  @Get('high-priority')
  @ApiOperation({ summary: 'Get high priority tasks' })
  @ApiResponse({ status: 200, description: 'High priority tasks retrieved successfully' })
  getHighPriorityTasks() {
    return this.tasksService.getHighPriorityTasks();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get task statistics' })
  @ApiResponse({ status: 200, description: 'Task statistics retrieved' })
  getTaskStats() {
    return this.tasksService.getTaskStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update task' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(+id, updateTaskDto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update task status' })
  @ApiResponse({ status: 200, description: 'Task status updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  updateStatus(@Param('id') id: string, @Body('status') status: TaskStatus) {
    return this.tasksService.updateTaskStatus(+id, status);
  }

  @Put(':id/progress')
  @ApiOperation({ summary: 'Update task progress' })
  @ApiResponse({ status: 200, description: 'Task progress updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  updateProgress(@Param('id') id: string, @Body('progress') progress: number) {
    return this.tasksService.updateTaskProgress(+id, progress);
  }

  @Put(':id/assign')
  @ApiOperation({ summary: 'Assign task to user' })
  @ApiResponse({ status: 200, description: 'Task assigned successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  assignTask(@Param('id') id: string, @Body('userId') userId: number) {
    return this.tasksService.assignTask(+id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  remove(@Param('id') id: string) {
    return this.tasksService.remove(+id);
  }
}