import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/user.request.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post("signup")
  @HttpCode(HttpStatus.CREATED)
  async signUpUser(@Body() dto: SignUpDto) {
    return {
      success: true,
      message: `Hay, ${dto.name} wellcome our inkleinventor family!`,
      data: dto
    }
  }


}
