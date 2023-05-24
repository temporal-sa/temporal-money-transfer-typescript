import {
  proxyActivities, setHandler, sleep
} from '@temporalio/workflow';
import { ResultObj, StateObj, WorkflowParameterObj } from './interfaces';
import { TASK_QUEUE_ACTIVITY } from './config';
import { defineQuery } from '@temporalio/workflow';

import type * as activities from './activities';

const { testActivity } = proxyActivities<typeof activities>({
  taskQueue: TASK_QUEUE_ACTIVITY,
  startToCloseTimeout: '1 minute',
});

export const getStateQuery = defineQuery<StateObj>('getState');


/** A workflow that simply calls an activity */
export async function moneyTransferWorkflow(workflowParameterObj: WorkflowParameterObj): Promise<ResultObj> {

  let progressPercentage = 25;
  let state = "starting";
  setHandler(getStateQuery, () => ({
    progressPercentage: progressPercentage,
    state: state
  }));

  let resultObj: ResultObj = { testActivityResult: '' };

  await sleep('5 seconds');

  progressPercentage = 75;
  state = "running";

  const activityResult = await testActivity('test');

  resultObj.testActivityResult = activityResult;

  await sleep('5 seconds');

  progressPercentage = 100;
  state = "finished";

  return resultObj
}
