import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ContentManagementAboutService } from './content-management-about.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/guard/admin.guard';
import { CreateAboutDto } from './dto/request.content-management-about.dto';

@Controller('content-management-about')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class ContentManagementAboutController {
  constructor(private readonly contentManagementAboutService: ContentManagementAboutService) { }

  @Post('create')
  @ApiOperation({ summary: 'Create About Section (one-time)' })
  @ApiResponse({ status: 201, description: 'About section created successfully' })
  @ApiResponse({ status: 400, description: 'About section already exists' })
  async create(@Body() dto: CreateAboutDto) {
    const result = await this.contentManagementAboutService.createAbout(dto);

    return {
      success: true,
      message: "Content Management About Creadted Successfully",
      data: result
    }

  }

  @Get('retrived')
  @ApiOperation({ summary: 'Get About Section data' })
  @ApiResponse({ status: 200, description: 'About section fetched successfully' })
  async get() {
    const result = await this.contentManagementAboutService.getAbout();

    return {
      success: true,
      message: "Content Management About Retrived Successfully",
      data: result
    }

  }

  @Patch("update")
  @ApiOperation({ summary: 'Update About Section' })
  @ApiResponse({ status: 200, description: 'About section updated successfully' })
  async update(@Body() dto: CreateAboutDto) {
    const result = await this.contentManagementAboutService.updateAbout(dto);
    return {
      success: true,
      message: "Content Management About Update Successfully",
      data: result
    }

  }


}
