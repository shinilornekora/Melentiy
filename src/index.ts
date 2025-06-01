import { Request, Response } from "express";
import express from 'express';

import bodyParser from "body-parser";
import { generateProjectHandler } from "./controllers/generateProjectHandler.js";
import { indexHandler } from "./controllers/indexHandler.js";
import { HOSTNAME, PORT } from "./constants.js";

const server = express();
const { urlencoded } = bodyParser;

export type Handler = {
    method: 'post' | 'get';
    path: string;
    action: (req: Request, res: Response) => Promise<void>;
}

const controllers: Handler[] = [
    generateProjectHandler,
    indexHandler
]

server.use(express.static('resources'));
server.use(urlencoded({ extended: true }));
server.use("/dist/presentation", express.static("dist/presentation"));
server.use("/resources", express.static("resources"));

controllers.forEach(({ method, path, action }) => server[method](path, action))

server.listen(PORT, () => {
    console.log('Melentiy has successfully started.');
    console.log(`Index page can be reached by url - ${HOSTNAME}:${PORT}/`);
});
