import {Message} from "../../../../domain/ProjectGenerator";

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
