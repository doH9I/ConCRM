import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { PrometheusModule } from '@nestjs/prometheus';
import { ScheduleModule } from '@nestjs/schedule';

// Конфигурация
import { getTypeOrmConfig } from './config/typeorm.config';

// Модули
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { LeadsModule } from './modules/leads/leads.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportsModule } from './modules/reports/reports.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

// Контроллеры
import { AppController } from './app.controller';
import { HealthController } from './health.controller';

// Сервисы
import { AppService } from './app.service';

@Module({
  imports: [
    // Конфигурация
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // База данных
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getTypeOrmConfig,
      inject: [ConfigService],
    }),
    
    // Ограничение скорости
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 100,
    }),
    
    // Проверки состояния
    TerminusModule,
    
    // Метрики Prometheus
    PrometheusModule.register(),
    
    // Планировщик задач
    ScheduleModule.forRoot(),
    
    // Функциональные модули
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