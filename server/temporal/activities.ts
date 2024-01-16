import Stripe from 'stripe';
import { DepositResponse, ExecutionScenarioObj } from './interfaces';
import { getConfig } from './config';
import { config } from 'dotenv';
import { resolve } from 'path';
import fetch from 'node-fetch-commonjs';
import * as activity from '@temporalio/activity';

const path = process.env.NODE_ENV === 'production'
  ? resolve(__dirname, './../.env.production')
  : resolve(__dirname, './../.env.development');

config({ path });

const configObj = getConfig();

export async function validate(scenario: ExecutionScenarioObj): Promise<boolean> {
  console.log(`\nAPI /validate"`);

  if (scenario === ExecutionScenarioObj.HUMAN_IN_LOOP) {
    return false;
  }
  return true;
}

export async function withdraw(amountCents: number, scenario: ExecutionScenarioObj): Promise<String> {
  console.log(`\nAPI /withdraw amountCents = ${amountCents}"`);

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

  return "SUCCESS";

}

export async function deposit(idempotencyKey: string, amountCents: number,
  scenario: ExecutionScenarioObj): Promise<DepositResponse> {

  console.log(`\nAPI /deposit amountCents = ${amountCents}"`);

  if (scenario === ExecutionScenarioObj.INVALID_ACCOUNT) {
    throw new InvalidAccountException("Deposit Activity Failed: Invalid Account");
  }

  // If Stripe API key is not set, return dummy data
  if (configObj.stripeSecretKey === undefined ||
    configObj.stripeSecretKey === '') {
    return { chargeId: "example-charge-ID" };
  }

  return stripeCharge(amountCents, idempotencyKey);

}

export async function undoWithdraw(amountCents: number): Promise<Boolean> {
  console.log(`\nAPI /undoWithdraw amountCents = ${amountCents}"`);

  return true;

}

// call the Stripe API to simulate a deposit
async function stripeCharge(amountCents: number,
  idempotencyKey: string): Promise<DepositResponse> {

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

export class InvalidAccountException extends Error {
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = InvalidAccountException.name;
  }
}