import {
  ApplicationFailure,
  proxyActivities, setHandler, sleep, Trigger, uuid4, workflowInfo
} from '@temporalio/workflow';
import { ExecutionScenarioObj, ResultObj, StateObj, DepositResponse, WorkflowParameterObj } from './interfaces';
import { TASK_QUEUE_ACTIVITY, getConfig } from './config';
import { defineQuery, defineSignal, defineUpdate } from '@temporalio/workflow';

import type * as activities from './activities';

const { validate, withdraw, deposit, undoWithdraw } = proxyActivities<typeof activities>({
  taskQueue: TASK_QUEUE_ACTIVITY,
  startToCloseTimeout: '5 seconds',
  retry: {
    nonRetryableErrorTypes: ['StripeInvalidRequestError', 'InvalidAccountException',
      'StripeIdempotencyError']
  }
});

export const getStateQuery = defineQuery<StateObj>('getState');
export const approveTransferSignal = defineSignal('approveTransfer');
export const approveTransferUpdate = defineUpdate<string>('approveTransferUpdate');

export async function moneyTransferWorkflow(workflowParameterObj: WorkflowParameterObj): Promise<ResultObj> {

  const { workflowId } = workflowInfo();
  const isApproved = new Trigger<boolean>();
  setHandler(approveTransferSignal, () => isApproved.resolve(true));

  let approvedState = false; // if the transfer has been approved already

  // Define an update validator that rejects negative inputs to the update.
  const updateValidator = () => {
    console.log('Approve update received. Validating...');
    if (approvedState) {
      throw new Error('Validation Failed: Cannot approve transfer more than once');
    }
    if (transferState !== 'waiting') {
      throw new Error('Validation Failed: Cannot approve transfer when not waiting');
    }
  };

  // Define the update handler to approve the transfer. Needs to pass the validator first
  const updateHandler = () => {
    isApproved.resolve(true)
    return "successfully approved transfer";
  };

  setHandler(approveTransferUpdate, updateHandler, { validator: updateValidator });
  let depositResponse: DepositResponse = { chargeId: "" };

  // Query that returns state info to the UI
  const approvalTimeNum = 30;
  setHandler(getStateQuery, () => ({
    progressPercentage: progressPercentage,
    transferState: transferState,
    workflowStatus: "",
    chargeResult: depositResponse,
    approvalTime: approvalTimeNum, // set expiry timer in UI for human approval scenario
  }));

  let progressPercentage = 25;
  let transferState = "starting";

  // Temporal sleeps are non-blocking!
  await sleep(+workflowParameterObj.initialSleepTime * 1000) // in seconds;
  progressPercentage = 50;
  transferState = "running";

  // validate activity
  if (await validate(workflowParameterObj.scenario) === false) {
    const approvalTime = `${approvalTimeNum} seconds`; // for feeding to temporal sleep()
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

    approvedState = true;
    console.log(`Transfer approved for workflow ID: ${workflowId}`)
  }

  progressPercentage = 60
  transferState = "running";

  // withdraw activity
  await withdraw(workflowParameterObj.amountCents, workflowParameterObj.scenario);
  await sleep('2 seconds'); // for dramatic effect

  if (workflowParameterObj.scenario === ExecutionScenarioObj.BUG_IN_WORKFLOW) {
    // throw an error to simulate a bug in the workflow
    // uncomment the following line and restart workers to 'fix' the bug
    throw new Error('Workflow bug!');
  }

  const idempotencyKey = uuid4();

  try {
    // deposit activity
    // This will fail if the scenario is set to 'invalid account'
    depositResponse = await deposit(idempotencyKey, workflowParameterObj.amountCents, workflowParameterObj.scenario);

  } catch (error) {
    // Compensate by reverting the withdraw if deposit fails with ApplicationFailure
    await undoWithdraw(workflowParameterObj.amountCents);
    console.log('Deposit failed unrecoverably, reverting withdraw');
    throw new ApplicationFailure('Transfer failed unrecoverably');
  }

  progressPercentage = 80;

  await sleep('6 seconds');

  progressPercentage = 100;
  transferState = "finished";

  return { depositResponse: depositResponse };

}
