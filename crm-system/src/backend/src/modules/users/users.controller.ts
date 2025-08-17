import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Put(':id/activate')
  @ApiOperation({ summary: 'Activate user account' })
  @ApiResponse({ status: 200, description: 'User activated successfully' })
  activate(@Param('id') id: string) {
    return this.usersService.activate(+id);
  }

  @Put(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate user account' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(+id);
  }

  @Put(':id/role')
  @ApiOperation({ summary: 'Change user role' })
  @ApiResponse({ status: 200, description: 'User role changed successfully' })
  changeRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.usersService.changeRole(+id, role);
  }

  @Get('role/:role')
  @ApiOperation({ summary: 'Get users by role' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  findByRole(@Param('role') role: UserRole) {
    return this.usersService.findByRole(role);
  }

  @Get('department/:department')
  @ApiOperation({ summary: 'Get users by department' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  findByDepartment(@Param('department') department: string) {
    return this.usersService.findByRole(department as UserRole);
  }

  @Get('active/list')
  @ApiOperation({ summary: 'Get all active users' })
  @ApiResponse({ status: 200, description: 'Active users retrieved successfully' })
  getActiveUsers() {
    return this.usersService.getActiveUsers();
  }
}