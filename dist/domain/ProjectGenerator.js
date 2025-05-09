"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectGenerator = void 0;
const settingsService_js_1 = require("./services/settingsService.js");
const structureService_1 = require("./services/structureService");
const readmeService_1 = require("./services/readmeService");
const bundlerService_1 = require("./services/bundlerService");
const transpilerService_1 = require("./services/transpilerService");
const packageJsonService_1 = require("./services/packageJsonService");
const fileSystemService_1 = require("./services/fileSystemService");
const utils_js_1 = require("./services/utils.js");
const indexFilesService_1 = require("./services/indexFilesService");
class ProjectGenerator {
    constructor(text) {
        this.description = text;
        this.project = {};
    }
    async getProjectSettings() {
        const rawSettings = await (0, settingsService_js_1.getProjectMainSettings)(this.description);
        const parsedSettings = await (0, settingsService_js_1.parseSettings)((0, utils_js_1.maybeExtractTextBetweenQuotes)(rawSettings));
        const finalSettings = await (0, settingsService_js_1.improveDependencies)(parsedSettings, this.description);
        console.log('Settings were generated successfully.');
        console.log('Final settings: ', finalSettings);
        this.project.settings = finalSettings;
    }
    async getProjectStructure() {
        this.project.structure = await (0, structureService_1.getProjectStructure)(this.project.settings);
        console.log('Structure was generated successfully.');
        console.log(this.project.structure);
    }
    async getProjectInitials() {
        await this.getProjectSettings();
        await this.getProjectStructure();
    }
    async getAbstractProjectTree() {
        const { P_NAME } = this.project.settings;
        this.project.structure = await (0, readmeService_1.insertREADMEFilesInOuterFolders)(this.project.structure, P_NAME);
        this.project.structure = await (0, transpilerService_1.insertTranspilerIntoProjectStructure)({ project: this.project.structure, settings: this.project.settings });
        this.project.structure = await (0, bundlerService_1.insertRelevantBundler)(this.project.structure, this.project.settings);
        this.project.structure = await (0, packageJsonService_1.insertPackageJSONInProjectStructure)(this.project.structure, this.project.settings, this.description);
        this.project.structure = await (0, indexFilesService_1.insertIndexPageInProjectStructure)(this.project.structure, this.project.settings, this.description);
        this.project.structure = await (0, indexFilesService_1.insertBasicIndexStyles)(this.project.structure, this.project.settings, this.description);
        this.project.structure = await (0, indexFilesService_1.insertIndexJSFile)(this.project.structure, this.project.settings, this.description);
    }
    async build() {
        await this.getProjectInitials();
        await this.getAbstractProjectTree();
        await (0, fileSystemService_1.createRealProjectStructure)(this.project.structure);
    }
    async generateProject() {
        try {
            await this.build();
            console.log('All build steps were completed. Project was generated.');
        }
        catch (error) {
            console.log('Project was NOT generated.');
            console.error(error);
        }
    }
}
exports.ProjectGenerator = ProjectGenerator;
