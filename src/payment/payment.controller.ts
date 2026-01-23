import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Inject,
  Param,
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
import { ElevatorGuard } from 'src/guard/elevator.guard';

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


  @Post('stripe/onboarding-link')
  @UseGuards(AuthGuard('jwt'), ElevatorGuard)
  @ApiBearerAuth()
  async createOnboardingLink(@Req() req) {
    const userId = req.user.userId;
    return {
      success: true,
      url: await this.paymentService.createOnBoardingLink(userId)
    };
  }

  @Post("/stripe/connectacount-activation-check")
  @UseGuards(AuthGuard("jwt"), ElevatorGuard)
  @ApiBearerAuth()
  async stripeAcountActivationCheck(@Req() req: any) {
    const userId = req.user.userId;

    const result = await this.paymentService.userStripeAcountIsActiveChech(userId);
    return {
      success: true,
      message: "Statua Activation Status retrived success",
      data: result
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

  @Post(':paymentId/release')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Release payment to contractor (90%) (Only Admin Can Do This)',
  })
  async releasePaymentToConstuctor(
    @Param('paymentId') paymentId: string,
  ) {
    return await this.paymentService.releasePaymentToConstuctor(paymentId);
  }

  @Post(':paymentId/refund')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Refund payment via Stripe (Only Admin Can Do This)',
  })
  async refundPayment(
    @Param('paymentId') paymentId: string,
  ) {
    return await this.paymentService.refundPayment(paymentId);
  };




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