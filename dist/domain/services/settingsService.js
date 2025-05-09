"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectMainSettings = getProjectMainSettings;
exports.parseSettings = parseSettings;
exports.improveDependencies = improveDependencies;
const settings_1 = require("../../infrastructure/llm/scripts/settings");
const directNeuralHelp_1 = require("../../infrastructure/llm/models/directNeuralHelp");
async function getProjectMainSettings(description) {
    const mainSettingsScript = (0, settings_1.getAllSettings)();
    const basicScripts = [
        (0, settings_1.getProjectNameScript)({ description }),
        (0, settings_1.getProjectArchScript)({ description }),
        (0, settings_1.getProjectDepsScript)({ description })
    ].map(script => ({ role: 'user', text: script }));
    return await (0, directNeuralHelp_1.directNeuralHelp)({
        temperature: 0.6,
        maxTokens: 8000,
        mainMessage: mainSettingsScript,
        messages: basicScripts
    });
}
async function parseSettings(rawSettings) {
    const finalSettings = {};
    try {
        rawSettings.split('\n')
            .filter(Boolean)
            .filter(sym => !['{', '}'].includes(sym))
            .forEach((value) => {
            const rawSettingsSplitValue = value.split(': ');
            if (rawSettingsSplitValue.length !== 2) {
                throw new Error('Invalid Settings Data! Expected - 2, got - ' + rawSettingsSplitValue.length);
            }
            const [fieldType, fieldValue] = rawSettingsSplitValue;
            // TODO: Подумать, как перестроить парсинг сырых настроек.
            // @ts-expect-error: тс не проглотит конфликтующее поле.
            finalSettings[fieldType] = fieldValue;
        });
    }
    catch (err) {
        throw new Error('Failed to parse settings');
    }
    console.log('Initial settings: ', finalSettings);
    return finalSettings;
}
async function improveDependencies(settings, description) {
    const { DEPS } = settings;
    const improveScript = (0, settings_1.getProjectImprovedDepsScript)({ deps: DEPS, description });
    const newDeps = await (0, directNeuralHelp_1.directNeuralHelp)({
        temperature: 0.6,
        maxTokens: 8000,
        mainMessage: improveScript,
        messages: []
    });
    return { ...settings, DEPS: newDeps };
}
