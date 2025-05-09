"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readSecrets = readSecrets;
const fs_1 = require("fs");
async function readSecrets({ secretPath }) {
    try {
        const [API_KEY, CATALOG_KEY] = await Promise.all([
            fs_1.promises.readFile(`${secretPath}/__api.txt`, 'utf-8'),
            fs_1.promises.readFile(`${secretPath}/__catalog.txt`, 'utf-8')
        ]);
        return { API_KEY, CATALOG_KEY };
    }
    catch (error) {
        throw new Error('Error reading secrets.');
    }
}
