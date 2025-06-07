import { Request, Response } from "express";
import { indexHandler } from "./indexHandler";
import { sendErrorResponse } from "./utils/sendErrorResponse";

// Сначала делаем mock-функцию!
const readFileMock = jest.fn();

jest.mock("./utils/sendErrorResponse", () => ({
    sendErrorResponse: jest.fn()
}));

jest.mock("fs", () => ({
    ...jest.requireActual("fs"),
    promises: {
        ...jest.requireActual("fs").promises,
        readFile: (...args: any[]) => readFileMock(...args)
    }
}));

describe("indexHandler", () => {
    let mockRequest: Request;
    let mockResponse: Response;

    beforeEach(() => {
        readFileMock.mockReset();
        (sendErrorResponse as jest.Mock).mockReset();
        mockRequest = {} as Request;
        mockResponse = {
            setHeader: jest.fn(),
            send: jest.fn(),
            status: jest.fn().mockReturnThis()
        } as unknown as Response;
    });

    it("should send HTML file when reading is successful", async () => {
        const mockData = Buffer.from("<html>Test</html>");
        readFileMock.mockResolvedValue(mockData);

        await indexHandler.action(mockRequest, mockResponse);

        expect(mockResponse.setHeader).toHaveBeenCalledWith("Content-Type", "text/html");
        expect(mockResponse.send).toHaveBeenCalledWith(mockData);
    });

    it("should call sendErrorResponse when there is an error reading the file", async () => {
        const mockError = new Error("File not found");
        readFileMock.mockRejectedValue(mockError);

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
        const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        readFileMock.mockRejectedValue(mockError);

        await indexHandler.action(mockRequest, mockResponse);

        expect(consoleSpy).toHaveBeenCalledWith(mockError);
        consoleSpy.mockRestore();
    });
});
