import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { HowItsForContentManagementService } from './how-its-for-content-management.service';
import { CreateHowItsForCardDto, CreateHowItsForDto, UpdateHowItsForCardDto, UpdateHowItsForDto } from './dto/how-its-for-content-management.request.dto';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/guard/admin.guard';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';


@Controller('how-its-for-content-management')
export class HowItsForContentManagementController {
  constructor(private readonly howItsForContentManagementService: HowItsForContentManagementService) { }

  @Post('create')
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Only For Admin Can Create"
  })
  async create(@Body() dto: CreateHowItsForDto) {
    return {
      success: true,
      message: 'HowItsFor section created successfully',
      data: await this.howItsForContentManagementService.create(dto),
    };
  }


  @Get("get-how-its-for-section")
  @ApiOperation({
    summary: "Only For Admin Can Create"
  })
  async getSection() {
    return {
      success: true,
      message: "Section Retrived Successfully",
      data: await this.howItsForContentManagementService.getSection()
    }
  };



  @Patch('update')
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Only Admin Can Update"
  })
  async update(@Body() dto: UpdateHowItsForDto) {
    return {
      success: true,
      message: 'HowItsFor section updated successfully',
      data: await this.howItsForContentManagementService.update(dto),
    };
  };


  @Post('card/create')
  async cardCreate(@Body() dto: CreateHowItsForCardDto) {
    return {
      success: true,
      message: 'Card created successfully',
      data: await this.howItsForContentManagementService.createCard(dto),
    };
  }

  @Patch('card/update/:id')
  async cardUpdate(
    @Param('id') audienceId: string,
    @Body() dto: UpdateHowItsForCardDto,
  ) {
    return {
      success: true,
      message: 'Card updated successfully',
      data: await this.howItsForContentManagementService.updateCard(audienceId, dto),
    };
  }

}
