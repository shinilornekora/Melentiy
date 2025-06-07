import { callAlice } from './callAlice';
import { readSecrets } from './utils/readSecrets.js';
import { createRequestHeaders } from './utils/createRequestHeaders.js';
import { createPrompt } from './utils/createPrompt.js';
import { extractAliceAnswer } from './utils/extractGPTAnswer.js';

// Mocks
jest.mock('./utils/readSecrets.js', () => ({
    readSecrets: jest.fn()
}));
jest.mock('./utils/createRequestHeaders.js', () => ({
    createRequestHeaders: jest.fn()
}));
jest.mock('./utils/createPrompt.js', () => ({
    createPrompt: jest.fn()
}));
jest.mock('./utils/extractGPTAnswer.js', () => ({
    extractAliceAnswer: jest.fn()
}));

const OLD_FETCH = global.fetch;

describe('callAlice', () => {
    const baseProps = {
        temperature: 0.5,
        maxTokens: 512,
        mainMessage: 'Hello world',
        messages: [{ role: 'user', text: 'Hi' }]
    };

    const secrets = { API_KEY: "api-key", CATALOG_KEY: "cat-key" };
    const headers = { Header: "header" };
    const prompt = { foo: 'bar' };
    const modelURI = "gpt://cat-key/yandexgpt/latest";
    const promptString = JSON.stringify(prompt);
    const responseData = { response: true };
    const extractAnswerResult = 'final-answer';

    beforeEach(() => {
        jest.clearAllMocks();
        (readSecrets as jest.Mock).mockResolvedValue(secrets);
        (createRequestHeaders as jest.Mock).mockReturnValue(headers);
        (createPrompt as jest.Mock).mockReturnValue(prompt);
        (extractAliceAnswer as jest.Mock).mockReturnValue(extractAnswerResult);
    });

    afterAll(() => {
        global.fetch = OLD_FETCH;
    });

    it('returns extractAliceAnswer(data) on success', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(responseData)
        });

        const res = await callAlice(baseProps);
        expect(readSecrets).toHaveBeenCalledWith({ secretPath: './secrets' });
        expect(createRequestHeaders).toHaveBeenCalledWith({ apiKey: 'api-key', catalogKey: 'cat-key' });
        expect(createPrompt).toHaveBeenCalledWith({
            mainMessage: baseProps.mainMessage,
            messages: baseProps.messages,
            temperature: baseProps.temperature,
            maxTokens: baseProps.maxTokens,
            modelURI
        });
        expect(global.fetch).toHaveBeenCalledWith(
            "https://llm.api.cloud.yandex.net/foundationModels/v1/completion",
            {
                method: 'POST',
                headers,
                body: promptString
            }
        );
        expect(extractAliceAnswer).toHaveBeenCalledWith(responseData);
        expect(res).toBe(extractAnswerResult);
    });

    it('returns undefined if secrets are missing', async () => {
        (readSecrets as jest.Mock).mockResolvedValue(undefined);

        // Silence expected error log
        jest.spyOn(console, 'error').mockImplementation(() => {});

        const res = await callAlice(baseProps);

        expect(res).toBeUndefined();
        expect(console.error).toHaveBeenCalledWith('Secrets cannot be accessed! Operation aborted.');
    });

    it('throws error on failed fetch (401)', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 401,
            url: 'mock-url',
            type: 'basic',
            statusText: 'Unauthorized',
            bodyUsed: false,
            redirected: false,
            json: jest.fn().mockResolvedValue({ reason: 'unauthorized' })
        });

        await expect(callAlice(baseProps)).rejects.toThrow(/Wrong API key/);
    });

    it('throws error on failed fetch (403)', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 403,
            url: 'mock-url',
            type: 'basic',
            statusText: 'Forbidden',
            bodyUsed: false,
            redirected: false,
            json:jest.fn().mockResolvedValue({ reason: 'forbidden' })
        });

        await expect(callAlice(baseProps)).rejects.toThrow(/Bad API key/);
    });

    it('throws error on failed fetch (400)', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 400,
            url: 'mock-url',
            type: 'basic',
            statusText: 'Bad Request',
            bodyUsed: false,
            redirected: false,
            json: jest.fn().mockResolvedValue({ reason: 'bad request' })
        });

        await expect(callAlice(baseProps)).rejects.toThrow(/You did something bad with the request/);
    });

    it('throws error on failed fetch (429)', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 429,
            url: 'mock-url',
            type: 'basic',
            statusText: 'Too Many Requests',
            bodyUsed: false,
            redirected: false,
            json: jest.fn().mockResolvedValue({ reason: 'too many requests' })
        });

        await expect(callAlice(baseProps)).rejects.toThrow(/too many requests, model wants to sleep/);
    });

    it('throws error on failed fetch (500)', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 500,
            url: 'mock-url',
            type: 'basic',
            statusText: 'Server Error',
            bodyUsed: false,
            redirected: false,
            json: jest.fn().mockResolvedValue({ reason: 'server error' })
        });

        await expect(callAlice(baseProps)).rejects.toThrow(/Model died/);
    });

    it('throws error on unknown status', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 999,
            url: 'mock-url',
            type: 'basic',
            statusText: '???',
            bodyUsed: false,
            redirected: false,
            json: jest.fn().mockResolvedValue({ reason: 'unknown' })
        });

        await expect(callAlice(baseProps)).rejects.toThrow(/UNKNOWN ERROR!/);
    });

    it('logs and throws error on unexpected exception', async () => {
        (readSecrets as jest.Mock).mockRejectedValue(new Error('fatal'));
        jest.spyOn(console, 'error').mockImplementation(() => {});

        await expect(callAlice(baseProps)).rejects.toThrow('fatal');
        expect(console.error).toHaveBeenCalled();
    });
});