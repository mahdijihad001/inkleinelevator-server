import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { FaqService } from './faq.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';
import { FaqBodyDto } from './dto/faq.request.dto';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/guard/admin.guard';

@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) { }

  // CREATE FAQ
  @Post('create')
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new FAQ' })
  @ApiBody({ type: FaqBodyDto })
  async createFaq(@Body() body: FaqBodyDto) {
    return {
      success: true,
      message: 'FAQ created successfully',
      data: await this.faqService.createFaq(body),
    };
  }

  // UPDATE FAQ
  @Put('update/:id')
  @ApiOperation({ summary: 'Update an existing FAQ' })
  @ApiParam({
    name: 'id',
    description: 'FAQ ID (qaCardId)',
  })
  @ApiBody({ type: FaqBodyDto })
  async updateFaq(
    @Param('id') faqId: string,
    @Body() body: FaqBodyDto,
  ) {
    return {
      success: true,
      message: 'FAQ updated successfully',
      data: await this.faqService.updateFaq(faqId, body),
    };
  }

  // DELETE FAQ
  @Delete('delete/:id')
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an FAQ' })
  @ApiParam({
    name: 'id',
    description: 'FAQ ID (qaCardId)',
  })
  async deleteFaq(@Param('id') faqId: string) {
    await this.faqService.deleteFaq(faqId);

    return {
      success: true,
      message: 'FAQ deleted successfully',
    };
  }

  // GET ALL FAQs
  @Get('all')
  @ApiOperation({ summary: 'Get all FAQs' })
  async getAllFaqs() {
    const faqs = await this.faqService.getAllFaqs();
    return {
      success: true,
      message: 'All FAQs fetched successfully',
      data: faqs,
    };
  }

}
