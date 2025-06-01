import { Request, Response } from 'express';
import { ProjectGenerator } from "../domain/ProjectGenerator.js";
import { sendErrorResponse } from "./utils/sendErrorResponse.js";
import { Handler } from "../index.js";

interface GenerateProjectRequestBody {
    description: string;
}

export const generateProjectHandler: Handler = {
    method: 'post',
    path: '/generate',
    action: async (req: Request<{}, {}, GenerateProjectRequestBody>, res: Response) => {
        const { description } = req.body;

        try {
            if (!description) {
                res.status(400).json({ message: 'Project description required' });
            }

            const generator = new ProjectGenerator(description);
            const result = await generator.generateProject();

            if (result === 'ERROR') {
                res.status(417).json({ message: 'Project generation failed.' })
                return;
            }

            res.status(200).json({ message: 'Project generation ended.' });
        } catch (err) {
            console.error(err)
            sendErrorResponse({
                res,
                statusCode: 500,
                message: 'Critical error occurred during response.',
                errorDetails: null,
            });
        }
    }
}