"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertPackageJSONInProjectStructure = insertPackageJSONInProjectStructure;
const projectConfig_1 = require("../projectConfig");
const child_process_1 = require("child_process");
async function insertPackageJSONInProjectStructure(project, settings, description) {
    const { DEPS, P_NAME, builder, transpilerDeps } = settings;
    const resolvedDeps = DEPS.split(',');
    const resolvedDevDeps = {};
    const getLatestVersion = async (packageName) => {
        try {
            return (0, child_process_1.execSync)(`npm show ${packageName} version`).toString().trim();
        }
        catch (error) {
            console.error(`Error fetching version for ${packageName}`);
            console.error(error);
        }
    };
    const dependencies = {};
    for (const dep of resolvedDeps) {
        const version = await getLatestVersion(dep.trim());
        if (version) {
            dependencies[dep.trim().toLowerCase()] = version;
        }
    }
    const mainBuilder = projectConfig_1.BUILDER_CONFIG[builder] ?? projectConfig_1.BUILDER_CONFIG['default'];
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
