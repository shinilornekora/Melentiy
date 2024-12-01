const fs = require('fs').promises;
const path = require('path');

const {
    name: _nameScript,
    arch: _archScript,
    deps: _depsScript,
    settings: _settingsScript
} = require('./utils/scripts/settings');

const {
    src: _srcScript,
    readmes: _readmesScript,
} = require('./utils/scripts/structure');

const directNeuralHelp = require('./utils/models/yandex/directNeuralHelp');

const ARCH_TYPES = ['fsd', 'microfronts', 'module', 'clean', 'ddd'];

async function _getProjectMainSettings(text) {
    const mainSettingsScript = _settingsScript();
    const basicScripts = [
        _nameScript(text),
        _archScript(text),
        _depsScript(text)
    ].map(script => ({ role: 'user', text: script }));

    return await directNeuralHelp({
        temperature: 0.6,
        maxTokens: 8000,
        mainMessage: mainSettingsScript,
        messages: basicScripts
    });
}

function parseSettings(rawSettings) {
    const finalSettings = {};

    try {
        rawSettings.split('\n').filter(Boolean).filter(sym => !['{', '}'].includes(sym)).forEach((value) => {
            const [fieldType, fieldValue] = value.split(': ');
            finalSettings[fieldType] = fieldValue;
        });
    } catch (err) {
        console.log('[SETTINGS]: process aborted, GPT gave bad data.');
        console.log(rawSettings);
        throw new Error('Failed to parse settings');
    }

    return finalSettings;
}

async function getProjectSettings(text) {
    const rawSettings = await _getProjectMainSettings(text);
    const finalSettings = parseSettings(rawSettings);

    console.log('Settings were generated successfully.');
    console.log(finalSettings);
    console.log('\n');

    return finalSettings;
}

async function getProjectStructure({ ARCH_TYPE, DEPS }) {
    const foldersScript = _srcScript(ARCH_TYPE, DEPS);

    let structure = await directNeuralHelp({
        temperature: 0.6,
        maxTokens: 8000,
        mainMessage: foldersScript,
        messages: []
    });

    // Sometimes model can return json in markdown
    structure = structure.replace(/```json/g, '');
    structure = structure.replace(/`/g, '');


    try {
        structure = JSON.parse(structure)
    } catch (error) {
        console.log('Model didn\'t make project structure :/');
        return;
    }

    return structure;
}

async function insertREADMEFilesInOuterFolders(SRC_STRUCTURE) {
    const readmeContents = {};

    const generateFolderReadme = async (folderName, subfolders) => {
        const description = _readmesScript(folderName, subfolders);

        return await directNeuralHelp({
            temperature: 0.6,
            maxTokens: 1500,
            mainMessage: description,
            messages: []
        });
    };

    for (const [folderName, subfolders] of Object.entries(SRC_STRUCTURE)) {
        const readmeContent = await generateFolderReadme(folderName, subfolders);
        readmeContents[folderName] = readmeContent;
    }

    return readmeContents;
}

async function createRealProjectStructure(structure, basePath = '../test_projects') {
    for (const [key, value] of Object.entries(structure)) {
        const currentPath = path.join(basePath, key);

        if (typeof value === 'object' && !Array.isArray(value)) {
            console.log(currentPath, { recursive: true });

            await fs.mkdir(currentPath, { recursive: true });

            if (value.readme) {
                const readmePath = path.join(currentPath, 'README.md');
                await fs.writeFile(readmePath, value.readme);
            }

            await createRealProjectStructure(value, currentPath);
        }

        if (Array.isArray(value)) {
            for (const file of value) {
                const filePath = path.join(basePath, key, file);

                const dirPath = path.dirname(filePath);
                await fs.mkdir(dirPath, { recursive: true });

                await fs.writeFile(filePath, '');
            }
        }
    }
}

async function generator(text) {
    const { P_NAME, A_TYPE, DEPS } = await getProjectSettings(text);

    if (!ARCH_TYPES[A_TYPE]) {
        throw new Error('Model gave non-existing arch type.');
    }

    const structure = await getProjectStructure({
        ARCH_TYPE: ARCH_TYPES[A_TYPE],
        DEPS,
    });

    if (!structure) {
        throw new Error('Structure of the src folder wasn\'t finished.')
    }

    const readmes = await insertREADMEFilesInOuterFolders(structure);

    const mergedStructure = Object.keys(structure).reduce((acc, key) => {
        acc[key] = {
          files: structure[key],
          readme: readmes[key] || 'No README provided.'
        };

        return acc;
      }, {});

    const projectStructure = {
        [P_NAME]: {
            src: mergedStructure
        }
    };

    createRealProjectStructure(projectStructure)
}

module.exports = generator;
