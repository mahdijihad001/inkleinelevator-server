import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ContentManagementProcessStepService } from './content-management-process-step.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/guard/admin.guard';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CreateHowItWorksDto, CreateHowItWorksStepDto } from './dto/content-management-process-step.dto';

@Controller('content-management-process-step')
@UseGuards(AuthGuard("jwt"), AdminGuard)
@ApiBearerAuth()
export class ContentManagementProcessStepController {
  constructor(private readonly contentManagementProcessStepService: ContentManagementProcessStepService) { }

  // SECTION
  @Post('section-create')
  @ApiOperation({ summary: 'Create How It Works section (one-time)' })
  async createSection(@Body() dto: CreateHowItWorksDto) {
    const result = await this.contentManagementProcessStepService.createSection(dto);
    return {
      success: true,
      message: "Section Created Successfully",
      data: result
    }
  }

  @Get("section-retrived")
  @ApiOperation({ summary: 'Get How It Works section with steps' })
  async getSection() {
    const result = await this.contentManagementProcessStepService.getSection();
    return {
      success: true,
      message: "Section Retrived Successfully",
      data: result
    }
  }

  @Patch("section-update")
  @ApiOperation({ summary: 'Update How It Works section' })
  async updateSection(@Body() dto: CreateHowItWorksDto) {
    const result = await this.contentManagementProcessStepService.updateSection(dto);
    return {
      success: true,
      message: "Section Updated Successfully",
      data: result
    }

  }

  // STEPS
  @Post('step')
  @ApiOperation({ summary: 'Add a step' })
  async addStep(@Body() dto: CreateHowItWorksStepDto) {
    const result = await this.contentManagementProcessStepService.addStep(dto);

    return {
      success: true,
      message: "Section Step Added Successfully",
      data: result
    }

  }

  @Patch('step/:id')
  @ApiOperation({ summary: 'Update a step' })
  async updateStep(@Param('id') id: string, @Body() dto: CreateHowItWorksStepDto) {
    const result = await this.contentManagementProcessStepService.updateStep(id, dto);
    return {
      success: true,
      message: "Section Retrived Successfully",
      data: result
    }
  }

  @Delete('step/:id')
  @ApiOperation({ summary: 'Delete a step' })
  async deleteStep(@Param('id') id: string) {
    const data = await this.contentManagementProcessStepService.deleteStep(id);
    return {
      success: true,
      message: "Step Deleted Success",
      data: data
    }
  }

}
