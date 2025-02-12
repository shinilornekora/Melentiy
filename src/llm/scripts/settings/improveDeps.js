module.exports = function getProjectImprovedDepsScript(deps, description) {
    return `
        Your task is to analyze the given stack of dependencies to check if it is good for current frontend applications.
        Main goal - search for the deps that can be dropped due to deprecation or invalide combination.
        List of deps: "${ deps }"

        **Important Rules**:
        1. NO EXPLICIT RESPONSE - YOU SHOULD RETURN ANSWER IN FORMAT LIKE: dep1, dep2, dep3
        2. DO NOT EXTEND THE SIZE OF DEPENDENCY LIST.
        3. Try to optimize it, but think twice - maybe some dep will be really useful in project with this stack

        **STRICT_RULE**:

        Keep in mind user project description. 
        Maybe they need framework, maybe they don't.
        But if they are asking of certain dep, it's better to leave it.

        DESCRIPTION: ${ description }
    `;
}
