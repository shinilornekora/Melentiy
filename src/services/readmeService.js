const { readmes: _readmesScript } = require('../llm/scripts/structure');
const directNeuralHelp = require('../llm/models/yandex/directNeuralHelp');

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
        const description = _readmesScript(folderName, subfolders);
        return await directNeuralHelp({
            temperature: 0.6,
            maxTokens: 8000,
            mainMessage: description,
            messages: []
        });
    };

    for (const [folderName, subfolders] of Object.entries(structure)) {
        const readmeContent = await generateFolderReadme(folderName, subfolders);
        readmeContents[folderName] = readmeContent;
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

module.exports = { insertREADMEFilesInOuterFolders };
