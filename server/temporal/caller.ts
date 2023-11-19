import { Client, Connection } from '@temporalio/client';
import fs from 'fs-extra';
import { ResultObj, ScheduleParameterObj, StateObj, WorkflowParameterObj, WorkflowStatus } from './interfaces';
import { TASK_QUEUE_WORKFLOW, initWorkflowParameterObj } from './config';
import { nanoid } from 'nanoid';
import { getStateQuery, moneyTransferWorkflow } from './workflows';
import { ConfigObj } from './config';
import { getCertKeyBuffers } from './certificate_helpers';
import { getDataConverter } from './data-converter';
import { createConnection } from 'net';

async function createConnectionObj(config: ConfigObj): Promise<Connection> {
  const { cert, key } = await getCertKeyBuffers(config);

  // todo make this meaningful
  const { NODE_ENV = 'production' } = process.env;
  let isDeployed = ['production', 'staging'].includes(NODE_ENV);

  let connectionOptions = {};

  // if cert and key are null
  if (cert === null && key === null) {
    connectionOptions = {
      address: config.address
    };
  }
  else {
    connectionOptions = {
      address: config.address,
      tls: {
        clientCertPair: {
          crt: cert,
          key: key,
        },
      },
    };
  }

  return await Connection.connect(connectionOptions);
}

async function createClient(config: ConfigObj): Promise<Client> {

  const connection = await createConnectionObj(config);

  const client = new Client({
    connection,
    namespace: config.namespace,
    // dataConverter: await getDataConverter(), // enable for encrypted payloads
  });

  return client;
}

export async function runWorkflow(config: ConfigObj, workflowParameterObj: WorkflowParameterObj): Promise<String> {

  const client = await createClient(config);

  const transferId = 'transfer-' + nanoid(6);

  // start() returns a WorkflowHandle that can be used to await the result
  const handle = await client.workflow.start(moneyTransferWorkflow, {
    // type inference works! args: [name: string]
    args: [workflowParameterObj],
    taskQueue: TASK_QUEUE_WORKFLOW,
    // in practice, use a meaningful business ID, like customerId or transactionId
    workflowId: transferId
  });

  // don't wait for workflow to finish
  // let result = await handle.result()
  // console.log(result); // Hello, Temporal!

  await client.connection.close();

  return transferId;

}

export async function runSchedule(config: ConfigObj, scheduleParameterObj: ScheduleParameterObj): Promise<String> {

  const client = await createClient(config);

  const scheduleId = 'transfer-' + nanoid(6) + '-schedule';

  const workflowParameterObj = initWorkflowParameterObj();
  workflowParameterObj.amountCents = scheduleParameterObj.amountCents;
  workflowParameterObj.scenario = scheduleParameterObj.scenario;

  const schedule = await client.schedule.create({
    action: {
      type: 'startWorkflow',
      workflowType: moneyTransferWorkflow,
      args: [workflowParameterObj],
      taskQueue: TASK_QUEUE_WORKFLOW,
    },
    scheduleId: scheduleId,
    spec: {
      intervals: [{ every: `${scheduleParameterObj.interval}s` }]
    },
    state: {
      remainingActions: scheduleParameterObj.count,

    }
  });

  await client.connection.close();

  return scheduleId;

}

function toRFC3339Nano(date: Date) {
  const pad = (number: number, length = 2) => number.toString().padStart(length, '0');

  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  const milliseconds = date.getUTCMilliseconds().toString().padStart(3, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
}

export async function listWorkflows(config: ConfigObj): Promise<WorkflowStatus[]> {

  const connection = await createConnectionObj(config);

  // In browsers or Node.js environments with the Performance API
  const performance = require('perf_hooks').performance; // Only in Node.js

  const nownano = performance.now();
  const oneHourAgoInNanoSeconds = (nownano - 3600 * 1000) * 1000000;

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 3600000);
  const rfc3339NanoString = toRFC3339Nano(oneHourAgo);

  const response = await connection.workflowService.listWorkflowExecutions({
    namespace: config.namespace,
    query: `WorkflowType="moneyTransferWorkflow" and StartTime > "${rfc3339NanoString}"`,
  });

  let cloud = false;
  if (config.address.endsWith('.tmprl.cloud:7233')) {
    cloud = true;
  }

  // list of WorkflowStatus objects
  const workflowStatuses: WorkflowStatus[] = [];

  for (let wf of response.executions) {

    let wfStatus = 'unknown';
    if (wf.execution) {
      switch (wf.status?.toString()) {
        case '1':
          wfStatus = 'RUNNING';
          break;
        case '2':
          wfStatus = 'COMPLETED';
          break;
        case '3':
          wfStatus = 'FAILED';
          break;
        case '4':
          wfStatus = 'CANCELLED';
          break;
      }

      workflowStatuses.push({ workflowId: wf.execution.workflowId, workflowStatus: wfStatus });

      if (cloud) { // if cloud then add url
        workflowStatuses[workflowStatuses.length - 1].url = `https://cloud.temporal.io/namespaces/${config.namespace}/workflows/${wf.execution.workflowId}`;
      }
    }
  }

  await connection.close();

  return workflowStatuses;

}

export async function runQuery(config: ConfigObj, workflowId: string): Promise<StateObj> {

  const client = await createClient(config);

  const handle = client.workflow.getHandle(workflowId);

  const queryResult = await handle.query(getStateQuery);
  const describe = await handle.describe();
  queryResult.workflowStatus = describe.status.name;

  await client.connection.close();

  return queryResult;

}

export async function getWorkflowOutcome(config: ConfigObj, workflowId: string): Promise<StateObj> {

  const client = await createClient(config);

  const handle = client.workflow.getHandle(workflowId);

  let result = null;
  try {
    result = await handle.result();
  } catch (err) {
    result = err;
  }

  return result;

}