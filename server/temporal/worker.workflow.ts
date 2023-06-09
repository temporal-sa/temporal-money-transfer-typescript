import { config } from 'dotenv';
import { resolve } from 'path';
import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from './activities';
import { getConfig, TASK_QUEUE_WORKFLOW } from './config';
import { getCertKeyBuffers } from './certificate_helpers';
import { getDataConverter } from './data-converter';

const path = process.env.NODE_ENV === 'production'
  ? resolve(__dirname, './.env.production')
  : resolve(__dirname, './.env.development');

config({ path });

const configtest = getConfig();
console.log(process.env.NODE_ENV);
console.log(configtest.certPath);

// import { getDataConverter } from './data-converter';

const configObj = getConfig();

async function run() {

  const { cert, key } = await getCertKeyBuffers(configObj);

  let connectionOptions = {};

  // if cert and key are null
  if (cert === null && key === null) {
    connectionOptions = {
      address: configObj.address
    };
  }
  else {
    connectionOptions = {
      address: configObj.address,
      tls: {
        clientCertPair: {
          crt: cert,
          key: key,
        },
      },
    };
  }

  const connection = await NativeConnection.connect(connectionOptions);

  const worker = await Worker.create({
    connection: connection,
    workflowsPath: require.resolve('./workflows'),
    activities: activities,
    namespace: configObj.namespace,
    taskQueue: TASK_QUEUE_WORKFLOW,
    dataConverter: await getDataConverter(),
    enableNonLocalActivities: false
  });
  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});