import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ContentManagementService } from './content-management.service';
import { CreateHeroDto } from './dto/content.management.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/guard/admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';

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
  async create(@Body() dto: CreateHeroDto) {
    const data = await this.contentManagementService.createHero(dto);
    return {
      success: true,
      message: "Hero Created Successfully",
      data: data
    }
  }

  // GET
  @Get("get-hero")
  @ApiOperation({ summary: 'Get Hero Section data' })
  @ApiResponse({ status: 200, description: 'Hero section fetched successfully' })
  async get() {
    const data = await this.contentManagementService.getHero();
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
  async update(@Body() dto: CreateHeroDto) {
    const data = await this.contentManagementService.updateHero(dto);
    return {
      success: true,
      message: "Hero Update Successfully",
      data: data
    }
  }

  @Post('upload-media')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update Hero Media' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        profile: {
          type: 'string',
          format: 'binary',
          description: 'Hero Media Update',
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
  async uploadMedia(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new HttpException('Image is required', 400);
    }

    const result = await this.contentManagementService.mediaUpload(file);

    return {
      success: true,
      message: 'Media Upload Successfully',
      data: result,
    };
  }
}
