const {
    name: _nameScript,
    arch: _archScript,
    deps: _depsScript,
    settings: _settingsScript
} = require('./utils/yandex/scripts');

const directNeuralHelp = require('./utils/yandex/directNeuralHelp');

async function _getProjectMainSettings(text) {
    const mainSettingsScript = _settingsScript();
    const basicScripts = [_nameScript(text), _archScript(text), _depsScript(text)].map(script => ({
        role: 'user',
        text: script
    }));

    return await directNeuralHelp({
        temperature: 0.6,
        maxTokens: 8000,
        mainMessage: mainSettingsScript,
        messages: basicScripts
    })
}

async function generator(text) {
    const rawSettings = await _getProjectMainSettings(text);
    const finalSettings = {}

    try {
        rawSettings.split('\n').filter(Boolean).filter(sym => {
            return !['{', '}'].includes(sym) 
        }).map((value) => {
            const [fieldType, fieldValue] = value.split(': ');
            finalSettings[fieldType] = fieldValue
        });
    } catch (err) {
        console.log('[SETTINGS]: process aborted, GPT gave bad data.');
        console.log(rawSettings)
        return;
    }
    
    console.log('Settings were generated successfully.')
    console.log(finalSettings);
}

module.exports = generator;