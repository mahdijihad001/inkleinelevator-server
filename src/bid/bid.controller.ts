import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { BidService } from './bid.service';
import { acceptJobBid, createBid } from './dto/bid.request.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { truncate } from 'node:fs/promises';
import { AdminGuard } from 'src/guard/admin.guard';

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


  @UseGuards(AuthGuard("jwt"))
  @Post("accept-bid")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Accept Job Bid"
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
      success : true,
      message : "Bid retrived successfully",
      data : result
    }

  }

}
