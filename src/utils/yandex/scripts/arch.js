module.exports = function getProjectArchScript(description) {
    return `
        I need to define the project architecture.
        The text below will describe the idea of it.
        Please, give me ONLY architecture type of the project in response.
        NOTHING except it, WRITTEN IN CAMEL CASE, in English.

        IDEA: ${description}
    `;
}