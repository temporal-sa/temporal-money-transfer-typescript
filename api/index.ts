import * as dotenv from "dotenv";
import express, {Request, Response} from 'express';

// TEMPORARY: Allow CORS for all origins
import cors from 'cors';

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
    secondsSinceServerStart += 5;
}, 5000);

app.get('/countSeconds', (req: Request, res: Response) => {
    res.send({
        message: `Seconds elapsed since the server started: ${secondsSinceServerStart}`
    });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});