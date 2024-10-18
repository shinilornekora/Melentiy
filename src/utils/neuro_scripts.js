const { callNeuralHelp } = require('./neuro');

function getProjectName(description) {
    return callNeuralHelp(`
        I need to name the project somehow.
        The text below will describe the idea of it.
        Please, give me ONLY name of the project in response.
        NOTHING except name, written in camel case, in English.

        IDEA: ${description}
    `);
}

function getProjectArch(description) {
    return callNeuralHelp(`
        I need to define the project architecture.
        The text below will describe the idea of it.
        Please, give me ONLY architecture type of the project in response.
        NOTHING except it, WRITTEN IN CAMEL CASE, in English.

        IDEA: ${description}
    `);
}

function getProjectDeps(description, arch) {
    return callNeuralHelp(`
        I need to define the frontend project dependencies.
        The text below will describe the idea of it.
        Please, give me ONLY dependencies that can be installed via npm.
        NOTHING except it, separated by commas.

        IDEA: ${description}

        ALSO I AM USING ${arch} architecture.
    `);
}

module.exports = {
    getProjectName,
    getProjectArch,
    getProjectDeps,
}