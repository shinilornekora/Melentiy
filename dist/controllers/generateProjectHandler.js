"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateProjectHandler = void 0;
const ProjectGenerator_1 = require("../domain/ProjectGenerator");
const sendErrorResponse_1 = require("./utils/sendErrorResponse");
exports.generateProjectHandler = {
    method: 'post',
    path: '/generate',
    action: async (req, res) => {
        const { description } = req.body;
        try {
            const generator = new ProjectGenerator_1.ProjectGenerator(description);
            await generator.generateProject();
            res.status(200).json({ message: 'Project generated successfully.' });
        }
        catch (err) {
            console.error(err);
            (0, sendErrorResponse_1.sendErrorResponse)({
                res,
                statusCode: 500,
                message: 'Critical error occurred during response.',
                errorDetails: null,
            });
        }
    }
};
