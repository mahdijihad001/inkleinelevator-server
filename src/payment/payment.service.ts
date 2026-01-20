import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {

    constructor(
        private prisma: PrismaService,
        @Inject('STRIPE') private stripe: Stripe
    ) { }

    // async paymentSingleJob(amount: number, userId: string, jobId: string, bidId: string) {

    //     const bid = await this.prisma.bid.findUnique({
    //         where: {
    //             bidId: bidId
    //         }
    //     });


    //     if (!bid) throw new NotFoundException("Bid Not Found");

    //     const user = await this.prisma.user.findUnique({
    //         where: {
    //             userId: bid.userId
    //         }
    //     });

    //     if (!user) throw new NotFoundException("Bidded User Not Valid");

    //     console.log(user.stripeAccountId);

    //     const paymentIntent = await this.stripe.paymentIntents.create({
    //         amount: bid?.bidAmount * 100,
    //         currency: "usd",
    //         capture_method: "automatic",
    //         automatic_payment_methods: {
    //             enabled: true
    //         },
    //         metadata: {
    //             userId: userId,
    //             jobId: jobId,
    //             bidId: bidId
    //         }
    //     });


    //     const payment = await this.prisma.payment.create({
    //         data: {
    //             amount: amount,
    //             userId: userId,
    //             stripePaymentId: paymentIntent.id,
    //             jobId: jobId
    //         }
    //     });

    //     return {
    //         payment,
    //         clientSecret: paymentIntent.client_secret
    //     }
    // }

    async paymentSingleJob(amount: number, userId: string, jobId: string, bidId: string) {
        const bid = await this.prisma.bid.findUnique({ where: { bidId: bidId } });
        if (!bid) throw new NotFoundException("Bid Not Found");

        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: amount * 100,
            currency: "usd",
            transfer_group: `JOB_${jobId}`,
            metadata: { userId, jobId, bidId }
        });

        const payment = await this.prisma.payment.create({
            data: {
                amount: amount,
                userId: userId,
                stripePaymentId: paymentIntent.id,
                jobId: jobId,
                bidId: bidId,
                status: "PAID"
            }
        });

        return {
            payment,
            clientSecret: paymentIntent.client_secret
        };
    }


    async releasePaymentToConstuctor(paymentId: string) {
        const payment = await this.prisma.payment.findUnique({
            where: { paymentId: paymentId },
        });

        if (!payment) throw new NotFoundException("Payment record not found");

        const findbid = await this.prisma.bid.findUnique({
            where: { bidId: payment.bidId }
        });

        if (!findbid) throw new NotFoundException("Bid record not found");

        const user = await this.prisma.user.findUnique({
            where: { userId: findbid.userId }
        });

        if (!user) throw new NotFoundException("User Not Found");

        const vendorAmount = payment.amount * 0.90;
        const vendorAmountInCents = Math.round(vendorAmount * 100);

        await this.stripe.transfers.create({
            amount: vendorAmountInCents,
            currency: "usd",
            destination: user?.stripeAccountId as string,
            transfer_group: `JOB_${payment.jobId}`,
            metadata: {
                dbPaymentId: paymentId
            }
        });

        return {
            message: "Payment transfer initiated"
        };
    }


    async refundPayment(paymentId: string) {
        const payment = await this.prisma.payment.findUnique({
            where: { paymentId: paymentId },
        });

        if (!payment) throw new NotFoundException("Payment record not found");

        await this.stripe.refunds.create({
            payment_intent: payment.stripePaymentId,
            metadata: {
                dbPaymentId: paymentId
            }
        });

        return { message: "Refund initiated. Processing..." };
    }

    async getALlReviwPayment(page: number = 1, limit: number = 10) {

        const skip = (page - 1) * limit

        const total = await this.prisma.payment.count({
            where: {
                status: "PAID",
                releaseStatus: "REVIEW"
            }
        });



        const result = await this.prisma.payment.findMany({
            where: {
                status: "PAID",
                releaseStatus: "REVIEW"
            },
            skip: skip,
            take: limit,
            orderBy: {
                createdAt: "asc"
            }
        });

        const totalPage = Math.ceil(total / limit);

        return {
            meta: {
                totalPage,
                page,
                limit,
            },
            data: result
        }

    }
    async getALlRelesePayment(page: number = 1, limit: number = 10) {

        const skip = (page - 1) * limit

        const total = await this.prisma.payment.count({
            where: {
                status: "PAID",
                releaseStatus: "RELESE"
            }
        });



        const result = await this.prisma.payment.findMany({
            where: {
                status: "PAID",
                releaseStatus: "RELESE"
            },
            skip: skip,
            take: limit,
            orderBy: {
                createdAt: "asc"
            }
        });

        const totalPage = Math.ceil(total / limit);

        return {
            meta: {
                totalPage,
                page,
                limit,
            },
            data: result
        }

    }








    // ----------Payment Webhook---------------- //

    async handleWebhookEvent(event: Stripe.Event) {

        try {
            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
                    break;

                case 'payment_intent.payment_failed':
                    await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
                    break;

                case 'payment_intent.canceled':
                    await this.handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
                    break;

                case 'transfer.created': {
                    const transfer = event.data.object;

                    const paymentId = transfer.metadata.dbPaymentId;

                    if (paymentId) {
                        await this.prisma.payment.update({
                            where: { paymentId: paymentId },
                            data: { releaseStatus: "RELESE" }
                        });
                        console.log(`Payment ID ${paymentId} marked as RELEASE.`);
                    }
                    break;
                }


                // case 'charge.refunded': {
                //     const charge = event.data.object;

                //     const paymentId = charge.metadata.dbPaymentId;

                //     if (paymentId) {
                //         await this.prisma.payment.update({
                //             where: { paymentId: paymentId },
                //             data: { releaseStatus: "REFUND" }
                //         });
                //         console.log(`Payment ID ${paymentId} updated to REFUNDED status.`);
                //     }
                //     break;
                // }

                case 'charge.refunded': {
                    const charge = event.data.object as any;

                    const paymentId = charge.metadata?.dbPaymentId;

                    if (!paymentId) break;

                    const payment = await this.prisma.payment.findUnique({
                        where: { paymentId },
                        select: { jobId: true },
                    });

                    if (!payment) break;

                    await this.prisma.payment.update({
                        where: { paymentId },
                        data: {
                            releaseStatus: 'REFUND',
                            status: 'REFUND',
                        },
                    });

                    await this.prisma.job.update({
                        where: { jobId: payment.jobId },
                        data: {
                            jobStatus: 'DECLINED',
                        },
                    });

                    break;
                }


                case 'payment_intent.created':
                    console.log('🆕 Payment intent created (no action needed)');
                    break;

                case 'charge.succeeded':
                    console.log('💳 Charge succeeded (handled by payment_intent.succeeded)');
                    break;

                case 'charge.updated':
                    console.log('🔄 Charge updated (no action needed)');
                    break;

                default:
                    console.log(`ℹ️ Unhandled event type: ${event.type}`);
            }

        } catch (error) {

            throw error;
        }
    }

    private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {

        const existingPayment = await this.prisma.payment.findFirst({
            where: { stripePaymentId: paymentIntent.id }
        });

        if (!existingPayment) {
            return;
        }


        // Update Payment Status
        const updated = await this.prisma.payment.update({
            where: { paymentId: existingPayment.paymentId },
            data: {
                status: 'PAID',
            },
        });

        await this.prisma.bid.update({
            where: {
                bidId: paymentIntent.metadata.bidId
            },
            data: {
                status: "ACCEPTED"
            }
        })


        await this.prisma.job.update({
            where: {
                jobId: updated.jobId
            },
            data: {
                paymentStatus: "PAID"
            }
        })

        console.log("Payment Success");

    }

    private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {

        const updated = await this.prisma.payment.updateMany({
            where: { stripePaymentId: paymentIntent.id },
            data: { status: 'CANCEL' }
        });


        if (updated.count > 0) {
            console.log('Payment marked as CANCEL');
        } else {
            console.warn('No payment found to mark as CANCEL');
        }

        console.log(`End Payment Faild`);
    }

    private async handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {

        const updated = await this.prisma.payment.updateMany({
            where: { stripePaymentId: paymentIntent.id },
            data: { status: 'CANCEL' }
        });

        if (updated.count > 0) {
            console.log('Payment marked as CANCEL');
        } else {
            console.warn('No payment found to mark as CANCEL');
        }
        console.log('End Payment Cancled');
    }
}