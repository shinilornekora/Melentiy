"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertIndexPageInProjectStructure = insertIndexPageInProjectStructure;
exports.insertBasicIndexStyles = insertBasicIndexStyles;
exports.insertIndexJSFile = insertIndexJSFile;
const code_1 = require("../../infrastructure/llm/scripts/code");
const directNeuralHelp_1 = require("../../infrastructure/llm/models/directNeuralHelp");
const utils_1 = require("./utils");
async function insertIndexPageInProjectStructure(project, settings, description) {
    const { DEPS, P_NAME } = settings;
    const resolvedDeps = DEPS.split(',');
    const indexPageScript = (0, code_1.getIndexPageScript)({
        description,
        dependencies: resolvedDeps,
        structure: project
    });
    const modelAnswer = await (0, directNeuralHelp_1.directNeuralHelp)({
        temperature: 0.6,
        maxTokens: 8000,
        mainMessage: indexPageScript,
        messages: []
    });
    const pureAnswer = (0, utils_1.maybeExtractTextBetweenQuotes)(modelAnswer);
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
    const prompt = (0, code_1.getIndexPageStylesScript)({ htmlCode, description });
    const modelAnswer = await (0, directNeuralHelp_1.directNeuralHelp)({
        temperature: 0.6,
        maxTokens: 8000,
        mainMessage: prompt,
        messages: []
    });
    const pureAnswer = (0, utils_1.maybeExtractTextBetweenQuotes)(modelAnswer);
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
    const prompt = (0, code_1.getIndexScript)({
        htmlCode,
        description,
        dependencies: resolvedDeps,
    });
    const modelAnswer = await (0, directNeuralHelp_1.directNeuralHelp)({
        temperature: 0.6,
        maxTokens: 8000,
        mainMessage: prompt,
        messages: []
    });
    const pureAnswer = (0, utils_1.maybeExtractTextBetweenQuotes)(modelAnswer);
    const indexFileName = pureAnswer.includes('react') ? 'index.jsx' : 'index.ts';
    project[P_NAME] = {
        ...project[P_NAME],
        src: {
            ...project[P_NAME].src,
            [indexFileName]: pureAnswer
        }
    };
    return project;
}
