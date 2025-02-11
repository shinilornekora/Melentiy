module.exports = function getBundlerFileScript(bundler, bundlerPlugins) {
    return `
        Your task is to write JS code for bundler ${bundler} file of the js app.
        Plugins of the config file: ${ bundlerPlugins }

        **Important Rules**:
        1. You should write this file in JS language.
        2. All plugins should be used. DO NOT USE PLUGINS OTHER THAN ${ bundlerPlugins }
        3. You ALWAYS should use syntax of the latest bundler version.
        4. DO NOT WRITE ANYTHING EXCEPT JS CODE.
        5. Take your time, think more for the code.
        6. DO NOT PUT ANY MARKDOWN.
        7. If you see that the dependency is a loader, USE IT LIKE A LOADER! NOT PLUGIN!

        **Special Notes**:
        - Put a few comments to make it clear a little
    `;
}
