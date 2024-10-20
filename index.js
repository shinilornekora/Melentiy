const express = require('express');
const bodyParser = require('body-parser')
const fs = require('fs').promises;
const generator = require('./src/generator');

const server = express();
const PORT = 3001;
const HOSTNAME = 'http://localhost';

server.use(express.static('resources'));
server.use(bodyParser.urlencoded({ extended: true }));

server.post('/generate', (req, res) => {
    const description = req.body.description;

    try {
        const generated = generator(description);

        res.status(200).json(generated);
    } catch (err) {
        res.status(500).json({
            message: 'Critical error occured during response.',
            additionals: {
                mainError: err
            }
        })
    }
})

server.get('/', async (_, res) => {
    try {
        const data = await fs.readFile('./resources/index.html');
        res.setHeader('Content-Type', 'text/html');
        res.send(data);
    } catch (err) {
        console.log(err)
        res.status(500).send('Error reading file');
    }
});

server.listen(PORT, () => {
    console.log('Melentiy has successfully started.');
    console.log(`Can be reached by url - ${HOSTNAME}:${PORT}/`);
});
