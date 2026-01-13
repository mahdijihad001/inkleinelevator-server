import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    constructor(@Inject('STRIPE') private stripe: Stripe) { }

    async createVendorAccount(vendorEmail: string) {
        const account = await this.stripe.accounts.create({
            type: 'express',
            country: 'US',
            email: vendorEmail,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
        });
        return account.id;
    }

  
    async holdPayment(amount: number, customerId?: string) {
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount, 
            currency: 'usd',
            customer: customerId,
            payment_method_types: ['card'],
            capture_method: 'manual', 
        });
        return paymentIntent.id;
    }

    async capturePayment(paymentIntentId: string) {
        const paymentIntent = await this.stripe.paymentIntents.capture(paymentIntentId);
        return paymentIntent;
    }


    async releasePayment(vendorStripeAccountId: string, totalAmount: number) {
        const adminFee = Math.floor(totalAmount * 0.10); 
        const vendorAmount = totalAmount - adminFee;

        const transfer = await this.stripe.transfers.create({
            amount: vendorAmount,
            currency: 'usd',
            destination: vendorStripeAccountId,
        });

        return transfer;
    }
}
