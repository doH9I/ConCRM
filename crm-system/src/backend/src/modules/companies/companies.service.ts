import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const company = this.companiesRepository.create(createCompanyDto);
    return this.companiesRepository.save(company);
  }

  async findAll(): Promise<Company[]> {
    return this.companiesRepository.find({
      relations: ['projects'],
    });
  }

  async findOne(id: number): Promise<Company> {
    const company = await this.companiesRepository.findOne({
      where: { id },
      relations: ['projects'],
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }

  async update(id: number, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    const company = await this.findOne(id);
    Object.assign(company, updateCompanyDto);
    return this.companiesRepository.save(company);
  }

  async remove(id: number): Promise<void> {
    const company = await this.findOne(id);
    await this.companiesRepository.remove(company);
  }

  async findByIndustry(industry: string): Promise<Company[]> {
    return this.companiesRepository.find({
      where: { industry },
      relations: ['projects'],
    });
  }

  async findByStatus(status: string): Promise<Company[]> {
    return this.companiesRepository.find({
      where: { status },
      relations: ['projects'],
    });
  }

  async searchCompanies(query: string): Promise<Company[]> {
    return this.companiesRepository
      .createQueryBuilder('company')
      .where('company.name ILIKE :query', { query: `%${query}%` })
      .orWhere('company.industry ILIKE :query', { query: `%${query}%` })
      .orWhere('company.contactPerson ILIKE :query', { query: `%${query}%` })
      .leftJoinAndSelect('company.projects', 'projects')
      .getMany();
  }

  async getActiveCompanies(): Promise<Company[]> {
    return this.companiesRepository.find({
      where: { status: 'Active' },
      relations: ['projects'],
    });
  }

  async getCompanyStats(): Promise<any> {
    const totalCompanies = await this.companiesRepository.count();
    const activeCompanies = await this.companiesRepository.count({
      where: { status: 'Active' },
    });
    const inactiveCompanies = totalCompanies - activeCompanies;

    return {
      total: totalCompanies,
      active: activeCompanies,
      inactive: inactiveCompanies,
    };
  }
}