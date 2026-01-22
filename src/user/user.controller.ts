import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/guard/admin.guard';
import { UpdateUserProfileDto, UpdateUserVerifiedStatusDto } from './dto/user.dto';
import { UserGuard } from 'src/guard/user.guard';
import { ElevatorGuard } from 'src/guard/elevator.guard';

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
      message: "User Deleted Successfully",
      data: result
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

  @Get("get-my-all-active-jobs")
  @UseGuards(AuthGuard("jwt"), UserGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "My all active job (USER)"
  })
  async getMyAllActiveJobs(@Req() req: any) {
    const userId = req.user.userId;

    const result = await this.userService.activeJobs(userId);

    return {
      success: true,
      message: "Al Active Jobs Retrived Successfully",
      data: result
    }

  }
  @Get("get-my-all-recent-activity")
  @UseGuards(AuthGuard("jwt"), UserGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "My all recent activity"
  })
  async recentActivity(@Req() req: any) {
    const userId = req.user.userId;

    const result = await this.userService.rcentActivity(userId);

    return {
      success: true,
      message: "Recent Activity Retrived Successfully",
      data: result
    }

  }

  @Get("get-elevator-all-active-jobs")
  @UseGuards(AuthGuard("jwt"), ElevatorGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Elevator All Active Jobs Only Can (ELEVATOR)"
  })
  async elevetorAllActiveJobs(@Req() req: any) {
    const userId = req.user.userId;

    const result = await this.userService.elevetorAllActiveJobs(userId);

    return {
      success: true,
      message: "All Active Jobs Retrived Successfully",
      data: result
    }
  }


  @Get("get-elevator-all-recent-bid")
  @UseGuards(AuthGuard("jwt"), ElevatorGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Elevator All Recent Bid Only Can (ELEVATOR)"
  })
  async elevetorAllRecentBid(@Req() req: any) {
    const userId = req.user.userId;

    const result = await this.userService.myAllRecentBid(userId);

    return {
      success: true,
      message: "Recent Bid Retrived Successfully",
      data: result
    }
  };

  @Delete("/ownProfileDelete")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @ApiOperation({
    summary: "User Own Profile Delete"
  })
  async userOwnProfileDelete(@Req() req: any) {
    const userId = req.user.userId;

    const result = await this.userService.deleteUser(userId);

    return {
      success: true,
      message: "User Profile Delete Successfully",
      data: result
    }

  }


  @Get("userDashboardAnalytics")
  @UseGuards(AuthGuard("jwt"), UserGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "User Dashboard Analytics (Only Can USER)"
  })
  async userDashboardAnalytics(@Req() req: any) {
    const userId = req.user.userId;

    const result = await this.userService.userDashboardAnalytics(userId);

    return {
      success: true,
      message: "User Dashboard Analytics Retrived Successfully",
      data: result
    }
  };


  @Get("getAllRecentActivity")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get All Recent Activity (Only Can USER & ELEVATOR)"
  })
  async getAllRecentActivity(@Req() req: any) {
    const userId = req.user.userId;

    const result = await this.userService.getUserAndElevetorActivity(userId)

    return {
      success: true,
      message: "Recent Activity Retrived Successfully",
      data: result

    }

  };


  @Get('dashboardAnalytics')
  @UseGuards(AuthGuard('jwt'), ElevatorGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Elevator Dashboard Analytics (Only for ELEVATOR role)' })
  @HttpCode(HttpStatus.OK)
  async elevatorDashboardAnalytics(@Req() req: any) {
    const userId = req.user.userId;

    const result = await this.userService.elevetorDashboardAnalytics(userId);

    return {
      success: true,
      message: 'Elevator Dashboard Analytics Retrieved Successfully',
      data: result,
    };
  }

  @Get("get-recent-activity-form-admin")
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "All Recent Activity Only Can Access Admin"
  })
  @HttpCode(HttpStatus.OK)
  async getAllRecentActivityOnlyCanAdmin() {
    const result = await this.userService.getAllRecentActivityForAdmin();

    return {
      success: true,
      message: "Recent Activity Retrived Successfully",
      data: result
    }
  };

  @Get("get-all-admin-analytics")
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "All Admin Analytics Only For Admin"
  })
  @HttpCode(HttpStatus.OK)
  async getAllAdminAnalytics() {
    const result = await this.userService.getAllAdminDashboardAnalytics();

    return {
      success: true,
      message: "Admin Analytics Retrived Successfully",
      data: result
    }

  }


  @Get("constructor-approval-short-list")
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "All Constructor Approval Short List Only For Admin"
  })
  @HttpCode(HttpStatus.OK)
  async constructorApprovalShortList() {
    const result = await this.userService.shortConstructorListForApproval();

    return {
      success: true,
      message: "Constructor Approval Short List Retrived Successfully",
      data: result
    }

  }

}
