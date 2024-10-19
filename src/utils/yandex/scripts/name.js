module.exports = function getProjectNameScript(description) {
    return `
        I need to name the project somehow.
        The text below will describe the idea of it.
        Please, give me ONLY name of the project in response.
        NOTHING except name, written in camel case, in English.

        IDEA: ${description}
    `;
}