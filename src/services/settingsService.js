const {
    name: _nameScript,
    arch: _archScript,
    deps: _depsScript,
    settings: _settingsScript,
    bundler: _bundlerScript,
} = require('../utils/scripts/settings');
const directNeuralHelp = require('../utils/models/yandex/directNeuralHelp');

async function getProjectMainSettings(description) {
    const mainSettingsScript = _settingsScript();
    const basicScripts = [
        _nameScript(description),
        _archScript(description),
        _depsScript(description)
    ].map(script => ({ role: 'user', text: script }));

    return await directNeuralHelp({
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
                const [fieldType, fieldValue] = value.split(': ');
                finalSettings[fieldType] = fieldValue;
            });
    } catch (err) {
        throw new Error('Failed to parse settings');
    }
    return finalSettings;
}

module.exports = { getProjectMainSettings, parseSettings };
