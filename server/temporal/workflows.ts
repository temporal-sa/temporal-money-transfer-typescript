import {
  proxyActivities
} from '@temporalio/workflow';
import { ResultObj, WorkflowParameterObj } from './interfaces';
import { TASK_QUEUE_ACTIVITY } from './config';

import type * as activities from './activities';

const { testActivity } = proxyActivities<typeof activities>({
  taskQueue: TASK_QUEUE_ACTIVITY,
  startToCloseTimeout: '1 minute',
});


/** A workflow that simply calls an activity */
export async function moneyTransferWorkflow(workflowParameterObj: WorkflowParameterObj): Promise<ResultObj> {

  let resultObj: ResultObj = { result: "test" };

  const activityResult = await testActivity('test');

  resultObj.result = activityResult;

  return resultObj
}
