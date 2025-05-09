"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const generateProjectHandler_1 = require("./controllers/generateProjectHandler");
const indexHandler_1 = require("./controllers/indexHandler");
const constants_1 = require("./constants");
const server = (0, express_1.default)();
const controllers = [
    generateProjectHandler_1.generateProjectHandler,
    indexHandler_1.indexHandler
];
server.use(express_1.default.static('resources'));
server.use((0, body_parser_1.urlencoded)({ extended: true }));
controllers.forEach(({ method, path, action }) => server[method](path, action));
server.listen(constants_1.PORT, () => {
    console.log('Melentiy has successfully started.');
    console.log(`Index page can be reached by url - ${constants_1.HOSTNAME}:${constants_1.PORT}/`);
});
