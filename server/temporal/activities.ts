import Stripe from 'stripe';
import { StripeChargeResponse } from './interfaces';
import { getConfig } from './config';
import { config } from 'dotenv';
import { resolve } from 'path';

const path = process.env.NODE_ENV === 'production'
  ? resolve(__dirname, './../.env.production')
  : resolve(__dirname, './../.env.development');

config({ path });

const configObj = getConfig();

export async function createCharge(idempotencyKey: string,
  amountCents: number): Promise<StripeChargeResponse> {

  if (configObj.stripeSecretKey === undefined ||
    configObj.stripeSecretKey === '') {
    console.log('Stripe secret key is not set, returning dummy charge ID');
    return { chargeId: "dummy-charge-ID" };
  }

  const stripe = new Stripe(configObj.stripeSecretKey, {
    apiVersion: '2022-11-15',
  });

  const customer: Stripe.Customer = await stripe.customers.create({
    source: 'tok_visa'
  });

  const charge = await stripe.charges.create({
    amount: amountCents,
    currency: 'usd',
    customer: customer.id,
    description: 'charge'
  }, {
    idempotencyKey: idempotencyKey
  });

  // print Stripe.charge information
  return { chargeId: charge.id };

}
