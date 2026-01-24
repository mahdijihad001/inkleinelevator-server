import { Module } from '@nestjs/common';
import { ContactUserService } from './contact-user.service';
import { ContactUserController } from './contact-user.controller';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [ContactUserController],
  providers: [ContactUserService],
})
export class ContactUserModule { }
