import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('test/email')
  @ApiOperation({ summary: 'Test email notification' })
  @ApiResponse({ status: 200, description: 'Email notification sent successfully' })
  async testEmail(@Body() body: { to: string; subject: string; content: string }) {
    const result = await this.notificationsService.sendEmail(body.to, body.subject, body.content);
    return { success: result, message: result ? 'Email sent successfully' : 'Failed to send email' };
  }

  @Post('test/sms')
  @ApiOperation({ summary: 'Test SMS notification' })
  @ApiResponse({ status: 200, description: 'SMS notification sent successfully' })
  async testSMS(@Body() body: { to: string; message: string }) {
    const result = await this.notificationsService.sendSMS(body.to, body.message);
    return { success: result, message: result ? 'SMS sent successfully' : 'Failed to send SMS' };
  }

  @Post('test/telegram')
  @ApiOperation({ summary: 'Test Telegram notification' })
  @ApiResponse({ status: 200, description: 'Telegram notification sent successfully' })
  async testTelegram(@Body() body: { chatId: string; message: string }) {
    const result = await this.notificationsService.sendTelegramNotification(body.chatId, body.message);
    return { success: result, message: result ? 'Telegram notification sent successfully' : 'Failed to send Telegram notification' };
  }

  @Post('test/slack')
  @ApiOperation({ summary: 'Test Slack notification' })
  @ApiResponse({ status: 200, description: 'Slack notification sent successfully' })
  async testSlack(@Body() body: { webhookUrl: string; message: string }) {
    const result = await this.notificationsService.sendSlackNotification(body.webhookUrl, body.message);
    return { success: result, message: result ? 'Slack notification sent successfully' : 'Failed to send Slack notification' };
  }

  @Post('test/discord')
  @ApiOperation({ summary: 'Test Discord notification' })
  @ApiResponse({ status: 200, description: 'Discord notification sent successfully' })
  async testDiscord(@Body() body: { webhookUrl: string; message: string }) {
    const result = await this.notificationsService.sendDiscordNotification(body.webhookUrl, body.message);
    return { success: result, message: result ? 'Discord notification sent successfully' : 'Failed to send Discord notification' };
  }

  @Post('system-alert')
  @ApiOperation({ summary: 'Send system alert notification' })
  @ApiResponse({ status: 200, description: 'System alert sent successfully' })
  async sendSystemAlert(@Body() body: { level: 'info' | 'warning' | 'error' | 'critical'; message: string }) {
    await this.notificationsService.sendSystemAlert(body.level, body.message);
    return { success: true, message: 'System alert sent successfully' };
  }

  @Post('lead-notification')
  @ApiOperation({ summary: 'Send lead notification' })
  @ApiResponse({ status: 200, description: 'Lead notification sent successfully' })
  async sendLeadNotification(@Body() leadData: any) {
    await this.notificationsService.sendLeadNotification(leadData);
    return { success: true, message: 'Lead notification sent successfully' };
  }

  @Post('project-update')
  @ApiOperation({ summary: 'Send project update notification' })
  @ApiResponse({ status: 200, description: 'Project update notification sent successfully' })
  async sendProjectUpdateNotification(@Body() projectData: any) {
    await this.notificationsService.sendProjectUpdateNotification(projectData);
    return { success: true, message: 'Project update notification sent successfully' };
  }

  @Post('task-overdue')
  @ApiOperation({ summary: 'Send task overdue notification' })
  @ApiResponse({ status: 200, description: 'Task overdue notification sent successfully' })
  async sendTaskOverdueNotification(@Body() taskData: any) {
    await this.notificationsService.sendTaskOverdueNotification(taskData);
    return { success: true, message: 'Task overdue notification sent successfully' };
  }
}