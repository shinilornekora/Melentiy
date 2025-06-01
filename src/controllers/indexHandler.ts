import { Request, Response } from "express";
import { promises as fs } from "fs";
import { sendErrorResponse } from "./utils/sendErrorResponse.js";
import { Handler } from "../index.js";

export const indexHandler: Handler = {
    method: 'get',
    path: '/',
    action: async (req: Request, res: Response) => {
        try {
            const data = await fs.readFile('./resources/index.html');

            res.setHeader('Content-Type', 'text/html');
            res.send(data);
        } catch (err) {
            console.log(err);
            sendErrorResponse({
                res,
                statusCode: 500,
                message: 'Error reading file',
                errorDetails: null
            });
        }
    }
}