module.exports = function getProjectNameScript(description) {
    return `
        MAIN SETTINGS FOR PROJECT. 
        DO NOT USE ANY EXPLICIT WORDS.
        DO NOT USE ANY MARKDOWN!!

        FINAL ANSWER TEMPLATE: 

        P_NAME: <GENERATED_P_NAME>
        A_TYPE: <GENERATED A_TYPE>
        DEPS: [<GENERATED_DEP1>, <GENERATED_DEP2>, ...]
        
    `;
}