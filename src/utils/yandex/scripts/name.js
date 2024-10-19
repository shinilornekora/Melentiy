module.exports = function getProjectNameScript(description) {
    return `
        I need to name the project from description of it.
        The text below will describe the idea of it.
        Please, give me ONLY name of the project in response.
        The NAME should be generated from description, it will be userd in lots of people!
        NOTHING except name, written in camel case, in English.

        ANSWER SHOULD LOOK LIKE THIS: P_NAME: <GENERATED_NAME>
        THAT IS FIRST SETTINGS JSON FIELD.

        IDEA: ${description}
    `;
}