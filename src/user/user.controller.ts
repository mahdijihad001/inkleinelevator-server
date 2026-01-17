import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/guard/admin.guard';
import { UpdateUserProfileDto, UpdateUserVerifiedStatusDto } from './dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get("all-user-by-admin")
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (Admin only) with optional role filter and search' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'userType', required: false, enum: ['USER', 'ELEVATOR', 'ADMIN'] })
  @ApiQuery({ name: 'searchTerm', required: false, example: 'John' })
  async getAllUsers(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('userType') userType?: 'USER' | 'ELEVATOR' | 'ADMIN',
    @Query('searchTerm') searchTerm?: string,
  ) {
    const result = await this.userService.getAllUserByAdmin(page, limit, userType, searchTerm);

    return {
      success: true,
      message: "All user Retrived successfully",
      data: result
    }
  }

  @Delete("delete-user/:userId")
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Delete User (Only Admin Cand Do This)"
  })
  async deleteUser(@Param("userId") userId: string) {
    const result = await this.userService.deleteUser(userId);
    return {
      success: true,
      message: result
    }
  }

  @Patch("verify-status/:userId")
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Update user verification status (Admin only)",
  })
  @ApiParam({
    name: "userId",
    type: String,
    required: true,
  })
  async updateUserVerifiedStatus(
    @Param("userId") userId: string,
    @Body() body: UpdateUserVerifiedStatusDto,
  ) {
    const result = await this.userService.updateUserVerifidStatusByAdmin(
      userId,
      body.statusType,
    );

    return {
      success: true,
      message: "User verification status updated successfully",
      data: result,
    };
  }


  @Patch(":userId/update-profile")
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Update user profile (only provided fields will be updated Only Can Admin)",
  })
  async updateUserProfile(
    @Param("userId") userId: string,
    @Body() body: UpdateUserProfileDto,
  ) {
    const result = await this.userService.updateUserProfile(userId, body);

    return {
      success: true,
      message: "User profile updated successfully",
      data: result,
    };
  }
  @Patch("update-profile")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Update user profile (only provided fields will be updated Only Can Owner Profile)",
  })
  async ownProfileUpdate(
    @Body() body: UpdateUserProfileDto,
    @Req() req: any
  ) {

    const userId = req.user.userId

    const result = await this.userService.updateUserProfile(userId, body);

    return {
      success: true,
      message: "User profile updated successfully",
      data: result,
    };
  }

}
