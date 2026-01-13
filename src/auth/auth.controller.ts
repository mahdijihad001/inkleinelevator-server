import { Body, Controller, HttpCode, HttpStatus, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto/user.request.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'User registration' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Mohammad Jihad' },
        email: { type: 'string', example: 'user@gmail.com' },
        phone: { type: 'string', example: '0178221212121' },
        password: { type: 'string', example: '12345678' },
        role: { type: 'string', enum: ['USER', 'ELEVATOR'] },
        companyName: { type: 'string', example: 'ABC Elevator Ltd If You Are Elevator' },

        businessLogo: {
          type: 'string',
          format: 'binary',
        },
        licenseInfo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'businessLogo', maxCount: 1 },
      { name: 'licenseInfo', maxCount: 1 },

    ])
  )
  async signUp(@Body() signUpDto: SignUpDto, @UploadedFiles()
  files: {
    businessLogo?: Express.Multer.File[];
    licenseInfo?: Express.Multer.File[];
  },) {

    const businessLogo = files.businessLogo ?? [];
    const licenseInfo = files.licenseInfo ?? [];

    const result = await this.authService.signUp(signUpDto, { businessLogo, licenseInfo });

    return {
      success: true,
      message: "User Registraction Success",
      data: result
    }
  }

  @Post("signIn")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "User Login"
  })
  async signIn(@Body() dto: SignInDto) {
    const result = await this.authService.signIn(dto);

    return {
      success: true,
      message: "User Login Successfully",
      data: result
    }
  }

  @UseGuards(AuthGuard("jwt"))
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "User Logout"
  })
  async logOutUser(@Req() req: any) {
    await this.authService.logOutUser(req.user.userId);

    return {
      success: true,
      message: "User Logout Success"
    }
  }

  @UseGuards(AuthGuard("rt-jwt"))
  @Post("refreshtoken")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Refresh Token"
  })
  async refreshToken(@Req() req: any) {
    const { userId, refreshToken } = req.user;

    const result = await this.authService.refreshToken(userId, refreshToken);

    return {
      success: true,
      message: "Token Refreshed Success",
      data: result
    }

  }


  @UseGuards(AuthGuard("jwt"))
  @Post("getMe")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get user own profile"
  })
  async getMe(@Req() req: any) {
    const userId = req.user.userId;

    const result = await this.authService.getMe(userId);

    return {
      success: true,
      message: "User Profile Retrived Successfully",
      data: result
    }

  }


  @UseGuards(AuthGuard("jwt"))
  @Post("activeStripeAccount")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Active elevator Stripe Account"
  })
  async activeElevatorStripeAccount(@Req() req: any) {
    const userId = req.user.userId;

    const result = await this.authService.stripeElevatorAccountActive(userId);

    return {
      url: result
    }

  }

}
