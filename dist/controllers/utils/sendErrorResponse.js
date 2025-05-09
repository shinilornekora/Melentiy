"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendErrorResponse = void 0;
const sendErrorResponse = ({ res, statusCode, message, errorDetails }) => {
    res.status(statusCode).json({
        message,
        additionals: errorDetails ? { mainError: errorDetails } : null,
    });
};
exports.sendErrorResponse = sendErrorResponse;
