import { promises } from 'fs';

type Props = {
    secretPath: string;
}

export async function readSecrets({ secretPath }: Props) {
    try {
        const [API_KEY, CATALOG_KEY] = await Promise.all([
            promises.readFile(`${__dirname}/../secrets/__api.txt`, 'utf-8'),
            promises.readFile(`${__dirname}/../secrets/__catalog.txt`, 'utf-8')
        ]);
        return { API_KEY, CATALOG_KEY };
    } catch (error) {
        throw new Error('Error reading secrets.');
        console.error(error);
    }
}
