import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChangePassword, ChangePasswordDto, ForgotPasswordDto, SignInDto, SignUpDto, UserSignUpDto, verifyOtp } from './dto/user.request.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }



  @Post('signup/user')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'User Registration' })
  async signUpUser(@Body() dto: UserSignUpDto) {

    const result = await this.authService.signUpUser(dto);

    return {
      success: true,
      message: 'User Registration Success',
      data: result,
    };
  }

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
  @Get("getMe")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get user own profile"
  })
  async getMe1(@Req() req: any) {
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



  @Post('upload-profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload / Update user profile image' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        profile: {
          type: 'string',
          format: 'binary',
          description: 'User profile image',
        },
      },
      required: ['profile'],
    },
  })
  @UseInterceptors(
    FileInterceptor('profile', {
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }),
  )
  async uploadProfile(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new HttpException('Profile image is required', 400);
    }

    const userId = req.user.userId;

    const result = await this.authService.uploadProfile(userId, file);

    return {
      success: true,
      message: 'Profile updated successfully',
      data: result,
    };
  };


  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change user password' })
  async changePassword(
    @Req() req: any,
    @Body() dto: ChangePasswordDto,
  ) {
    const userId = req.user.userId;

    if (!dto.oldPassword || !dto.newPassword) {
      throw new HttpException(
        'Old password and new password are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.authService.changePassword(userId, dto);

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }


  @Post("sent-otp")
  @ApiOperation({
    summary: "Send Otp In User Email"
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const result = await this.authService.sendOtpInUserEmail(dto.email);

    return {
      success: true,
      message: "Sent code your email",
      data: result
    }
  }

  @Post("verify-otp")
  @ApiOperation({
    summary: "Otp Verifid"
  })
  async otpVerify(@Body() dto: verifyOtp) {
    const result = await this.authService.verifyOtp(dto.email, dto.otp);

    return {
      success: true,
      message: result.message,
      token: result.token
    }
  }


  @Post("reset-password")
  @ApiOperation({
    summary: "Reset Password After otp verify"
  })
  async resetPassword(@Body() dto: ChangePassword) {
    return this.authService.resetPassword(dto.token, dto.password);
  }


}
