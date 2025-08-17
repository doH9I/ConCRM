import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Task, TaskStatus, TaskPriority } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.tasksRepository.create(createTaskDto);
    return this.tasksRepository.save(task);
  }

  async findAll(): Promise<Task[]> {
    return this.tasksRepository.find({
      relations: ['project', 'assignedTo'],
    });
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['project', 'assignedTo'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    Object.assign(task, updateTaskDto);
    return this.tasksRepository.save(task);
  }

  async remove(id: number): Promise<void> {
    const task = await this.findOne(id);
    await this.tasksRepository.remove(task);
  }

  async findByStatus(status: TaskStatus): Promise<Task[]> {
    return this.tasksRepository.find({
      where: { status },
      relations: ['project', 'assignedTo'],
    });
  }

  async findByPriority(priority: TaskPriority): Promise<Task[]> {
    return this.tasksRepository.find({
      where: { priority },
      relations: ['project', 'assignedTo'],
    });
  }

  async findByProject(projectId: number): Promise<Task[]> {
    return this.tasksRepository.find({
      where: { projectId },
      relations: ['project', 'assignedTo'],
    });
  }

  async findByAssignedUser(userId: number): Promise<Task[]> {
    return this.tasksRepository.find({
      where: { assignedToId: userId },
      relations: ['project', 'assignedTo'],
    });
  }

  async searchTasks(query: string): Promise<Task[]> {
    return this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .where('task.title ILIKE :query', { query: `%${query}%` })
      .orWhere('task.description ILIKE :query', { query: `%${query}%` })
      .getMany();
  }

  async getActiveTasks(): Promise<Task[]> {
    return this.tasksRepository.find({
      where: { status: TaskStatus.IN_PROGRESS },
      relations: ['project', 'assignedTo'],
    });
  }

  async getOverdueTasks(): Promise<Task[]> {
    const tasks = await this.tasksRepository.find({
      where: { status: TaskStatus.IN_PROGRESS },
      relations: ['project', 'assignedTo'],
    });

    return tasks.filter(task => task.isOverdue);
  }

  async getHighPriorityTasks(): Promise<Task[]> {
    return this.tasksRepository.find({
      where: { priority: TaskPriority.HIGH },
      relations: ['project', 'assignedTo'],
    });
  }

  async updateTaskStatus(id: number, status: TaskStatus): Promise<Task> {
    const task = await this.findOne(id);
    task.status = status;
    
    if (status === TaskStatus.COMPLETED) {
      task.progress = 100;
    }
    
    return this.tasksRepository.save(task);
  }

  async updateTaskProgress(id: number, progress: number): Promise<Task> {
    const task = await this.findOne(id);
    task.progress = Math.max(0, Math.min(100, progress));
    
    if (task.progress === 100) {
      task.status = TaskStatus.COMPLETED;
    }
    
    return this.tasksRepository.save(task);
  }

  async assignTask(id: number, userId: number): Promise<Task> {
    const task = await this.findOne(id);
    task.assignedToId = userId;
    return this.tasksRepository.save(task);
  }

  async getTaskStats(): Promise<any> {
    const totalTasks = await this.tasksRepository.count();
    const pendingTasks = await this.tasksRepository.count({
      where: { status: TaskStatus.PENDING },
    });
    const inProgressTasks = await this.tasksRepository.count({
      where: { status: TaskStatus.IN_PROGRESS },
    });
    const completedTasks = await this.tasksRepository.count({
      where: { status: TaskStatus.COMPLETED },
    });
    const overdueTasks = await this.tasksRepository.count({
      where: { status: TaskStatus.IN_PROGRESS },
    });

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      total: totalTasks,
      pending: pendingTasks,
      inProgress: inProgressTasks,
      completed: completedTasks,
      overdue: overdueTasks,
      completionRate: Math.round(completionRate * 100) / 100,
    };
  }
}