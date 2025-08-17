import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { User } from '../users/entities/user.entity';
import { Company } from '../companies/entities/company.entity';
import { Project } from '../projects/entities/project.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Task } from '../tasks/entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Company, Project, Lead, Task])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}