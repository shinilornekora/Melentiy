const {
    getProjectName,
    getProjectArch,
    getProjectDeps,
} = require('./utils/neuro_scripts')

function _getProjectMainSettings(text) {
    const _projectName = getProjectName(text);
    const _projectArchitecture = getProjectArch(text);
    const deps = getProjectDeps(text, _projectArchitecture);

    return {
        name: _projectName,
        arch: _projectArchitecture,
        deps: deps
    }
}

function generator() {
    const settings = _getProjectMainSettings();
}

module.exports = generator;