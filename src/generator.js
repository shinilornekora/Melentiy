const {
    name: _nameScript,
    arch: _archScript,
    deps: _depsScript,
} = require('./utils/yandex/scripts');

const { directNeuralHelp } = require('./utils/yandex/directNeuralHelp');

async function _getProjectMainSettings(text) {
    const scripts = [_nameScript(text), _archScript(text), _depsScript(text)].map(script => ({
        role: 'user',
        text: script
    }))

    return await directNeuralHelp({
        temperature: 0.2,
        maxTokens: 8000,
        mainMessage: 'I want to get main settings for my project.',
        messages: scripts
    })
}

function generator() {
    const settings = _getProjectMainSettings();
    
    console.log(settings)
}

module.exports = generator;