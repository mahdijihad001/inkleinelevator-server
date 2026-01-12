import { Body, Controller, HttpCode, HttpStatus, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto/user.request.dto';
import { IUser } from './type/SignUpType';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'User registration' })
  @ApiBody({ type: SignUpDto })
  async signUp(@Body() signUpDto: SignUpDto) {

    const result = await this.authService.signUp(signUpDto);

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

}
