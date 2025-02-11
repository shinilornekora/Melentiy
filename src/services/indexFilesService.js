const {
    indexPage: _indexPage,
    indexStyle: _indexStyle,
    indexJs: _indexScript,
} = require('../utils/scripts/code');
const directNeuralHelp = require('../utils/models/yandex/directNeuralHelp');
const { maybeExtractTextBetweenQuotes } = require('./utils');

async function insertIndexPageInProjectStructure(project, settings, description) {
    const { DEPS, P_NAME } = settings;
    const resolvedDeps = DEPS.split(',');
    const indexPageScript = _indexPage(description, resolvedDeps, project);
    const modelAnswer = await directNeuralHelp({
        temperature: 0.6,
        maxTokens: 1500,
        mainMessage: indexPageScript,
        messages: []
    });
    const pureAnswer = maybeExtractTextBetweenQuotes(modelAnswer);

    project[P_NAME] = {
        ...project[P_NAME],
        public: {
            'index.html': pureAnswer
        }
    };

    return project;
}

async function insertBasicIndexStyles(project, settings, description) {
    const { P_NAME } = settings;
    const htmlCode = project[P_NAME].public['index.html'];
    const prompt = _indexStyle(htmlCode, description);
    const modelAnswer = await directNeuralHelp({
        temperature: 0.6,
        maxTokens: 1500,
        mainMessage: prompt,
        messages: []
    });
    const pureAnswer = maybeExtractTextBetweenQuotes(modelAnswer);

    project[P_NAME] = {
        ...project[P_NAME],
        public: {
            ...project[P_NAME].public,
            'styles.css': pureAnswer
        }
    };

    return project;
}

async function insertIndexJSFile(project, settings, description) {
    const { DEPS, P_NAME } = settings;
    const resolvedDeps = DEPS.split(',');
    const htmlCode = project[P_NAME].public['index.html'];
    const prompt = _indexScript(htmlCode, resolvedDeps, description);
    const modelAnswer = await directNeuralHelp({
        temperature: 0.6,
        maxTokens: 1500,
        mainMessage: prompt,
        messages: []
    });
    const pureAnswer = maybeExtractTextBetweenQuotes(modelAnswer);

    project[P_NAME] = {
        ...project[P_NAME],
        'index.js': pureAnswer
    };

    return project;
}

module.exports = { insertIndexPageInProjectStructure, insertBasicIndexStyles, insertIndexJSFile };
