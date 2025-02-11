const fs = require('fs').promises;
const path = require('path');
const { BASE_PATH } = require('../projectConfig');

async function createRealProjectStructure(structure, basePath = BASE_PATH) {
    for (const [key, value] of Object.entries(structure)) {
        const currentPath = path.join(basePath, key);

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

module.exports = { createRealProjectStructure };
