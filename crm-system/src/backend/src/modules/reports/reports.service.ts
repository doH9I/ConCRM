import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { Company } from '../companies/entities/company.entity';
import { Project } from '../projects/entities/project.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Task } from '../tasks/entities/task.entity';

@Injectable()
export class ReportsService {
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

  async generateSalesReport(startDate: Date, endDate: Date) {
    const leads = await this.leadsRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['assignedTo'],
    });

    const totalLeads = leads.length;
    const wonLeads = leads.filter(lead => lead.status === 'Closed Won');
    const totalValue = wonLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);
    const conversionRate = totalLeads > 0 ? (wonLeads.length / totalLeads) * 100 : 0;

    const salesByUser = await this.leadsRepository
      .createQueryBuilder('lead')
      .select('user.firstName', 'firstName')
      .addSelect('user.lastName', 'lastName')
      .addSelect('COUNT(lead.id)', 'totalLeads')
      .addSelect('COUNT(CASE WHEN lead.status = :wonStatus THEN 1 END)', 'wonLeads')
      .addSelect('SUM(CASE WHEN lead.status = :wonStatus THEN lead.value ELSE 0 END)', 'totalValue')
      .leftJoin('lead.assignedTo', 'user')
      .where('lead.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('lead.assignedToId IS NOT NULL')
      .setParameter('wonStatus', 'Closed Won')
      .groupBy('user.id, user.firstName, user.lastName')
      .getRawMany();

    return {
      period: { startDate, endDate },
      summary: {
        totalLeads,
        wonLeads: wonLeads.length,
        totalValue,
        conversionRate: Math.round(conversionRate * 100) / 100,
      },
      salesByUser,
    };
  }

  async generateProjectReport(startDate: Date, endDate: Date) {
    const projects = await this.projectsRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['company', 'manager'],
    });

    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'In Progress');
    const completedProjects = projects.filter(p => p.status === 'Completed');
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalActualCost = projects.reduce((sum, p) => sum + (p.actualCost || 0), 0);

    const projectsByStatus = await this.projectsRepository
      .createQueryBuilder('project')
      .select('project.status', 'status')
      .addSelect('COUNT(project.id)', 'count')
      .addSelect('SUM(project.budget)', 'totalBudget')
      .addSelect('SUM(project.actualCost)', 'totalActualCost')
      .where('project.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('project.status')
      .getRawMany();

    const projectsByCompany = await this.projectsRepository
      .createQueryBuilder('project')
      .select('company.name', 'companyName')
      .addSelect('COUNT(project.id)', 'projectCount')
      .addSelect('SUM(project.budget)', 'totalBudget')
      .leftJoin('project.company', 'company')
      .where('project.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('company.id, company.name')
      .getRawMany();

    return {
      period: { startDate, endDate },
      summary: {
        totalProjects,
        activeProjects: activeProjects.length,
        completedProjects: completedProjects.length,
        totalBudget,
        totalActualCost,
        budgetVariance: totalBudget - totalActualCost,
      },
      projectsByStatus,
      projectsByCompany,
    };
  }

  async generateTaskReport(startDate: Date, endDate: Date) {
    const tasks = await this.tasksRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['project', 'assignedTo'],
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed');
    const overdueTasks = tasks.filter(t => t.isOverdue);
    const totalEstimatedHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    const totalActualHours = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);

    const tasksByStatus = await this.tasksRepository
      .createQueryBuilder('task')
      .select('task.status', 'status')
      .addSelect('COUNT(task.id)', 'count')
      .addSelect('SUM(task.estimatedHours)', 'totalEstimatedHours')
      .addSelect('SUM(task.actualHours)', 'totalActualHours')
      .where('task.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('task.status')
      .getRawMany();

    const tasksByUser = await this.tasksRepository
      .createQueryBuilder('task')
      .select('user.firstName', 'firstName')
      .addSelect('user.lastName', 'lastName')
      .addSelect('COUNT(task.id)', 'totalTasks')
      .addSelect('COUNT(CASE WHEN task.status = :completedStatus THEN 1 END)', 'completedTasks')
      .addSelect('SUM(task.estimatedHours)', 'totalEstimatedHours')
      .addSelect('SUM(task.actualHours)', 'totalActualHours')
      .leftJoin('task.assignedTo', 'user')
      .where('task.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('task.assignedToId IS NOT NULL')
      .setParameter('completedStatus', 'Completed')
      .groupBy('user.id, user.firstName, user.lastName')
      .getRawMany();

    return {
      period: { startDate, endDate },
      summary: {
        totalTasks,
        completedTasks: completedTasks.length,
        overdueTasks: overdueTasks.length,
        totalEstimatedHours,
        totalActualHours,
        completionRate: totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0,
      },
      tasksByStatus,
      tasksByUser,
    };
  }

  async generateUserPerformanceReport(startDate: Date, endDate: Date) {
    const users = await this.usersRepository.find({
      where: { isActive: true },
    });

    const userPerformance = await Promise.all(
      users.map(async (user) => {
        const [assignedLeads, assignedTasks, completedTasks] = await Promise.all([
          this.leadsRepository.count({
            where: {
              assignedToId: user.id,
              createdAt: Between(startDate, endDate),
            },
          }),
          this.tasksRepository.count({
            where: {
              assignedToId: user.id,
              createdAt: Between(startDate, endDate),
            },
          }),
          this.tasksRepository.count({
            where: {
              assignedToId: user.id,
              status: 'Completed',
              updatedAt: Between(startDate, endDate),
            },
          }),
        ]);

        const wonLeads = await this.leadsRepository.count({
          where: {
            assignedToId: user.id,
            status: 'Closed Won',
            updatedAt: Between(startDate, endDate),
          },
        });

        const leadValue = await this.leadsRepository
          .createQueryBuilder('lead')
          .select('SUM(lead.value)', 'totalValue')
          .where('lead.assignedToId = :userId', { userId: user.id })
          .andWhere('lead.status = :wonStatus', { wonStatus: 'Closed Won' })
          .andWhere('lead.updatedAt BETWEEN :startDate AND :endDate', { startDate, endDate })
          .getRawOne();

        return {
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          department: user.department,
          assignedLeads,
          wonLeads,
          leadValue: parseFloat(leadValue?.totalValue || '0'),
          assignedTasks,
          completedTasks,
          taskCompletionRate: assignedTasks > 0 ? (completedTasks / assignedTasks) * 100 : 0,
        };
      }),
    );

    return {
      period: { startDate, endDate },
      userPerformance,
    };
  }

  async generateCompanyReport(startDate: Date, endDate: Date) {
    const companies = await this.companiesRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['projects'],
    });

    const totalCompanies = companies.length;
    const activeCompanies = companies.filter(c => c.status === 'Active');
    const totalProjects = companies.reduce((sum, c) => sum + c.projects.length, 0);

    const companiesByIndustry = await this.companiesRepository
      .createQueryBuilder('company')
      .select('company.industry', 'industry')
      .addSelect('COUNT(company.id)', 'count')
      .addSelect('COUNT(project.id)', 'projectCount')
      .leftJoin('company.projects', 'project')
      .where('company.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('company.industry')
      .getRawMany();

    const topCompanies = await this.companiesRepository
      .createQueryBuilder('company')
      .select('company.name', 'name')
      .addSelect('company.industry', 'industry')
      .addSelect('COUNT(project.id)', 'projectCount')
      .leftJoin('company.projects', 'project')
      .where('company.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('company.id, company.name, company.industry')
      .orderBy('projectCount', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      period: { startDate, endDate },
      summary: {
        totalCompanies,
        activeCompanies: activeCompanies.length,
        totalProjects,
      },
      companiesByIndustry,
      topCompanies,
    };
  }
}