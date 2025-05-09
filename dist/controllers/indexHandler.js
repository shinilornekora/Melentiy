"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexHandler = void 0;
const fs_1 = require("fs");
const sendErrorResponse_1 = require("./utils/sendErrorResponse");
exports.indexHandler = {
    method: 'get',
    path: '/',
    action: async (req, res) => {
        try {
            const data = await fs_1.promises.readFile('./resources/index.html');
            res.setHeader('Content-Type', 'text/html');
            res.send(data);
        }
        catch (err) {
            console.log(err);
            (0, sendErrorResponse_1.sendErrorResponse)({
                res,
                statusCode: 500,
                message: 'Error reading file',
                errorDetails: null
            });
        }
    }
};
