import { Response } from "express";

type Props = {
    res: Response;
    statusCode: number;
    message: string;
    errorDetails: string[] | null;
}

export const sendErrorResponse = ({ res, statusCode, message, errorDetails }: Props) => {
    res.status(statusCode).json({
        message,
        additionals: errorDetails ? { mainError: errorDetails } : null,
    });
};