import path from 'path';

import { promises as fs } from 'fs';
import { BASE_PATH } from '../projectConfig';
import { Project } from "../ProjectGenerator";

export async function createRealProjectStructure(structure: Project['structure'], basePath = BASE_PATH) {
    for (const [key, value] of Object.entries<{ readme: string }>(structure)) {
        const currentPath = path.join(basePath, key);

        // Не может не быть значения - заканчиваем поиск
        if (!value) {
            return;
        }

        // Если значение – объект, создаём папку и обрабатываем рекурсивно
        if (typeof value === 'object' && !Array.isArray(value)) {
            await fs.mkdir(currentPath, { recursive: true });
            if (value.readme) {
                await fs.writeFile(path.join(currentPath, 'README.md'), value.readme);
            }
            await createRealProjectStructure(value, currentPath);
        }

        // Если значение – массив, создаём пустые файлы
        if (Array.isArray(value)) {
            for (const file of value) {
                const filePath = path.join(basePath, key, file);
                await fs.mkdir(path.dirname(filePath), { recursive: true });
                await fs.writeFile(filePath, '');
            }
        }

        // Если значение – строка и ключ содержит точку (имя файла)
        if (typeof value === 'string' && key.includes('.')) {
            await fs.writeFile(currentPath, value);
        }
    }
}
