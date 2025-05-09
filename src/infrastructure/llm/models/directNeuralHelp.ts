import { callAlice } from "./yandex/callAlice";
import {Message} from "../../../domain/ProjectGenerator";

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
            return await callAlice(args);
    }
}

