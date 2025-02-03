module.exports = function getIndexScript(htmlCode, dependencies, description) {
    return `
        Your task is to write JS code for index file of the js app.
        Dependencies of the project: ${ JSON.stringify(dependencies) }
        HTML code of the index page: 
        
        ${ htmlCode }

        **Important Rules**:
        1. You should write index JS file that will be more suitable for chosen dependencies.
        2. Do not write something complex, this file is an entrypoint.
        3. DO NOT WRITE ANYTHING EXCEPT JS CODE.
        4. Take your time, think mor the code.
        5. YOUR CODE SHOULD BE ABLE TO COMPILE VIA \`node index.js\` command
        6. DO NOT PUT ANY MARKDOWN.

        **Special Notes**:
        - Put a few comments to make it clear a little

        **Project Description**:
        "${description}"
    `;
}
