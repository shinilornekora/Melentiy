async function insertPackageJSONInProjectStructure(project, settings, description) {
    const { DEPS, P_NAME } = settings;
    const resolvedDeps = DEPS.split(',');

    const getLatestVersion = async (packageName) => {
        const exec = require('child_process').execSync;
        try {
            const result = exec(`npm show ${packageName} version`).toString().trim();
            return result;
        } catch (error) {
            console.error(`Error fetching version for ${packageName}:`, error.message);
        }
    };

    const dependencies = {};

    for (const dep of resolvedDeps) {
        const version = await getLatestVersion(dep.trim());
        if (version) {
            dependencies[dep.trim()] = version;
        }
    }

    const packageJsonContent = {
        name: P_NAME,
        version: '1.0.0',
        description: description,
        scripts: {
            start: 'nodemon -e js,css,html ./index.js'
        },
        dependencies,
        devDependencies: {
            nodemon: '3.1.7'
        }
    };

    project[P_NAME] = {
        ...project[P_NAME],
        'package.json': JSON.stringify(packageJsonContent)
    };

    return project;
}

module.exports = { insertPackageJSONInProjectStructure };
