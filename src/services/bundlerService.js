const { bundler: _bundlerScript } = require('../llm/scripts/settings');
const { bundlerFile: _bundlerFileScript } = require('../llm/scripts/code');
const directNeuralHelp = require('../llm/models/yandex/directNeuralHelp');
const { POSSIBLE_BUNDLERS, bundlerFileName } = require('../projectConfig');
const { maybeExtractTextBetweenQuotes } = require('./utils');

async function insertRelevantBundler(project, settings) {
    const { DEPS, P_NAME } = settings;
    const bundlerScript = _bundlerScript(DEPS);

    const res = await directNeuralHelp({
        temperature: 0.6,
        maxTokens: 1500,
        mainMessage: bundlerScript,
        messages: []
    });

    const [bundler, builderDeps] = res.split(': ');

    if (!POSSIBLE_BUNDLERS.includes(bundler)) {
        throw new Error('Invalid bundler was chosen.');
    }

    // Обновляем зависимости для package.json
    settings.DEPS += `,${bundler},${builderDeps}`;

    const bundlerFileScript = _bundlerFileScript(bundler, builderDeps);
    const bundlerFileContent = await directNeuralHelp({
        temperature: 0.6,
        maxTokens: 1500,
        mainMessage: bundlerFileScript,
        messages: []
    });

    project[settings.P_NAME] = {
        ...project[settings.P_NAME],
        [bundlerFileName[bundler]]: maybeExtractTextBetweenQuotes(bundlerFileContent)
    };

    return project;
}

module.exports = { insertRelevantBundler };
