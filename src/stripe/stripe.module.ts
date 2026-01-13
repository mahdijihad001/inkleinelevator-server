import { Global, Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import Stripe from 'stripe';

@Global()
@Module({
    providers: [
        {
            provide: 'STRIPE',
            useFactory: () => {
                return new Stripe(process.env.STRIPE_SECRATE_KEY as string, {
                    apiVersion: '2025-12-15.clover',
                });
            },
        },
        StripeService,
    ],
    exports: ['STRIPE'],
})
export class StripeModule {

}
