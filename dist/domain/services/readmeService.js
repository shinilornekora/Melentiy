"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertREADMEFilesInOuterFolders = insertREADMEFilesInOuterFolders;
const structure_1 = require("../../infrastructure/llm/scripts/structure");
const directNeuralHelp_1 = require("../../infrastructure/llm/models/directNeuralHelp");
async function insertREADMEFilesInOuterFolders(structure, projectName) {
    if (!structure) {
        throw new Error('Structure of the src folder wasn\'t finished.');
    }
    // Если структура обёрнута в ключ src, используем его
    if (structure.src) {
        structure = structure.src;
    }
    const readmeContents = {};
    const generateFolderReadme = async (folderName, subfolders) => {
        const description = (0, structure_1.getReadmesScript)({ folderName, subfolders });
        return await (0, directNeuralHelp_1.directNeuralHelp)({
            temperature: 0.6,
            maxTokens: 8000,
            mainMessage: description,
            messages: []
        });
    };
    for (const [folderName, subfolders] of Object.entries(structure)) {
        readmeContents[folderName] = await generateFolderReadme(folderName, subfolders);
    }
    const mergedStructure = Object.keys(structure).reduce((acc, key) => {
        acc[key] = {
            files: structure[key],
            readme: readmeContents[key] || 'No README provided.'
        };
        return acc;
    }, {});
    console.log('README.md-s were inserted successfully.');
    console.log(mergedStructure);
    return {
        [projectName]: {
            src: mergedStructure
        }
    };
}
