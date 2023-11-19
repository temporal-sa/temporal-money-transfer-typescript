import {
  ApplicationFailure,
  proxyActivities, setHandler, sleep, Trigger, uuid4, workflowInfo
} from '@temporalio/workflow';
import { ExecutionScenarioObj, ResultObj, StateObj, StripeChargeResponse, WorkflowParameterObj } from './interfaces';
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
export const approveTransferSignal = defineSignal('approveTransfer');

/** A workflow that simply calls an activity */
export async function moneyTransferWorkflow(workflowParameterObj: WorkflowParameterObj): Promise<ResultObj> {

  const approvalTimeNum = 30;
  const approvalTime = `${approvalTimeNum} seconds`; // for feeding to temporal sleep()

  const { workflowId } = workflowInfo();

  const isApproved = new Trigger<boolean>();
  setHandler(approveTransferSignal, () => isApproved.resolve(true));

  let chargeResult: StripeChargeResponse = { chargeId: "" };

  // Query that returns state info to the UI
  setHandler(getStateQuery, () => ({
    progressPercentage: progressPercentage,
    transferState: transferState,
    workflowStatus: "", // todo deprecate
    chargeResult: chargeResult,
    approvalTime: approvalTimeNum,
  }));

  let progressPercentage = 25;
  let transferState = "starting";

  // Temporal sleeps are non-blocking!
  await sleep('5 seconds');

  progressPercentage = 50;
  transferState = "running";

  console.log(`amountCents: ${workflowParameterObj.amountCents}`);
  console.log(`scenario: ${workflowParameterObj.scenario}`);

  if(workflowParameterObj.scenario === ExecutionScenarioObj.HUMAN_IN_LOOP) {
    console.log(`Waiting on 'approveTransfer' Signal or Update for workflow ID: ${workflowId}`)
    transferState = "waiting";

    // wait for human approval, else fail workflow
    const userInteracted = await Promise.race([
      isApproved,
      sleep(approvalTime),
    ]);

    if (!userInteracted) {
      // fail workflow
      throw new ApplicationFailure(`Transfer not approved within ${approvalTime}`);
    }
  }

  if(workflowParameterObj.scenario === ExecutionScenarioObj.BUG_IN_WORKFLOW) {
    // throw an error to simulate a bug in the workflow
    throw new Error('Workflow bug!');
  }

  transferState = "running";

  // Example of sending a signal to approve the transfer (using Temporal CLI)
  // temporal workflow signal \
  // --query 'ExecutionStatus="Running" and WorkflowType="moneyTransferWorkflow"' \
  // --name approveTransfer \
  // --reason 'approving transfer'

  transferState = "running";

  const idempotencyKey = uuid4();
  
  // call activity to create charge
  chargeResult = await createCharge(idempotencyKey, workflowParameterObj.amountCents, workflowParameterObj.scenario);
  
  progressPercentage = 80;

  await sleep('8 seconds');

  progressPercentage = 100;
  transferState = "finished";

  return { stripeChargeResponse: chargeResult };

}
