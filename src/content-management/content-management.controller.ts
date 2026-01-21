import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ContentManagementService } from './content-management.service';
import { CreateHeroDto } from './dto/content.management.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/guard/admin.guard';

@Controller('content-management')
export class ContentManagementController {
  constructor(private readonly contentManagementService: ContentManagementService) { }

  // CREATE (only once)
  @Post("create-hero")
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Hero Section (one-time)' })
  @ApiResponse({ status: 201, description: 'Hero section created successfully' })
  @ApiResponse({ status: 400, description: 'Hero section already exists' })
  create(@Body() dto: CreateHeroDto) {
    const data = this.contentManagementService.createHero(dto);
    return {
      success: true,
      message: "Hero Created Successfully",
      data: data
    }
  }

  // GET
  @Get("get-hero")
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Hero Section data' })
  @ApiResponse({ status: 200, description: 'Hero section fetched successfully' })
  get() {
    const data = this.contentManagementService.getHero();
    return {
      success: true,
      message: "Hero Retrived Successfully",
      data: data
    }
  }

  // UPDATE
  @Patch("update-hero")
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Hero Section' })
  @ApiResponse({ status: 200, description: 'Hero section updated successfully' })
  update(@Body() dto: CreateHeroDto) {
    const data = this.contentManagementService.updateHero(dto);
    return {
      success: true,
      message: "Hero Update Successfully",
      data: data
    }
  }



}
