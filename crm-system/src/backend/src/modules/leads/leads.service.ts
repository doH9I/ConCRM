import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Lead, LeadStatus, LeadSource } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
  ) {}

  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    const lead = this.leadsRepository.create(createLeadDto);
    return this.leadsRepository.save(lead);
  }

  async findAll(): Promise<Lead[]> {
    return this.leadsRepository.find({
      relations: ['assignedTo'],
    });
  }

  async findOne(id: number): Promise<Lead> {
    const lead = await this.leadsRepository.findOne({
      where: { id },
      relations: ['assignedTo'],
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return lead;
  }

  async update(id: number, updateLeadDto: UpdateLeadDto): Promise<Lead> {
    const lead = await this.findOne(id);
    Object.assign(lead, updateLeadDto);
    return this.leadsRepository.save(lead);
  }

  async remove(id: number): Promise<void> {
    const lead = await this.findOne(id);
    await this.leadsRepository.remove(lead);
  }

  async findByStatus(status: LeadStatus): Promise<Lead[]> {
    return this.leadsRepository.find({
      where: { status },
      relations: ['assignedTo'],
    });
  }

  async findBySource(source: LeadSource): Promise<Lead[]> {
    return this.leadsRepository.find({
      where: { source },
      relations: ['assignedTo'],
    });
  }

  async findByAssignedUser(userId: number): Promise<Lead[]> {
    return this.leadsRepository.find({
      where: { assignedToId: userId },
      relations: ['assignedTo'],
    });
  }

  async searchLeads(query: string): Promise<Lead[]> {
    return this.leadsRepository
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.assignedTo', 'assignedTo')
      .where('lead.firstName ILIKE :query', { query: `%${query}%` })
      .orWhere('lead.lastName ILIKE :query', { query: `%${query}%` })
      .orWhere('lead.company ILIKE :query', { query: `%${query}%` })
      .orWhere('lead.email ILIKE :query', { query: `%${query}%` })
      .getMany();
  }

  async getActiveLeads(): Promise<Lead[]> {
    return this.leadsRepository.find({
      where: { status: LeadStatus.NEW },
      relations: ['assignedTo'],
    });
  }

  async getQualifiedLeads(): Promise<Lead[]> {
    const qualifiedStatuses = [
      LeadStatus.QUALIFIED,
      LeadStatus.PROPOSAL,
      LeadStatus.NEGOTIATION,
    ];
    
    return this.leadsRepository.find({
      where: { status: qualifiedStatuses },
      relations: ['assignedTo'],
    });
  }

  async getClosedLeads(): Promise<Lead[]> {
    const closedStatuses = [LeadStatus.CLOSED_WON, LeadStatus.CLOSED_LOST];
    
    return this.leadsRepository.find({
      where: { closedStatuses },
      relations: ['assignedTo'],
    });
  }

  async updateLeadStatus(id: number, status: LeadStatus): Promise<Lead> {
    const lead = await this.findOne(id);
    lead.status = status;
    return this.leadsRepository.save(lead);
  }

  async assignLead(id: number, userId: number): Promise<Lead> {
    const lead = await this.findOne(id);
    lead.assignedToId = userId;
    return this.leadsRepository.save(lead);
  }

  async getLeadStats(): Promise<any> {
    const totalLeads = await this.leadsRepository.count();
    const newLeads = await this.leadsRepository.count({
      where: { status: LeadStatus.NEW },
    });
    const qualifiedLeads = await this.leadsRepository.count({
      where: { status: LeadStatus.QUALIFIED },
    });
    const wonLeads = await this.leadsRepository.count({
      where: { status: LeadStatus.CLOSED_WON },
    });
    const lostLeads = await this.leadsRepository.count({
      where: { status: LeadStatus.CLOSED_LOST },
    });

    const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

    return {
      total: totalLeads,
      new: newLeads,
      qualified: qualifiedLeads,
      won: wonLeads,
      lost: lostLeads,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  }
}