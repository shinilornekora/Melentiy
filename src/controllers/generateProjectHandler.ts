import { Request, Response } from 'express';
import { ProjectGenerator } from "../domain/ProjectGenerator";
import { sendErrorResponse } from "./utils/sendErrorResponse";
import { Handler } from "../index";

interface GenerateProjectRequestBody {
    description: string;
}

export const generateProjectHandler: Handler = {
    method: 'post',
    path: '/generate',
    action: async (req: Request<{}, {}, GenerateProjectRequestBody>, res: Response) => {
        const { description } = req.body;

        try {
            const generator = new ProjectGenerator(description);
            await generator.generateProject();

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