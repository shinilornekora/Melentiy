const {
    name: _nameScript,
    arch: _archScript,
    deps: _depsScript,
    settings: _settingsScript,
    bundler: _bundlerScript,
    improveDeps: _depsImproveScript,
} = require('../llm/scripts/settings');
const directNeuralHelp = require('../llm/models/yandex/directNeuralHelp');

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

    console.log('Initial settings: ', finalSettings);

    return finalSettings;
}

async function improveDependencies(settings, description) {
    const { DEPS } = settings;
    const improveScript = _depsImproveScript(DEPS, description);

    const newDeps = await directNeuralHelp({
        temperature: 0.6,
        maxTokens: 8000,
        mainMessage: improveScript,
    });

    return { ...settings, DEPS: newDeps };
}

module.exports = { 
    getProjectMainSettings, 
    improveDependencies,
    parseSettings, 
};
