import { config } from 'dotenv';
import { resolve } from 'path';
import express, { Request, Response } from 'express';
import { initWorkflowParameterObj, printConfig } from './temporal/config';
import { getConfig } from "./temporal/config";
import bodyParser from "body-parser";
import filepath from 'path';

const path = process.env.NODE_ENV === 'production'
    ? resolve(__dirname, './.env.production')
    : resolve(__dirname, './.env.development');

config({ path });

const configtest = getConfig();
console.log(process.env.NODE_ENV);
printConfig(configtest);

// TEMPORARY: Allow CORS for all origins
import cors from 'cors';
import { getWorkflowOutcome, runQuery, runWorkflow } from "./temporal/caller";

// express handler for GET /
const app = express();

app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const staticFilesPath = filepath.resolve(__dirname, 'build');
app.use(express.static(staticFilesPath));

const port = process.env.PORT || 3000;

app.get('/health', (req, res) => {
    res.send(`OK`);
});

app.get('/serverinfo', (req, res) => {

    const serverconfig = {
        address: configtest.address,
        namespace: configtest.namespace,
        url: ''
    }

    // if address ends in .tmprl.cloud:7233
    if (serverconfig.address.endsWith('.tmprl.cloud:7233')) {
        // strip port from address
        serverconfig.url = `https://cloud.temporal.io/namespaces/${serverconfig.namespace}/workflows`;
    }

    res.json(serverconfig);
});

// runWorkflow API
app.post('/runWorkflow', async (req: Request, res: Response) => {

    const config = getConfig();

    const workflowParameterObj = initWorkflowParameterObj();

    // form takes input as dollars, convert to cents
    workflowParameterObj.amountCents = req.body.amount * 100;
    workflowParameterObj.scenario = req.body.scenario;

    const transferId = await runWorkflow(config, workflowParameterObj);

    res.send({
        transferId: transferId
    });
});

app.get('/testConnect', async (req: Request, res: Response) => {

    // if GET variable 'n' is an integer then set, otherwise default to 1
    const n = parseInt(req.query.n as string) || 1;

    const config = getConfig();

    const workflowParameterObj = initWorkflowParameterObj();

    // form takes input as dollars, convert to cents
    workflowParameterObj.amountCents = 99 * 100;

    const transferIds = [];

    // run n times
    for (let i = 0; i < n; i++) {
        console.log(`run ${i} of ${n}`);
        const transferId = await runWorkflow(config, workflowParameterObj);
        transferIds.push(transferId);
    }

    res.send({
        transferIds: transferIds
    });
});

app.post('/getWorkflowOutcome', async (req: Request, res: Response) => {

    if (!req.body.workflowId) {
        return res.send({ "message": "workflowId is required" });
    }

    // get workflowId from request POST body
    const workflowId = req.body.workflowId;

    const config = getConfig();

    const workflowOutcome = await getWorkflowOutcome(config, workflowId);

    console.log(`outcome: ${workflowOutcome}`);

    res.send(workflowOutcome);

});

app.post('/runQuery', async (req: Request, res: Response) => {

    try {
        // get workflowId from request POST body
        const workflowId = req.body.workflowId;

        const config = getConfig();

        const transferState = await runQuery(config, workflowId);

        console.log(`state: ${transferState}`);

        res.send(transferState);
    }
    catch (err) { // avoid node crashing if workflow is in task failed state
        console.log(err);
    }

});

// e.g. simulateDelay?s=7
app.get('/simulateDelay', (req: Request, res: Response) => {
    const secondsParam = req.query.s as string;

    if (secondsParam) {
        const seconds = parseInt(secondsParam);

        if (!isNaN(seconds)) {
            console.log(`Simulating API response delay: ${seconds} seconds`);

            setTimeout(() => {
                res.send(`Delay finished after ${seconds} seconds`);
            }, seconds * 1000);
        } else {
            res.status(400).send('Invalid seconds parameter');
        }
    } else {
        res.send('Use query param s to specify seconds to delay');
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});