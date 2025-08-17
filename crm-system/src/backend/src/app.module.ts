import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { PrometheusModule } from '@nestjs/prometheus';
import { ScheduleModule } from '@nestjs/schedule';

// Configuration
import { getTypeOrmConfig } from './config/typeorm.config';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { LeadsModule } from './modules/leads/leads.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportsModule } from './modules/reports/reports.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

// Controllers
import { AppController } from './app.controller';
import { HealthController } from './health.controller';

// Services
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getTypeOrmConfig,
      inject: [ConfigService],
    }),
    
    // Rate limiting
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 100,
    }),
    
    // Health checks
    TerminusModule,
    
    // Prometheus metrics
    PrometheusModule.register(),
    
    // Scheduled tasks
    ScheduleModule.forRoot(),
    
    // Feature modules
    AuthModule,
    UsersModule,
    CompaniesModule,
    ProjectsModule,
    LeadsModule,
    TasksModule,
    DashboardModule,
    ReportsModule,
    NotificationsModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}