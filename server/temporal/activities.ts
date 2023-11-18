import Stripe from 'stripe';
import { ExecutionScenarioObj, StripeChargeResponse } from './interfaces';
import { getConfig } from './config';
import { config } from 'dotenv';
import { resolve } from 'path';
import fetch from 'node-fetch-commonjs';
import * as activity from '@temporalio/activity';
import {ApplicationFailure} from '@temporalio/workflow';

const path = process.env.NODE_ENV === 'production'
  ? resolve(__dirname, './../.env.production')
  : resolve(__dirname, './../.env.development');

config({ path });

const configObj = getConfig();

export async function createCharge(idempotencyKey: string, amountCents: number, scenario: ExecutionScenarioObj): Promise<StripeChargeResponse> {
  console.log("\n\nCalled API /charge\n");

  const { attempt } = activity.Context.current().info;

  if (scenario === ExecutionScenarioObj.API_DOWNTIME) {
      console.log("\n\n*** Simulating API Downtime\n");
      if (attempt < 5) {
          console.log("\n*** Activity Attempt: #"); // Add attempt number
          const delaySeconds = 7;
          console.log("\n\n/API/simulateDelay Seconds " + delaySeconds + "\n");
          await simulateDelay(delaySeconds);
      }
  }

  if (scenario === ExecutionScenarioObj.INSUFFICIENT_FUNDS) {
      throw ApplicationFailure.nonRetryable("Insufficient Funds: createCharge Activity Failed");
  }

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

// call local simulateDelay API to simulate API downtime
async function simulateDelay(seconds: number): Promise<string> {
  const url = `http://localhost:3000/simulateDelay?s=${seconds}`; // Replace with your server URL
  console.log(`\n\n/API/simulateDelay URL: ${url}\n`);

  try {
      const response = await fetch(url);
      const responseBody = await response.text();
      return responseBody;
  } catch (e) {
      throw new Error(`Failed to call /simulateDelay: ${e}`);
  }
}