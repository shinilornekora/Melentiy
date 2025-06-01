import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function readSecrets({ secretPath }: { secretPath: string }) {
    try {
        const [API_KEY, CATALOG_KEY] = await Promise.all([
            fs.readFile(join(__dirname, '../secrets/__api.txt'), 'utf-8'),
            fs.readFile(join(__dirname, '../secrets/__catalog.txt'), 'utf-8')
        ]);
        return { API_KEY, CATALOG_KEY };
    }
    catch (error) {
        console.log('Error reading secrets.');
        console.error(error);
    }
}
