import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { User } from '../users/entities/user.entity';
import { Company } from '../companies/entities/company.entity';
import { Project } from '../projects/entities/project.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Task } from '../tasks/entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Company, Project, Lead, Task])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}