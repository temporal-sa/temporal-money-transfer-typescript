import { Client, Connection } from '@temporalio/client';
import fs from 'fs-extra';
import { ResultObj, WorkflowParameterObj } from './interfaces';
import { TASK_QUEUE_WORKFLOW } from './config';
import { nanoid } from 'nanoid';
import { getStateQuery, moneyTransferWorkflow } from './workflows';
import { ConfigObj } from './config';
import { getCertKeyBuffers } from './certificate_helpers';

async function createClient(config: ConfigObj): Promise<Client> {

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

  console.log("About to connect to Temporal server...");

  const connection = await Connection.connect(connectionOptions);

  const client = new Client({
    connection,
    namespace: config.namespace,
    // dataConverter: await getDataConverter()
  });

  return client;
}

export async function runWorkflow(config: ConfigObj, workflowParameterObj: WorkflowParameterObj): Promise<String> {

  const client = await createClient(config);

  const transferId = 'transfer-' + nanoid();

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

export async function runQuery(config: ConfigObj, workflowId: string): Promise<number> {

  const client = await createClient(config);

  const handle = client.workflow.getHandle(workflowId);

  const queryResult = await handle.query(getStateQuery);

  await client.connection.close();

  return queryResult;

}