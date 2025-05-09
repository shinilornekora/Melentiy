"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPrompt = createPrompt;
function createPrompt({ mainMessage, messages, temperature, maxTokens, modelURI }) {
    return {
        modelUri: modelURI,
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
