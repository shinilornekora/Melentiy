import {Message} from "../../../../../domain/types";

type Props = {
    mainMessage: string;
    messages: Message[];
    temperature: number;
    maxTokens: number;
    modelURI: string;
}

export function createPrompt({ mainMessage, messages, temperature, maxTokens, modelURI }: Props) {
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
                    No markdown or emotions.
                    Your answers must be 100% correct.
                    Reanalyze the answer if you are not sure about it.
                    All your answers must be in English.
                    No explicit politeness, just pure answers.
                `
            },
            { role: 'user', text: mainMessage },
            ...messages
        ]
    };
}
