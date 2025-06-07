import { Request, Response } from "express";
import { indexHandler } from "./indexHandler";
import { promises as fs } from "fs";
import { sendErrorResponse } from "../utils/sendErrorResponse";

jest.mock("fs", () => {
    const originalModule = jest.requireActual("fs/promises");
    return {
        ...originalModule,
        readFile: jest.fn()
    };
});

jest.mock("../utils/sendErrorResponse", () => {
    return {
        sendErrorResponse: jest.fn()
    };
});

describe("indexHandler", () => {
    let mockRequest: Request;
    let mockResponse: Response;

    beforeEach(() => {
        mockRequest = {} as Request;
        mockResponse = {
            setHeader: jest.fn(),
            send: jest.fn(),
            status: jest.fn().mockReturnThis()
        } as unknown as Response;
    });

    it("should send HTML file when reading is successful", async () => {
        const mockData = Buffer.from("<html>Test</html>");
        (fs.readFile as jest.Mock).mockResolvedValue(mockData);

        await indexHandler.action(mockRequest, mockResponse);

        expect(mockResponse.setHeader).toHaveBeenCalledWith("Content-Type", "text/html");
        expect(mockResponse.send).toHaveBeenCalledWith(mockData);
    });

    it("should call sendErrorResponse when there is an error reading the file", async () => {
        const mockError = new Error("File not found");
        (fs.readFile as jest.Mock).mockRejectedValue(mockError);

        await indexHandler.action(mockRequest, mockResponse);

        expect(sendErrorResponse).toHaveBeenCalledWith({
            res: mockResponse,
            statusCode: 500,
            message: "Error reading file",
            errorDetails: null
        });
    });

    it("should log the error when there is an error reading the file", async () => {
        const mockError = new Error("File not found");
        const consoleSpy = jest.spyOn(console, "log");
        (fs.readFile as jest.Mock).mockRejectedValue(mockError);

        await indexHandler.action(mockRequest, mockResponse);

        expect(consoleSpy).toHaveBeenCalledWith(mockError);
        consoleSpy.mockRestore();
    });
});
