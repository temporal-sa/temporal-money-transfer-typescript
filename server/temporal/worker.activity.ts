import { config } from 'dotenv';
import { resolve } from 'path';
import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from './activities';
import { getConfig, TASK_QUEUE_ACTIVITY } from './config';
import { getCertKeyBuffers } from './certificate_helpers';

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

  const connection = await NativeConnection.connect({
    // defaults port to 7233 if not specified
    address: configObj.address,
    tls: {
      // set to true if TLS without mTLS
      // See docs for other TLS options
      clientCertPair: {
        crt: cert,
        key: key,
      },
    },
  });

  const worker = await Worker.create({
    connection: connection,
    workflowsPath: require.resolve('./workflows'),
    activities: activities,
    namespace: configObj.namespace,
    taskQueue: TASK_QUEUE_ACTIVITY,
    // dataConverter: await getDataConverter(),
  });
  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});