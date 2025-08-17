import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Project, ProjectStatus, ProjectPriority } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = this.projectsRepository.create(createProjectDto);
    return this.projectsRepository.save(project);
  }

  async findAll(): Promise<Project[]> {
    return this.projectsRepository.find({
      relations: ['company', 'manager', 'tasks'],
    });
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['company', 'manager', 'tasks'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: number, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const project = await this.findOne(id);
    Object.assign(project, updateProjectDto);
    return this.projectsRepository.save(project);
  }

  async remove(id: number): Promise<void> {
    const project = await this.findOne(id);
    await this.projectsRepository.remove(project);
  }

  async findByStatus(status: ProjectStatus): Promise<Project[]> {
    return this.projectsRepository.find({
      where: { status },
      relations: ['company', 'manager', 'tasks'],
    });
  }

  async findByPriority(priority: ProjectPriority): Promise<Project[]> {
    return this.projectsRepository.find({
      where: { priority },
      relations: ['company', 'manager', 'tasks'],
    });
  }

  async findByCompany(companyId: number): Promise<Project[]> {
    return this.projectsRepository.find({
      where: { companyId },
      relations: ['company', 'manager', 'tasks'],
    });
  }

  async findByManager(managerId: number): Promise<Project[]> {
    return this.projectsRepository.find({
      where: { managerId },
      relations: ['company', 'manager', 'tasks'],
    });
  }

  async searchProjects(query: string): Promise<Project[]> {
    return this.projectsRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.company', 'company')
      .leftJoinAndSelect('project.manager', 'manager')
      .leftJoinAndSelect('project.tasks', 'tasks')
      .where('project.name ILIKE :query', { query: `%${query}%` })
      .orWhere('project.description ILIKE :query', { query: `%${query}%` })
      .orWhere('company.name ILIKE :query', { query: `%${query}%` })
      .getMany();
  }

  async getActiveProjects(): Promise<Project[]> {
    return this.projectsRepository.find({
      where: { status: ProjectStatus.IN_PROGRESS },
      relations: ['company', 'manager', 'tasks'],
    });
  }

  async getOverdueProjects(): Promise<Project[]> {
    const projects = await this.projectsRepository.find({
      where: { status: ProjectStatus.IN_PROGRESS },
      relations: ['company', 'manager', 'tasks'],
    });

    return projects.filter(project => project.isOverdue);
  }

  async updateProgress(id: number, progress: number): Promise<Project> {
    const project = await this.findOne(id);
    project.progress = Math.max(0, Math.min(100, progress));
    
    if (project.progress === 100) {
      project.status = ProjectStatus.COMPLETED;
    }
    
    return this.projectsRepository.save(project);
  }

  async getProjectStats(): Promise<any> {
    const totalProjects = await this.projectsRepository.count();
    const activeProjects = await this.projectsRepository.count({
      where: { status: ProjectStatus.IN_PROGRESS },
    });
    const completedProjects = await this.projectsRepository.count({
      where: { status: ProjectStatus.COMPLETED },
    });
    const onHoldProjects = await this.projectsRepository.count({
      where: { status: ProjectStatus.ON_HOLD },
    });

    return {
      total: totalProjects,
      active: activeProjects,
      completed: completedProjects,
      onHold: onHoldProjects,
    };
  }
}