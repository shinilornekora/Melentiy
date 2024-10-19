module.exports = function getProjectDepsScript(description) {
    return `
        I need to define the frontend project dependencies.
        They can be installed ONLY VIA NPM.
        Choose framework, useful libs, state-manager IF NEEDED.
        Print them separated by comma, like this: dep1, dep2, dep3, ...etc.
        dep1 - example of the dependency name, if you will do npm i dep1, it will install the package.
        NO RUSSIAN WORDS, ONLY DEPENDENCIES, IN LOWERCASE!
        Show me NOTHING except it. NOTHING AT ALL EXCEPT IT!!

        IDEA: ${description}
    `;
}