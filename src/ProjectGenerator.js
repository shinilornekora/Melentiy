const fs = require('fs').promises;
const path = require('path');

const {
    name: _nameScript,
    arch: _archScript,
    deps: _depsScript,
    settings: _settingsScript
} = require('./utils/scripts/settings');

const {
    src: _srcScript,
    readmes: _readmesScript,
} = require('./utils/scripts/structure');

const directNeuralHelp = require('./utils/models/yandex/directNeuralHelp');

const BASE_PATH = '../test_projects';
const ARCH_TYPES = ['fsd', 'microfronts', 'module', 'clean', 'ddd'];

class ProjectGenerator {
    constructor(text) {
        this.description = text;
        this.project = {};
    }

    async _getProjectMainSettings() {
        const mainSettingsScript = _settingsScript();
        const basicScripts = [
            _nameScript(this.description),
            _archScript(this.description),
            _depsScript(this.description)
        ].map(script => ({ role: 'user', text: script }));
    
        return await directNeuralHelp({
            temperature: 0.6,
            maxTokens: 8000,
            mainMessage: mainSettingsScript,
            messages: basicScripts
        });
    }

    // More like a helper... Let it be like this until now.
    async parseSettings(rawSettings) {
        const finalSettings = {};
    
        try {
            rawSettings.split('\n').filter(Boolean).filter(sym => !['{', '}'].includes(sym)).forEach((value) => {
                const [fieldType, fieldValue] = value.split(': ');
                finalSettings[fieldType] = fieldValue;
            });
        } catch (err) {
            throw new Error('Failed to parse settings');
        }

        return finalSettings;
    }

    async getProjectSettings() {
        const rawSettings = await this._getProjectMainSettings();    
        const settings = await this.parseSettings(rawSettings);

        console.log('Settings were generated successfully.');
        console.log(settings)

        this.project.settings = settings;
    }

    async getProjectStructure() {
        let { A_TYPE, DEPS } = this.project.settings;

        const [ A_INDEX, EXPLANATION ] = A_TYPE.split(' - ');

        if (!ARCH_TYPES[Number(A_INDEX)]) {
            throw new Error(```
                Model gave non-existing arch type.
                Her explanation: ${EXPLANATION}
            ```);
        }
        
        const foldersScript = _srcScript(A_TYPE, DEPS);
    
        let structure = await directNeuralHelp({
            temperature: 0.6,
            maxTokens: 8000,
            mainMessage: foldersScript,
            messages: []
        });
    
        // Sometimes model can return json in markdown
        structure = structure.replace(/```json/g, '');
        structure = structure.replace(/`/g, '');

        // We'll catch it at root.
        structure = JSON.parse(structure)
    
        console.log('Structure was generated successfully.');
        console.log(structure);

        this.project.structure = structure;
    }

    async insertREADMEFilesInOuterFolders() {
        let { structure } = this.project;
        const { P_NAME: projectName } = this.project.settings;

        if (!structure) {
            throw new Error('Structure of the src folder wasn\'t finished.')
        }

        // TODO: Need to persue model to avoid such tricks
        // TODO_COMMENT_2024: seems like impossible for now, waiting for the next gen...
        if (structure.src) {
            structure = structure.src;
        }

        const readmeContents = {};
    
        const generateFolderReadme = async (folderName, subfolders) => {
            const description = _readmesScript(folderName, subfolders);
    
            return await directNeuralHelp({
                temperature: 0.6,
                maxTokens: 1500,
                mainMessage: description,
                messages: []
            });
        };
    
        for (const [folderName, subfolders] of Object.entries(structure)) {
            const readmeContent = await generateFolderReadme(folderName, subfolders);
            readmeContents[folderName] = readmeContent;
        }

        const mergedStructure = Object.keys(structure).reduce((acc, key) => {
            acc[key] = {
              files: structure[key],
              readme: readmeContents[key] || 'No README provided.'
            };
    
            return acc;
        }, {});

        console.log('README.md-s were inserted successfully.');
        console.log(mergedStructure);

        this.project.structure = {
            [projectName]: {
                src: mergedStructure
            }
        }
    }

    async insertPackageJSONInProjectStructure() {
        const { DEPS, P_NAME } = this.project.settings;
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
            description: this.description,
            scripts: {
                start: "nodemon -e js,css,html ./index.js",
            },
            dependencies: dependencies,
            devDependencies: {
                nodemon: "3.1.7"
            }
        };
        
        this.project.structure = {
            ...this.project.structure,
            [P_NAME]: {
                ...this.project.structure[P_NAME],
                'package.json': JSON.stringify(packageJsonContent)
            }
        }
    }

    async createRealProjectStructure(structure, basePath = BASE_PATH) {
        for (const [key, value] of Object.entries(structure)) {
            const currentPath = path.join(basePath, key);
    
            // For cascade insert, e.g. READMEs
            if (typeof value === 'object' && !Array.isArray(value)) {
                console.log(currentPath, { recursive: true });
    
                await fs.mkdir(currentPath, { recursive: true });
    
                if (value.readme) {
                    const readmePath = path.join(currentPath, 'README.md');

                    await fs.writeFile(readmePath, value.readme);
                }
    
                await this.createRealProjectStructure(value, currentPath);
            }
    
            // For empty files
            if (Array.isArray(value)) {
                for (const file of value) {
                    const filePath = path.join(basePath, key, file);
    
                    const dirPath = path.dirname(filePath);
                    await fs.mkdir(dirPath, { recursive: true });
    
                    await fs.writeFile(filePath, '');
                }
            }

            // For contentful files that have extension
            if (typeof value === 'string' && key.includes('.')) {
                console.log('\n', currentPath, '\n')
                await fs.writeFile(currentPath, value)
            }
        }
    }

    async build() {
        await this.getProjectSettings();
        await this.getProjectStructure();
        await this.insertREADMEFilesInOuterFolders();
        await this.insertPackageJSONInProjectStructure();
        await this.createRealProjectStructure(this.project.structure);

        console.log('Real project was generated successfully.')
    }

    // UX-method.
    async generateProject() {
        try {
            await this.build();
        } catch (error) {
            console.log('Project wasn\'t generated.');
            console.error(error);
        }
    }
}

module.exports = ProjectGenerator;