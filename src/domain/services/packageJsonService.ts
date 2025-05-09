import { BUILDER_CONFIG as builderConfig } from '../projectConfig';
import { execSync as exec } from "child_process";
import {Project, Settings} from "../ProjectGenerator";

export async function insertPackageJSONInProjectStructure(project: Project, settings: Settings, description: string) {
    const { DEPS, P_NAME, builder, transpilerDeps } = settings;
    const resolvedDeps = DEPS.split(',');
    const resolvedDevDeps: Record<string, string> = {};
    const getLatestVersion = async (packageName: string) => {
        try {
            return exec(`npm show ${packageName} version`).toString().trim();
        } catch (error) {
            console.error(`Error fetching version for ${packageName}`);
            console.error(error);
        }
    };

    const dependencies: Record<string, string> = {};

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

