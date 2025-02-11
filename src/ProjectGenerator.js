const { getProjectMainSettings, parseSettings } = require('./services/settingsService.js');
const { getProjectStructure } = require('./services/structureService');
const { insertREADMEFilesInOuterFolders } = require('./services/readmeService');
const { insertRelevantBundler } = require('./services/bundlerService');
const { insertTranspilerIntoProjectStructure } = require('./services/transpilerService');
const { insertPackageJSONInProjectStructure } = require('./services/packageJsonService');
const { createRealProjectStructure } = require('./services/fileSystemService');
const { 
    insertIndexPageInProjectStructure, 
    insertBasicIndexStyles, 
    insertIndexJSFile,
} = require('./services/indexFilesService');

class ProjectGenerator {
    constructor(text) {
        this.description = text;
        this.project = {};
    }

    async getProjectSettings() {
        const rawSettings = await getProjectMainSettings(this.description);
        const settings = await parseSettings(rawSettings);
        console.log('Settings were generated successfully.');
        console.log(settings);
        this.project.settings = settings;
    }

    async getProjectStructure() {
        const { A_TYPE, DEPS } = this.project.settings;
        this.project.structure = await getProjectStructure(A_TYPE, DEPS);
        console.log('Structure was generated successfully.');
        console.log(this.project.structure);
    }

    async getProjectInitials() {
        await this.getProjectSettings();
        await this.getProjectStructure();
    }

    async getAbstractProjectTree() {
        const { P_NAME } = this.project.settings;
        this.project.structure = await insertREADMEFilesInOuterFolders(this.project.structure, P_NAME);
        this.project.structure = await insertTranspilerIntoProjectStructure(this.project.structure, this.project.settings);
        this.project.structure = await insertRelevantBundler(this.project.structure, this.project.settings);
        this.project.structure = await insertPackageJSONInProjectStructure(this.project.structure, this.project.settings, this.description);
        this.project.structure = await insertIndexPageInProjectStructure(this.project.structure, this.project.settings, this.description);
        this.project.structure = await insertBasicIndexStyles(this.project.structure, this.project.settings, this.description);
        this.project.structure = await insertIndexJSFile(this.project.structure, this.project.settings, this.description);
    }

    async build() {
        await this.getProjectInitials();
        await this.getAbstractProjectTree();
        await createRealProjectStructure(this.project.structure);
    }

    async generateProject() {
        try {
            await this.build();
            console.log('All build steps were completed. Project was generated.');
        } catch (error) {
            console.log('Project was NOT generated.');
            console.error(error);
        }
    }
}

module.exports = ProjectGenerator;
