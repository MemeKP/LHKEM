import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailType } from './email.interface';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  constructor(private readonly mailerService: MailerService) { }

  async sendNotification(dto: SendEmailDto) {
    const { recipients, type, payload } = dto;
    
    const mailConfig = this.getMailConfig(type);

    if (!mailConfig) {
      this.logger.error(`Email type ${type} is not supported`);
      throw new Error('Email type not supported');
    }

    const promises = recipients.map((email) => 
      this.mailerService.sendMail({
        to: email,
        subject: mailConfig.subject,
        template: `./${mailConfig.template}`, 
        context: payload,
      })
    );

    try {
      await Promise.all(promises);
      this.logger.log(`Sent ${type} email to ${recipients.length} recipients`);
      return { success: true, count: recipients.length };
    } catch (error) {
      this.logger.error('Failed to send email', error);
      throw error;
    }
  }
  private getMailConfig(type: EmailType) {
    switch (type) {
      case EmailType.WORKSHOP_REGISTERED:
        return { subject: 'ยืนยันการลงทะเบียน Workshop', template: 'workshop-registered' };
      case EmailType.WORKSHOP_CANCELLED:
        return { subject: 'แจ้งเตือน: Workshop ถูกยกเลิก', template: 'workshop-cancelled' };
      case EmailType.WORKSHOP_ANNOUNCEMENT:
        return { subject: 'ข่าวสารจากชุมชน LHKEM', template: 'community-announcement' };
      default:
        return null;
    }
  }
}