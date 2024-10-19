const { promises } = require('fs');
const extractAliceAnswer = require('./utils/extractGPTAnswer');

module.exports = async function directNeuralHelp({
    temperature,
    maxTokens,
    mainMessage,
    messages
}) {
    const API_KEY = await promises.readFile(`${__dirname}/../../secrets/__api.txt`);
    const CATALOG_KEY = await promises.readFile(`${__dirname}/../../secrets/__catalog.txt`);
    
    const MODEL_URI = `gpt://${CATALOG_KEY}/yandexgpt/latest`;
    const SOURCE_URL = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion"

    const REQUEST_HEADERS = {
        "Content-Type": "application/json",
        "Authorization": `Api-Key ${API_KEY}`,
        'x-folder-id': CATALOG_KEY
    }

    const __PROMPT = {
        modelUri: MODEL_URI,
        completionOptions: {
            stream: false,
            temperature: temperature ?? 0.6,
            maxTokens: maxTokens ?? 8000
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
                    No any explicit poliness, just pure answers.
                `
            },
            {
                role: 'user',
                text: mainMessage
            },
            ...messages
        ]
    }

    const response = await fetch(SOURCE_URL, {
        headers: REQUEST_HEADERS,
        method: 'POST',
        body: JSON.stringify(__PROMPT)
    });

    return extractAliceAnswer(await response.json());
}