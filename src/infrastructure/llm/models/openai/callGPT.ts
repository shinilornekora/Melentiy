import {Message} from "../../../../domain/types";

type Props = {
    temperature: number;
    mainMessage: string;
    messages: Message[];
}

export async function callGPT({
    temperature,
    mainMessage,
    messages
}: Props) {
    // Пока не имплементировали
    return null;
}
