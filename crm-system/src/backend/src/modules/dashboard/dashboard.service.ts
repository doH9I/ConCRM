import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { Company } from '../companies/entities/company.entity';
import { Project } from '../projects/entities/project.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Task } from '../tasks/entities/task.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async getDashboardData() {
    const [
      userStats,
      companyStats,
      projectStats,
      leadStats,
      taskStats,
      recentProjects,
      recentLeads,
      overdueTasks,
    ] = await Promise.all([
      this.getUserStats(),
      this.getCompanyStats(),
      this.getProjectStats(),
      this.getLeadStats(),
      this.getTaskStats(),
      this.getRecentProjects(),
      this.getRecentLeads(),
      this.getOverdueTasks(),
    ]);

    return {
      userStats,
      companyStats,
      projectStats,
      leadStats,
      taskStats,
      recentProjects,
      recentLeads,
      overdueTasks,
      timestamp: new Date().toISOString(),
    };
  }

  async getUserStats() {
    const totalUsers = await this.usersRepository.count();
    const activeUsers = await this.usersRepository.count({
      where: { isActive: true },
    });
    const adminUsers = await this.usersRepository.count({
      where: { role: 'admin' },
    });

    return {
      total: totalUsers,
      active: activeUsers,
      admin: adminUsers,
      inactive: totalUsers - activeUsers,
    };
  }

  async getCompanyStats() {
    const totalCompanies = await this.companiesRepository.count();
    const activeCompanies = await this.companiesRepository.count({
      where: { status: 'Active' },
    });

    return {
      total: totalCompanies,
      active: activeCompanies,
      inactive: totalCompanies - activeCompanies,
    };
  }

  async getProjectStats() {
    const totalProjects = await this.projectsRepository.count();
    const activeProjects = await this.projectsRepository.count({
      where: { status: 'In Progress' },
    });
    const completedProjects = await this.projectsRepository.count({
      where: { status: 'Completed' },
    });
    const onHoldProjects = await this.projectsRepository.count({
      where: { status: 'On Hold' },
    });

    return {
      total: totalProjects,
      active: activeProjects,
      completed: completedProjects,
      onHold: onHoldProjects,
    };
  }

  async getLeadStats() {
    const totalLeads = await this.leadsRepository.count();
    const newLeads = await this.leadsRepository.count({
      where: { status: 'New' },
    });
    const qualifiedLeads = await this.leadsRepository.count({
      where: { status: 'Qualified' },
    });
    const wonLeads = await this.leadsRepository.count({
      where: { status: 'Closed Won' },
    });

    const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

    return {
      total: totalLeads,
      new: newLeads,
      qualified: qualifiedLeads,
      won: wonLeads,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  }

  async getTaskStats() {
    const totalTasks = await this.tasksRepository.count();
    const pendingTasks = await this.tasksRepository.count({
      where: { status: 'Pending' },
    });
    const inProgressTasks = await this.tasksRepository.count({
      where: { status: 'In Progress' },
    });
    const completedTasks = await this.tasksRepository.count({
      where: { status: 'Completed' },
    });

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      total: totalTasks,
      pending: pendingTasks,
      inProgress: inProgressTasks,
      completed: completedTasks,
      completionRate: Math.round(completionRate * 100) / 100,
    };
  }

  async getRecentProjects(limit: number = 5) {
    return this.projectsRepository.find({
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['company', 'manager'],
    });
  }

  async getRecentLeads(limit: number = 5) {
    return this.leadsRepository.find({
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['assignedTo'],
    });
  }

  async getOverdueTasks(limit: number = 10) {
    const tasks = await this.tasksRepository.find({
      where: { status: 'In Progress' },
      relations: ['project', 'assignedTo'],
    });

    const overdueTasks = tasks.filter(task => task.isOverdue);
    return overdueTasks.slice(0, limit);
  }

  async getProjectProgress() {
    const projects = await this.projectsRepository.find({
      where: { status: 'In Progress' },
      select: ['id', 'name', 'progress', 'startDate', 'endDate'],
    });

    return projects.map(project => ({
      id: project.id,
      name: project.name,
      progress: project.progress,
      startDate: project.startDate,
      endDate: project.endDate,
      isOverdue: project.isOverdue,
    }));
  }

  async getLeadPipeline() {
    const leads = await this.leadsRepository.find({
      select: ['id', 'firstName', 'lastName', 'company', 'status', 'value', 'createdAt'],
      relations: ['assignedTo'],
    });

    return leads.map(lead => ({
      id: lead.id,
      name: `${lead.firstName} ${lead.lastName}`,
      company: lead.company,
      status: lead.status,
      value: lead.value,
      assignedTo: lead.assignedTo?.firstName || 'Unassigned',
      createdAt: lead.createdAt,
    }));
  }
}