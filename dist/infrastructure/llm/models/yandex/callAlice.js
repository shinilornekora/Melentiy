"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callAlice = callAlice;
const extractGPTAnswer_1 = require("./utils/extractGPTAnswer");
const createRequestHeaders_1 = require("./utils/createRequestHeaders");
const readSecrets_1 = require("./utils/readSecrets");
const createPrompt_1 = require("./utils/createPrompt");
const SECRET_PATH = './secrets';
const SOURCE_URL = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion";
const GET_MODEL_URI = (CATALOG_KEY) => `gpt://${CATALOG_KEY}/yandexgpt/latest`;
async function callAlice({ temperature = 0.6, maxTokens = 8000, mainMessage, messages = [] }) {
    try {
        const { API_KEY: apiKey, CATALOG_KEY: catalogKey } = await (0, readSecrets_1.readSecrets)({ secretPath: SECRET_PATH });
        const modelURI = GET_MODEL_URI(catalogKey);
        const headers = (0, createRequestHeaders_1.createRequestHeaders)({ apiKey, catalogKey });
        const prompt = (0, createPrompt_1.createPrompt)({ mainMessage, messages, temperature, maxTokens, modelURI });
        const response = await fetch(SOURCE_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify(prompt)
        });
        if (!response.ok) {
            const { bodyUsed, redirected, status, statusText, type, url } = response;
            const rootCause = JSON.stringify(await response.json());
            const sentHeaders = JSON.stringify(headers);
            // Если что-то пошло не так, и лень заглядывать в доку
            const helpText = status === 401 ? 'Wrong API key or you didn\'t provide it' :
                status === 403 ? 'Bad API key, regenerate it' :
                    status === 400 ? 'You did something bad with the request or model API structure was changed' :
                        status === 429 ? 'Whoa, too many requests, model wants to sleep a little, give it a break' :
                            status === 500 ? 'Model died. Try different one' :
                                'UNKNOWN ERROR! Search for it there: https://yandex.cloud/ru/docs/api-design-guide/concepts/errors';
            throw new Error(`
                Failed to fetch from API.
                Possible reason: ${helpText}

                URL: ${url}
                Type: ${type}
                StatusText: ${statusText}
                MODEL URI: ${modelURI}
                Status: ${status}
                Headers: ${sentHeaders}
                Body: ${rootCause}
                WasBodyUsed: ${bodyUsed}
                Redirected: ${redirected}
            `);
        }
        const data = await response.json();
        return (0, extractGPTAnswer_1.extractAliceAnswer)(data);
    }
    catch (error) {
        console.error('Error during callAlice:', error);
        throw error;
    }
}
