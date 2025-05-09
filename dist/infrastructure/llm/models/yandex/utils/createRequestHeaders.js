"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRequestHeaders = createRequestHeaders;
function createRequestHeaders({ apiKey, catalogKey }) {
    return {
        "Content-Type": "application/json",
        "Authorization": `Api-Key ${apiKey}`,
        'x-folder-id': catalogKey
    };
}
