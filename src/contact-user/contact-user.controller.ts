import { Body, Controller, Post } from '@nestjs/common';
import { ContactUserService } from './contact-user.service';
import { ApiOperation } from '@nestjs/swagger';
import { ContactUsDto } from './dto/contact.user.dto';

@Controller('contact-user')
export class ContactUserController {
  constructor(private readonly contactUserService: ContactUserService) { }

  @Post("contact-us")
  @ApiOperation({
    summary: "Contact us"
  })
  async contuctUs(@Body() dto: ContactUsDto) {
    const result = await this.contactUserService.sendMailToEmail(dto);

    return {
      success: true,
      message: result.message,
      data: result.data
    }

  }

}
