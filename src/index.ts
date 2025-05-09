import express from 'express';
import { urlencoded } from "body-parser";
import { generateProjectHandler } from "./controllers/generateProjectHandler";
import { indexHandler } from "./controllers/indexHandler";
import { HOSTNAME, PORT } from "./constants";

const server = express();

export type Handler = {
    method: 'post' | 'get';
    path: string;
    action: (req: any, res: any) => Promise<void>;
}

const controllers: Handler[] = [
    generateProjectHandler,
    indexHandler
]

server.use(express.static('resources'));
server.use(urlencoded({ extended: true }));

controllers.forEach(({ method, path, action }) => server[method](path, action))

server.listen(PORT, () => {
    console.log('Melentiy has successfully started.');
    console.log(`Index page can be reached by url - ${HOSTNAME}:${PORT}/`);
});
