import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from "@nestjs/config"
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JobModule } from './job/job.module';
import { CloudinaryProvider } from './config/CloudinaryProvider';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { StripeModule } from './stripe/stripe.module';
import { PaymentModule } from './payment/payment.module';
import { BidModule } from './bid/bid.module';
import { UserModule } from './user/user.module';
import { MessageModule } from './message/message.module';
import { ReviewModule } from './review/review.module';
import { NotificationModule } from './notification/notification.module';
import { RecentActivityModule } from './recent-activity/recent-activity.module';
import { ContentManagementModule } from './content-management/content-management.module';
import { ContentManagementAboutModule } from './content-management-about/content-management-about.module';
import { ContentManagementProcessStepModule } from './content-management-process-step/content-management-process-step.module';
import { HowItsForContentManagementModule } from './how-its-for-content-management/how-its-for-content-management.module';
import { FaqModule } from './faq/faq.module';
import { ProtfolioModule } from './protfolio/protfolio.module';
import { MailModule } from './mail/mail.module';
import { ContactUserModule } from './contact-user/contact-user.module';

@Module({
  imports: [PrismaModule, ConfigModule.forRoot({
    isGlobal: true
  }), AuthModule, JobModule, CloudinaryModule, StripeModule, PaymentModule, BidModule, UserModule, MessageModule, ReviewModule, NotificationModule, RecentActivityModule, ContentManagementModule, ContentManagementAboutModule, ContentManagementProcessStepModule, HowItsForContentManagementModule, FaqModule, ProtfolioModule, MailModule, ContactUserModule],
  controllers: [AppController],
  providers: [AppService, CloudinaryProvider],
  exports: ["CLOUDINARY"]
})
export class AppModule { }
