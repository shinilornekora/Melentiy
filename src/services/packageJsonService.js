const { BUILDER_CONFIG: builderConfig } = require('../projectConfig');

async function insertPackageJSONInProjectStructure(project, settings, description) {
    const { DEPS, P_NAME, builder, transpilerDeps } = settings;
    const resolvedDeps = DEPS.split(',');
    const resolvedDevDeps = {};
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
            dependencies[dep.trim().toLowerCase()] = version;
        }
    }

    const mainBuilder = builderConfig[builder] ?? builderConfig['default'];
    const { command, devDeps } = mainBuilder;

    for (const devDep of [...devDeps, ...transpilerDeps]) {
        let currentDep = devDep;

        if (typeof devDep !== 'string') {
            currentDep = currentDep[0];
        }

        const version = await getLatestVersion(currentDep.trim());
        
        if (version) {
            resolvedDevDeps[currentDep.trim().toLowerCase()] = version;
        }
    }

    const packageJsonContent = {
        name: P_NAME,
        version: '1.0.0',
        description: description,
        scripts: {
            start: command
        },
        dependencies,
        devDependencies: {
            ...resolvedDevDeps
        }
    };

    project[P_NAME] = {
        ...project[P_NAME],
        'package.json': JSON.stringify(packageJsonContent)
    };

    return project;
}

module.exports = { insertPackageJSONInProjectStructure };
