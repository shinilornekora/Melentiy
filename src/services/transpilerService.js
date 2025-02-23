const { transpilerFile: _transpilerScript } = require('../llm/scripts/code');
const directNeuralHelp = require('../llm/models/yandex/directNeuralHelp');
const { maybeExtractTextBetweenQuotes } = require('./utils');

async function insertTranspilerIntoProjectStructure(project, settings) {
    const { DEPS, P_NAME } = settings;
    const transpilerScript = _transpilerScript(DEPS);

    const babelFileRes = await directNeuralHelp({
        temperature: 0.6,
        maxTokens: 8000,
        mainMessage: transpilerScript,
        messages: []
    });

    console.log('Babel structure was accomplished.');
    console.log(babelFileRes);

    const maybeCleanedBabelFile = maybeExtractTextBetweenQuotes(babelFileRes)

    project[P_NAME] = {
        ...project[P_NAME],
        '.babelrc': maybeCleanedBabelFile
    };

    settings.transpilerDeps = JSON.parse(maybeCleanedBabelFile).presets;

    return project;
}

module.exports = { insertTranspilerIntoProjectStructure };
