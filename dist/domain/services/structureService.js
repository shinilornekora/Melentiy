"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectStructure = getProjectStructure;
const structure_1 = require("../../infrastructure/llm/scripts/structure");
const directNeuralHelp_1 = require("../../infrastructure/llm/models/directNeuralHelp");
async function getProjectStructure({ A_TYPE, DEPS }) {
    const foldersScript = (0, structure_1.getProjectSrcScript)({ archType: A_TYPE, deps: DEPS });
    let structure = await (0, directNeuralHelp_1.directNeuralHelp)({
        temperature: 0.6,
        maxTokens: 8000,
        mainMessage: foldersScript,
        messages: []
    });
    // Убираем возможное оформление markdown
    structure = structure.replace(/```json/g, '').replace(/`/g, '');
    return JSON.parse(structure);
}
