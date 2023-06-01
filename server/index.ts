import { config } from 'dotenv';
import { resolve } from 'path';
import express, { Request, Response } from 'express';
import { initWorkflowParameterObj } from './temporal/config';
import { getConfig } from "./temporal/config";
import bodyParser from "body-parser";

const path = process.env.NODE_ENV === 'production'
  ? resolve(__dirname, './.env.production')
  : resolve(__dirname, './.env.development');

config({ path });

const configtest = getConfig();
console.log(process.env.NODE_ENV);
console.log(configtest.certPath);

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

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`Hello World!`);
});

// runWorkflow API
app.post('/runWorkflow', async (req: Request, res: Response) => {

    const config = getConfig();

    const workflowParameterObj = initWorkflowParameterObj();

    // form takes input as dollars, convert to cents
    workflowParameterObj.amountCents = req.body.amount * 100;

    const transferId = await runWorkflow(config, workflowParameterObj);

    res.send({
        transferId: transferId
    });
});

// runWorkflow API
app.get('/testConnect', async (req: Request, res: Response) => {

    const config = getConfig();

    const workflowParameterObj = initWorkflowParameterObj();

    // form takes input as dollars, convert to cents
    workflowParameterObj.amountCents = 55 * 100;

    const transferId = await runWorkflow(config, workflowParameterObj);

    res.send({
        transferId: transferId
    });
});

app.post('/getWorkflowOutcome', async (req: Request, res: Response) => {

    if (!req.body.workflowId) {
        return res.send({"message": "workflowId is required"});
    }

    // get workflowId from request POST body
    const workflowId = req.body.workflowId;

    const config = getConfig();

    const workflowOutcome = await getWorkflowOutcome(config, workflowId);

    console.log(`outcome: ${workflowOutcome}`);

    res.send(workflowOutcome);

});

app.post('/runQuery', async (req: Request, res: Response) => {

    // get workflowId from request POST body
    const workflowId = req.body.workflowId;

    const config = getConfig();

    const transferState = await runQuery(config, workflowId);

    console.log(`state: ${transferState}`);

    res.send(transferState);

});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});