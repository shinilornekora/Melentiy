const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const generator = require('./src/generator');

const server = express();
const PORT = 3001;
const HOSTNAME = 'http://localhost';

server.use(express.static('resources'));
server.use(bodyParser.urlencoded({ extended: true }));

const sendErrorResponse = (res, statusCode, message, errorDetails) => {
    res.status(statusCode).json({
        message,
        additionals: errorDetails ? { mainError: errorDetails } : null,
    });
};

server.post('/generate', async (req, res) => {
    const { description } = req.body;

    try {
        const generated = await generator(description);
        res.status(200).json(generated);
    } catch (err) {
        sendErrorResponse(res, 500, 'Critical error occurred during response.', err);
    }
});

server.get('/', async (_, res) => {
    try {
        const data = await fs.readFile('./resources/index.html');
        res.setHeader('Content-Type', 'text/html');
        res.send(data);
    } catch (err) {
        console.log(err);
        sendErrorResponse(res, 500, 'Error reading file');
    }
});

server.listen(PORT, () => {
    console.log('Melentiy has successfully started.');
    console.log(`Can be reached by url - ${HOSTNAME}:${PORT}/`);
});
