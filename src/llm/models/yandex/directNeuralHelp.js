const promises = require('fs').promises;
const extractAliceAnswer = require('./utils/extractGPTAnswer');

const SECRET_PATH = `${__dirname}/../../../secrets`;

async function readSecrets() {
    try {
        const [API_KEY, CATALOG_KEY] = await Promise.all([
            promises.readFile(`${SECRET_PATH}/__api.txt`, 'utf-8'),
            promises.readFile(`${SECRET_PATH}/__catalog.txt`, 'utf-8')
        ]);
        return { API_KEY, CATALOG_KEY };
    } catch (error) {
        throw new Error('Error reading secrets: ' + error.message);
    }
}

function createRequestHeaders(API_KEY, CATALOG_KEY) {
    return {
        "Content-Type": "application/json",
        "Authorization": `Api-Key ${API_KEY}`,
        'x-folder-id': CATALOG_KEY
    };
}

function createPrompt({ mainMessage, messages, temperature, maxTokens, MODEL_URI }) {
    return {
        modelUri: MODEL_URI,
        completionOptions: {
            stream: false,
            temperature,
            maxTokens
        },
        messages: [
            {
                role: 'system',
                text: `
                    You are the model which knows everything about frontend. 
                    No markdown or any emotions.
                    Your answers must be 100% correct.
                    Reanalyze the answer if you are not sure about it.
                    All your answers must be in English.
                    No any explicit politeness, just pure answers.
                `
            },
            { role: 'user', text: mainMessage },
            ...messages
        ]
    };
}

module.exports = async function directNeuralHelp({
    temperature = 0.6,
    maxTokens = 8000,
    mainMessage,
    messages = []
}) {
    try {
        const { API_KEY, CATALOG_KEY } = await readSecrets();
        const MODEL_URI = `gpt://${CATALOG_KEY}/yandexgpt/latest`;
        const SOURCE_URL = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion";
        
        const headers = createRequestHeaders(API_KEY, CATALOG_KEY);
        const prompt = createPrompt({ mainMessage, messages, temperature, maxTokens, MODEL_URI });

        const response = await fetch(SOURCE_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify(prompt)
        });

        if (!response.ok) {
            const { bodyUsed, redirected, status, statusText, type, url } = response;

            const rootCause = JSON.stringify(await response.json());
            const sentHeaders = JSON.stringify(headers);

            // If somnething went bad and you are kitten to handle all this strange things
            const helpText = status === 401 ? 'Wrong API key or you didn\'t provide it' :
                status === 403 ? 'Bad API key, regenerate it' : 
                status === 400 ? 'You did something bad with the request or model API structure was changed' :
                status === 429 ? 'Whoa, too many requests, model wants to sleep a little, give it a break' :
                status === 500 ? 'Model died. Try different one' :
                'UNKNOWN ERROR! Search for it there: https://yandex.cloud/ru/docs/api-design-guide/concepts/errors'


            throw new Error(`
                Failed to fetch from API.
                Possible reason: ${helpText}

                URL: ${url}
                Type: ${type}
                StatusText: ${statusText}
                MODEL URI: ${MODEL_URI}
                Status: ${status}
                Headers: ${sentHeaders}
                Body: ${rootCause}
                WasBodyUsed: ${bodyUsed}
                Redirected: ${redirected}
            `);
        }

        const data = await response.json();
        return extractAliceAnswer(data);
    } catch (error) {
        console.error('Error during directNeuralHelp:', error.message);
        throw error;
    }
};
