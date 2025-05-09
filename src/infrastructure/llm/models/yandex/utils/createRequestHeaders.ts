type Props = {
    apiKey: string;
    catalogKey: string;
}

export function createRequestHeaders({ apiKey, catalogKey }: Props) {
    return {
        "Content-Type": "application/json",
        "Authorization": `Api-Key ${apiKey}`,
        'x-folder-id': catalogKey
    };
}
