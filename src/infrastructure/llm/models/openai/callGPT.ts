import {Message} from "../../../../domain/types.js";

type Props = {
    temperature: number;
    maxTokens: number;
    mainMessage: string;
    messages: Message[];
}

export async function callGPT({
    temperature,
    maxTokens,
    mainMessage,
    messages
}: Props) {
    // Вырезал, но если что можно подключить снова.
    return null;
}
