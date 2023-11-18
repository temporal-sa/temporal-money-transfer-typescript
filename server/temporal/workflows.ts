import {
  proxyActivities, setHandler, sleep, uuid4
} from '@temporalio/workflow';
import { ResultObj, StateObj, StripeChargeResponse, WorkflowParameterObj } from './interfaces';
import { TASK_QUEUE_ACTIVITY } from './config';
import { defineQuery, defineSignal, condition } from '@temporalio/workflow';
import Stripe from 'stripe';

import type * as activities from './activities';

const { createCharge } = proxyActivities<typeof activities>({
  taskQueue: TASK_QUEUE_ACTIVITY,
  startToCloseTimeout: '5 seconds',
  retry: {
    nonRetryableErrorTypes: ['StripeInvalidRequestError']
  }
});

export const getStateQuery = defineQuery<StateObj>('getState');
export const unblockSignal = defineSignal('approveTransfer');

/** A workflow that simply calls an activity */
export async function moneyTransferWorkflow(workflowParameterObj: WorkflowParameterObj): Promise<ResultObj> {

  let progressPercentage = 25;
  let transferState = "starting";
  let chargeResult: StripeChargeResponse = { chargeId: "" };

  let isApproved = true;
  setHandler(unblockSignal, () => void (isApproved = true));

  // Query that returns state info to the UI
  setHandler(getStateQuery, () => ({
    progressPercentage: progressPercentage,
    transferState: transferState,
    chargeResult: chargeResult
  }));

  console.log(`amountCents: ${workflowParameterObj.amountCents}`);
  console.log(`scenario: ${workflowParameterObj.scenario}`);

  // this sleep is non-blocking!
  await sleep('2 seconds');

  // if dollar amount is over $1000, require approval by signal
  console.log(`amountCents: ${workflowParameterObj.amountCents}`);
  if(workflowParameterObj.amountCents > 100000) {
    console.log(`amount is over 1000: requiring approval by signal`)
    isApproved = false;
    progressPercentage = 50;
    await condition(() => isApproved)
  }

// Example of sending a signal to approve the transfer (using Temporal CLI)
// temporal workflow signal \
// --query 'ExecutionStatus="Running" and WorkflowType="moneyTransferWorkflow"' \
// --name approveTransfer \
// --reason 'approving transfer'

  // Simulate workflow error (uncomment to test)
  // throw new Error('Something went wrong');

  progressPercentage = 75;
  transferState = "running";

  const idempotencyKey = uuid4();

  chargeResult = await createCharge(idempotencyKey, workflowParameterObj.amountCents);

  await sleep('5 seconds');

  progressPercentage = 100;
  transferState = "finished";

  return { stripeChargeResponse: chargeResult };

}
