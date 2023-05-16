import * as dotenv from "dotenv";
const express = require('express');

dotenv.config();
const port = process.env.PORT || 3000;

// express handler for GET /
const app = express();
app.get('/', (req, res) => {
    res.send(`Hello World!`);
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});