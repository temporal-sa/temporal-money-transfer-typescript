import * as dotenv from "dotenv";
import express, { Request, Response } from 'express';
import { initWorkflowParameterObj } from './temporal/config';
import { getConfig } from "./temporal/config";
dotenv.config();

// TEMPORARY: Allow CORS for all origins
import cors from 'cors';
import { runWorkflow } from "./temporal/caller";

// express handler for GET /
const app = express();
app.use(cors());  // Add this line

dotenv.config();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`Hello World!`);
});

let secondsSinceServerStart: number = 0;

// Start the timer when the server starts
setInterval(() => {
    secondsSinceServerStart += 1;
}, 1000);

app.get('/countSeconds', (req: Request, res: Response) => {
    res.send({
        seconds: secondsSinceServerStart
    });
});

// Add a new endpoint to reset the timer
app.post('/resetTimer', (req: Request, res: Response) => {
    secondsSinceServerStart = 0;
    res.send({
        message: 'Timer reset!'
    });
});

// runWorkflow API
app.post('/runWorkflow', async (req: Request, res: Response) => {

    const config = getConfig();

    const workflowParameterObj = initWorkflowParameterObj();

    const result = await runWorkflow(config, workflowParameterObj);

    res.send({
        message: 'runWorkflow API called!',
        result: result
    });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});