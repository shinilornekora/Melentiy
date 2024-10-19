module.exports = function getProjectArchScript(description) {
    return `
        I need to define the project architecture.
        The text below will describe the idea of it.
        Please, give me ONLY A_TYPE of the project in response.
        A_TYPE MUST BE SELECTED FROM THIS: 
            - fsd (NUMBER 0)
            - microfronts (NUMBER 1)
            - module (NUMBER 2)
            - clean (NUMBER 3)
            - ddd (NUMBER 4)
        Answer should look like this:
        A_TYPE: <NUMBER_OF_A_TYPE>

        THAT IS SECOND SETTINGS JSON FIELD.

        IDEA: ${description}
    `;
}