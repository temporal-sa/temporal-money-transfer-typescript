import { Client, Connection } from '@temporalio/client';
import fs from 'fs-extra';
import { ResultObj, WorkflowParameterObj } from './interfaces';
import { TASK_QUEUE_WORKFLOW } from './config';
import { nanoid } from 'nanoid';
import { moneyTransferWorkflow } from './workflows';
import { ConfigObj } from './config';

export async function runWorkflow(config: ConfigObj, workflowParameterObj: WorkflowParameterObj): Promise<ResultObj> {

  const cert = await fs.readFile(config.certPath);
  const key = await fs.readFile(config.keyPath);

  // todo make this meaningful
  const { NODE_ENV = 'production' } = process.env;
  let isDeployed = ['production', 'staging'].includes(NODE_ENV);

  let connectionOptions = {};

  connectionOptions = {
    address: config.address,
    tls: {
      clientCertPair: {
        crt: cert,
        key: key,
      },
    },
  };

  console.log("About to connect to Temporal server...");

  const connection = await Connection.connect(connectionOptions);

  const client = new Client({
    connection,
    namespace: config.namespace,
    // dataConverter: await getDataConverter()
  });

  // start() returns a WorkflowHandle that can be used to await the result
  const handle = await client.workflow.start(moneyTransferWorkflow, {
    // type inference works! args: [name: string]
    args: [workflowParameterObj],
    taskQueue: TASK_QUEUE_WORKFLOW,
    // in practice, use a meaningful business ID, like customerId or transactionId
    workflowId: 'workflow-' + nanoid()
  });

  let result = await handle.result()
  console.log(result); // Hello, Temporal!

  await client.connection.close();

  return result;

}