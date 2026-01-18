import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Inject,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiOperation } from '@nestjs/swagger';
import { createPaymentDto } from './dto/payment.request.dto';
import Stripe from 'stripe';
import { AdminGuard } from 'src/guard/admin.guard';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    @Inject('STRIPE') private stripe: Stripe
  ) { }

  @Post("singlejob/payment/checkout")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Make Single Job Payment"
  })
  async singleJobPayment(@Body() dto: createPaymentDto, @Req() req: any) {

    const result = await this.paymentService.paymentSingleJob(
      dto.amount,
      req.user.userId,
      dto.jobId,
      dto.bidId
    );

    return {
      success: true,
      message: "Payment Success",
      data: result
    }
  }


  @Get('all-review-payment')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "get all review payment (Only For Admin)"
  })
  async getAllReviewPayments(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    page = Number(page) || 1;
    limit = Number(limit) || 10;
    const data = await this.paymentService.getALlReviwPayment(page, limit);

    return {
      success: true,
      message: "Review Retrived Successfylly",
      data: data
    }

  }


  @Get('all-relesed-payment')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "get all relesed payment (Only For Admin)"
  })
  async getAllRelesePayments(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    page = Number(page) || 1;
    limit = Number(limit) || 10;
    const data = await this.paymentService.getALlRelesePayment(page, limit);

    return {
      success: true,
      message: "Review Retrived Successfylly",
      data: data
    }

  }

  @Post('webhook')
  @HttpCode(200)
  @ApiExcludeEndpoint()
  async handleWebhook(
    @Body() req: Buffer,
    @Headers('stripe-signature') sig: string
  ) {

    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    if (!sig) {
      throw new BadRequestException('No stripe signature');
    }

    let event: Stripe.Event;

    try {
      console.log('Verifying webhook signature...');

      event = this.stripe.webhooks.constructEvent(
        req,
        sig,
        endpointSecret
      );

    } catch (err) {

      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    try {
      await this.paymentService.handleWebhookEvent(event);
      return { received: true };
    } catch (err) {
      throw new BadRequestException('Error processing webhook');
    }
  }
}