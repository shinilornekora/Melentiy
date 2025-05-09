"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRealProjectStructure = createRealProjectStructure;
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const projectConfig_1 = require("../projectConfig");
async function createRealProjectStructure(structure, basePath = projectConfig_1.BASE_PATH) {
    for (const [key, value] of Object.entries(structure)) {
        const currentPath = path_1.default.join(basePath, key);
        // Не может не быть значения - заканчиваем поиск
        if (!value) {
            return;
        }
        // Если значение – объект, создаём папку и обрабатываем рекурсивно
        if (typeof value === 'object' && !Array.isArray(value)) {
            await fs_1.promises.mkdir(currentPath, { recursive: true });
            if (value.readme) {
                await fs_1.promises.writeFile(path_1.default.join(currentPath, 'README.md'), value.readme);
            }
            await createRealProjectStructure(value, currentPath);
        }
        // Если значение – массив, создаём пустые файлы
        if (Array.isArray(value)) {
            for (const file of value) {
                const filePath = path_1.default.join(basePath, key, file);
                await fs_1.promises.mkdir(path_1.default.dirname(filePath), { recursive: true });
                await fs_1.promises.writeFile(filePath, '');
            }
        }
        // Если значение – строка и ключ содержит точку (имя файла)
        if (typeof value === 'string' && key.includes('.')) {
            await fs_1.promises.writeFile(currentPath, value);
        }
    }
}
