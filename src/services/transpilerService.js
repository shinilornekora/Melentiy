const { transpilerFile: _transpilerScript } = require('../utils/scripts/code');
const directNeuralHelp = require('../utils/models/yandex/directNeuralHelp');

async function insertTranspilerIntoProjectStructure(project, settings) {
    const { DEPS, P_NAME } = settings;
    const transpilerScript = _transpilerScript(DEPS);

    const babelFileRes = await directNeuralHelp({
        temperature: 0.6,
        maxTokens: 1500,
        mainMessage: transpilerScript,
        messages: []
    });

    console.log('Babel structure was accomplished.');
    console.log(babelFileRes);

    project[P_NAME] = {
        ...project[P_NAME],
        '.babelrc': babelFileRes
    };

    return project;
}

module.exports = { insertTranspilerIntoProjectStructure };
