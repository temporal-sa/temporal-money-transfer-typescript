import {
  proxyActivities, setHandler, sleep
} from '@temporalio/workflow';
import { ResultObj, WorkflowParameterObj } from './interfaces';
import { TASK_QUEUE_ACTIVITY } from './config';
import { defineQuery } from '@temporalio/workflow';

import type * as activities from './activities';

const { testActivity } = proxyActivities<typeof activities>({
  taskQueue: TASK_QUEUE_ACTIVITY,
  startToCloseTimeout: '1 minute',
});

export const getStateQuery = defineQuery<number>('getState');


/** A workflow that simply calls an activity */
export async function moneyTransferWorkflow(workflowParameterObj: WorkflowParameterObj): Promise<ResultObj> {

  let state = 25;
  setHandler(getStateQuery, () => state);

  let resultObj: ResultObj = { testActivityResult: '' };

  await sleep('5 seconds');

  state = 75;

  const activityResult = await testActivity('test');

  resultObj.testActivityResult = activityResult;

  await sleep('5 seconds');

  state = 100;

  return resultObj
}
