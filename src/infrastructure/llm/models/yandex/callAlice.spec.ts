import { callAlice } from './callAlice.js';
import { readSecrets } from './utils/readSecrets.js';
import { createRequestHeaders } from './utils/createRequestHeaders.js';
import { createPrompt } from './utils/createPrompt.js';
import { extractAliceAnswer } from './utils/extractGPTAnswer.js';

const SECRET_PATH = './secrets';
const SOURCE_URL = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion";
jest.mock('./utils/readSecrets.js');
jest.mock('./utils/createRequestHeaders.js');
jest.mock('./utils/createPrompt.js');
jest.mock('./utils/extractGPTAnswer.js');

describe('callAlice', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should call the Yandex GPT API with the correct parameters', async () => {
        const secrets = {
            API_KEY: 'api-key',
            CATALOG_KEY: 'catalog-key'
        };

        (readSecrets as jest.Mock).mockResolvedValue(secrets);
        (createRequestHeaders as jest.Mock).mockReturnValue({});
        (createPrompt as jest.Mock).mockReturnValue({});
        (fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({}),
        });
        (extractAliceAnswer as jest.Mock).mockReturnValue('parsed response');

        const result = await callAlice({
            mainMessage: 'test message',
            messages: [{ role: 'user', content: 'test content' }]
        });

        expect(readSecrets).toHaveBeenCalledWith({ secretPath: SECRET_PATH });
        expect(createRequestHeaders).toHaveBeenCalledWith({ apiKey: secrets.API_KEY, catalogKey: secrets.CATALOG_KEY });
        expect(createPrompt).toHaveBeenCalledWith({
            mainMessage: 'test message',
            messages: [{ role: 'user', content: 'test content' }],
            temperature: 0.6,
            maxTokens: 8000,
            modelURI: `gpt://${secrets.CATALOG_KEY}/yandexgpt/latest`
        });
        expect(fetch).toHaveBeenCalledWith(SOURCE_URL, {
            method: 'POST',
            headers: {},
            body: JSON.stringify({})
        });
        expect(extractAliceAnswer).toHaveBeenCalledWith({});
        expect(result).toBe('parsed response');
    });

    it('should throw an error when secrets cannot be accessed', async () => {
        (readSecrets as jest.Mock).mockResolvedValue(null);

        const result = await callAlice({
            mainMessage: 'test message',
            messages: [{ role: 'user', content: 'test content' }]
        });

        expect(result).toBeUndefined();
        expect(console.error).toHaveBeenCalledWith('Secrets cannot be accessed! Operation aborted.');
    });

    it('should throw an error for a unsuccessful response with status 401', async () => {
        const secrets = {
            API_KEY: 'api-key',
            CATALOG_KEY: 'catalog-key'
        };

        (readSecrets as jest.Mock).mockResolvedValue(secrets);
        (createRequestHeaders as jest.Mock).mockReturnValue({ 'Content-Type': 'application/json' });
        (createPrompt as jest.Mock).mockReturnValue({ query: 'test query' });
        (fetch as jest.Mock).mockResolvedValue({
            ok: false,
            bodyUsed: true,
            redirected: false,
            status: 401,
            statusText: 'Unauthorized',
            type: 'default',
            url: 'https://yandex.com',
            json: () => Promise.resolve({ error: 'Invalid token' }),
        });

        await expect(callAlice({
            mainMessage: 'test message',
            messages: []
        })).rejects.toThrow('Wrong API key or you didn\'t provide it');
    });

    it('should throw an error indicating too many requests when status is 429', async () => {
        const secrets = {
            API_KEY: 'api-key',
            CATALOG_KEY: 'catalog-key'
        };

        (readSecrets as jest.Mock).mockResolvedValue(secrets);
        (createRequestHeaders as jest.Mock).mockReturnValue({ 'Content-Type': 'application/json' });
        (createPrompt as jest.Mock).mockReturnValue({ query: 'test query' });
        (fetch as jest.Mock).mockResolvedValue({
            ok: false,
            bodyUsed: true,
            redirected: false,
            status: 429,
            statusText: 'Too Many Requests',
            type: 'default',
            url: 'https://yandex.com',
            json: () => Promise.resolve({ error: 'Too many requests' }),
        });

        await expect(callAlice({
            mainMessage: 'test message',
            messages: []
        })).rejects.toThrow('Whoa, too many requests, model wants to sleep a little, give it a break');
    });

    it('should handle server errors when response status is 500', async () => {
        const secrets = {
            API_KEY: 'api-key',
            CATALOG_KEY: 'catalog-key'
        };

        (readSecrets as jest.Mock).mockResolvedValue(secrets);
        (createRequestHeaders as jest.Mock).mockReturnValue({ 'Content-Type': 'application/json' });
        (createPrompt as jest.Mock).mockReturnValue({ query: 'test query' });
        (fetch as jest.Mock).mockResolvedValue({
            ok: false,
            bodyUsed: true,
            redirected: false,
            status: 500,
            statusText: 'Internal Server Error',
            type: 'default',
            url: 'https://yandex.com',
            json: () => Promise.resolve({ error: 'Server error' }),
        });

        await expect(callAlice({
            mainMessage: 'test message',
            messages: []
        })).rejects.toThrow('Model died. Try different one');
    });

    it('should throw a generic error for an unexpected status', async () => {
        const secrets = {
            API_KEY: 'api-key',
            CATALOG_KEY: 'catalog-key'
        };

        (readSecrets as jest.Mock).mockResolvedValue(secrets);
        (createRequestHeaders as jest.Mock).mockReturnValue({ 'Content-Type': 'application/json' });
        (createPrompt as jest.Mock).mockReturnValue({ query: 'test query' });
        (fetch as jest.Mock).mockResolvedValue({
            ok: false,
            bodyUsed: true,
            redirected: false,
            status: 418,
            statusText: 'I\'m a teapot',
            type: 'default',
            url: 'https://yandex.com',
            json: () => Promise.resolve({ error: 'Teapot error' }),
        });

        await expect(callAlice({
            mainMessage: 'test message',
            messages: []
        })).rejects.toThrow('UNKNOWN ERROR! Search for it there: https://yandex.cloud/ru/docs/api-design-guide/concepts/errors');
    });

    it('should log caught errors but rethrow them', async () => {
        const mockError = new Error('Test error');
        (readSecrets as jest.Mock).mockResolvedValue({
            API_KEY: 'api-key',
            CATALOG_KEY: 'catalog-key'
        });
        (fetch as jest.Mock).mockImplementation(() => {
            throw mockError;
        });

        await expect(callAlice({
            mainMessage: 'test message',
            messages: []
        })).rejects.toThrow('Test error');
        expect(console.error).toHaveBeenCalledWith('Error during callAlice:', mockError);
    });
});
