const { src: _srcScript } = require('../llm/scripts/structure');
const directNeuralHelp = require('../llm/models/yandex/directNeuralHelp');

async function getProjectStructure(A_TYPE, DEPS) {
    const foldersScript = _srcScript(A_TYPE, DEPS);

    let structure = await directNeuralHelp({
        temperature: 0.6,
        maxTokens: 8000,
        mainMessage: foldersScript,
        messages: []
    });

    // Убираем возможное оформление markdown
    structure = structure.replace(/```json/g, '').replace(/`/g, '');
    return JSON.parse(structure);
}

module.exports = { getProjectStructure };
