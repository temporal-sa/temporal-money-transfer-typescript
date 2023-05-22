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

export const getStateQuery = defineQuery<string>('getState');


/** A workflow that simply calls an activity */
export async function moneyTransferWorkflow(workflowParameterObj: WorkflowParameterObj): Promise<ResultObj> {

  let state = "STARTED";
  setHandler(getStateQuery, () => state);

  let resultObj: ResultObj = { testActivityResult: '' };

  // sleep for 10s
  await sleep('10 seconds');

  const activityResult = await testActivity('test');

  resultObj.testActivityResult = activityResult;

  state = "FINISHED";

  return resultObj
}
