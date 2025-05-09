"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertTranspilerIntoProjectStructure = insertTranspilerIntoProjectStructure;
const code_1 = require("../../infrastructure/llm/scripts/code");
const directNeuralHelp_1 = require("../../infrastructure/llm/models/directNeuralHelp");
const utils_1 = require("./utils");
async function insertTranspilerIntoProjectStructure({ project, settings }) {
    const { DEPS, P_NAME } = settings;
    const transpilerScript = (0, code_1.getTranspilerFileScript)({ deps: DEPS });
    const babelFileRes = await (0, directNeuralHelp_1.directNeuralHelp)({
        temperature: 0.6,
        maxTokens: 8000,
        mainMessage: transpilerScript,
        messages: []
    });
    console.log('Babel structure was accomplished.');
    console.log(babelFileRes);
    const maybeCleanedBabelFile = (0, utils_1.maybeExtractTextBetweenQuotes)(babelFileRes);
    project[P_NAME] = {
        ...project[P_NAME],
        '.babelrc': maybeCleanedBabelFile
    };
    settings.transpilerDeps = JSON.parse(maybeCleanedBabelFile).presets;
    return project;
}
