"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertRelevantBundler = insertRelevantBundler;
const settings_1 = require("../../infrastructure/llm/scripts/settings");
const code_1 = require("../../infrastructure/llm/scripts/code");
const directNeuralHelp_1 = require("../../infrastructure/llm/models/directNeuralHelp");
const projectConfig_1 = require("../projectConfig");
const utils_1 = require("./utils");
async function insertRelevantBundler(project, settings) {
    const { DEPS, P_NAME } = settings;
    const bundlerScript = (0, settings_1.getRelevantBundler)({ deps: DEPS });
    const res = await (0, directNeuralHelp_1.directNeuralHelp)({
        temperature: 0.6,
        maxTokens: 8000,
        mainMessage: bundlerScript,
        messages: []
    });
    const rawBuilderConfig = res.split(': ');
    if (rawBuilderConfig.length !== 2) {
        throw new Error("Invalid builder data! Expected - 2, got - " + rawBuilderConfig.length);
    }
    const [bundler, builderDeps = ''] = rawBuilderConfig;
    if (!projectConfig_1.POSSIBLE_BUNDLERS.includes(bundler)) {
        throw new Error('Invalid bundler was chosen.');
    }
    // Обновляем зависимости для package.json
    settings.DEPS += `,${bundler},${builderDeps}`;
    const bundlerFileScript = (0, code_1.getBundlerFileScript)({ bundler, bundlerPlugins: builderDeps });
    const bundlerFileContent = await (0, directNeuralHelp_1.directNeuralHelp)({
        temperature: 0.6,
        maxTokens: 8000,
        mainMessage: bundlerFileScript,
        messages: []
    });
    project[settings.P_NAME] = {
        ...project[settings.P_NAME],
        [projectConfig_1.bundlerFileName[bundler]]: (0, utils_1.maybeExtractTextBetweenQuotes)(bundlerFileContent)
    };
    settings.builder = bundler;
    return project;
}
