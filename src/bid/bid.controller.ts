import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { BidService } from './bid.service';
import { acceptJobBid, createBid } from './dto/bid.request.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AdminGuard } from 'src/guard/admin.guard';
import { UserGuard } from 'src/guard/user.guard';

@Controller('bid')
export class BidController {
  constructor(private readonly bidService: BidService) { }

  @UseGuards(AuthGuard("jwt"))
  @Post("bid-jobs")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Bid Elevator One Jobs"
  })
  async bidJobs(@Body() dto: createBid, @Req() req: any) {

    const userId = req.user.userId;

    const data = {
      userId,
      ...dto
    }

    const result = await this.bidService.createBid(data);

    return {
      success: true,
      message: "Job Bidded Successfully",
      data: result
    }
  }

  @Post("accept-bid")
  @UseGuards(AuthGuard("jwt"), UserGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Accept Job Bid Only Can USER"
  })
  async acceptJobBid(@Body() dto: acceptJobBid, @Req() req: any) {
    const userId = req.user.userId;

    const result = await this.bidService.acceptBid(userId, dto.jobId, dto.bidId);

    return {
      success: true,
      message: "Job Bid Accepted Success",
      data: result
    }
  }
  @Post("declined-bid")
  @UseGuards(AuthGuard("jwt"), UserGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Decline Job Bid Only Can USER"
  })
  async declineBid(@Body() dto: acceptJobBid, @Req() req: any) {
    const userId = req.user.userId;

    const result = await this.bidService.declinedBid(userId, dto.jobId, dto.bidId);

    return {
      success: true,
      message: "Bid Declined",
      data: result
    }
  }


  @Get('get-all-bid-by-admin')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all bids (Admin)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records per page',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'searchTerm',
    required: false,
    description: 'Search term to filter bids by various fields',
    type: String,
    example: 'developer',
  })
  async getAllBidByAdmin(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('searchTerm') searchTerm?: string
  ) {

    const result = await this.bidService.getAllBidByAdmin(page, limit, searchTerm);


    return {
      success: true,
      message: 'All bids retrieved successfully',
      data: result,
    };
  };


  @Get("get-single-bid-with-job-details/:bidId")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get single bid with project detaild"
  })
  async getSingleBidWithJobDetails(@Param('bidId') bidId: string) {
    const result = await this.bidService.getSingleBidWithDetails(bidId);

    return {
      success: true,
      message: "Bid retrived successfully",
      data: result
    }

  }



  @Get('my-bids')
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @ApiOperation({
    summary: "get my all bid only can (ELEVATOR)"
  })
  @ApiQuery({
    name: "searchTerm",
    required: false,
    example: ""
  })
  async getMyAllBid(
    @Req() req: any,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('searchTerm') searchTerm: string,
  ) {
    const userId = req.user.userId;

    const result = await this.bidService.getMyAllBid(Number(page) || 1, Number(limit) || 10, searchTerm || '', userId);

    return {
      success: true,
      message: "My All Bid Retrived Successfully",
      data: result
    }

  }




}
