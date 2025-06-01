import { callAlice } from "./yandex/callAlice.js";

import { Message } from "../../../domain/types.js";

// Пока что хардкодим.
// Потом можно будет давать выбор модели.
const MODEL_NAME = 'yandex';

type Props = {
    temperature: number;
    maxTokens: number;
    mainMessage: string;
    messages: Message[];
}

export async function directNeuralHelp(args: Props) {
    switch(MODEL_NAME) {
        case "yandex":
            const answer = await callAlice(args);

            if (!answer) {
                throw new Error('Alice didn\'t find answer.')
            }

            return answer;
    }
}

