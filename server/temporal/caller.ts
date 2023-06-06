import { Client, Connection, WorkflowFailedError } from '@temporalio/client';
import fs from 'fs-extra';
import { ResultObj, StateObj, WorkflowParameterObj } from './interfaces';
import { TASK_QUEUE_WORKFLOW } from './config';
import { nanoid } from 'nanoid';
import { getStateQuery, moneyTransferWorkflow } from './workflows';
import { ConfigObj } from './config';
import { getCertKeyBuffers } from './certificate_helpers';

// opentelemetry
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OpenTelemetryWorkflowClientInterceptor } from '@temporalio/interceptors-opentelemetry';

async function createClient(config: ConfigObj): Promise<Client> {

  const { cert, key } = await getCertKeyBuffers(config);

  // todo make this meaningful
  const { NODE_ENV = 'production' } = process.env;
  let isDeployed = ['production', 'staging'].includes(NODE_ENV);

  let connectionOptions = {};

  // give information on config address, cert and key
  console.log(`Config address: ${config.address}`);
  console.log(`Config cert: ${config.certPath}`);

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

  let interceptors = {}

  if (config.prometheusAddress) {
    interceptors = {
      workflow: [new OpenTelemetryWorkflowClientInterceptor()],
    }
  }

  const client = new Client({
    connection,
    namespace: config.namespace,
    interceptors: interceptors
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

    await client.connection.close();

    return transferId;

  // don't wait for workflow to finish
  // let result = await handle.result()
  // console.log(result); // Hello, Temporal!

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