import {getProjectMainSettings, improveDependencies, parseSettings} from './services/settingsService.js';
import {getProjectStructure} from './services/structureService';
import {insertREADMEFilesInOuterFolders} from './services/readmeService';
import {insertRelevantBundler} from './services/bundlerService';
import {insertTranspilerIntoProjectStructure} from './services/transpilerService';
import {insertPackageJSONInProjectStructure} from './services/packageJsonService';
import {createRealProjectStructure} from './services/fileSystemService';
import {maybeExtractTextBetweenQuotes} from './services/utils.js';
import {
    insertBasicIndexStyles,
    insertIndexJSFile,
    insertIndexPageInProjectStructure,
} from './services/indexFilesService';
import { Project } from "./types";

export class ProjectGenerator {
    private readonly description: string;
    private project: Project;

    constructor(text: string) {
        this.description = text;
        this.project = {} as Project;
    }

    async getProjectSettings() {
        const rawSettings = await getProjectMainSettings(this.description);

        if (!rawSettings) {
            throw new Error('Raw settings were NOT processed. Operation aborted.')
        }

        const parsedSettings = await parseSettings(maybeExtractTextBetweenQuotes(rawSettings));
        const finalSettings = await improveDependencies(parsedSettings, this.description);

        console.log('Settings were generated successfully.');
        console.log('Final settings: ', finalSettings);

        this.project.settings = finalSettings;
    }

    async getProjectStructure() {
        this.project.structure = await getProjectStructure(this.project.settings);

        console.log('Structure was generated successfully.');
        console.log(this.project.structure);
    }

    async getProjectInitials() {
        await this.getProjectSettings();
        await this.getProjectStructure();
    }

    async getAbstractProjectTree(){
        const settings = this.project.settings;
        const structure = this.project.structure;
        const description = this.description;

        this.project.structure = await insertREADMEFilesInOuterFolders({ structure, projectName: settings.P_NAME });
        this.project.structure = await insertTranspilerIntoProjectStructure({ structure, settings });
        this.project.structure = await insertRelevantBundler({ structure, settings });
        this.project.structure = await insertPackageJSONInProjectStructure({ structure, settings, description });
        this.project.structure = await insertIndexPageInProjectStructure({ structure, settings, description });
        this.project.structure = await insertBasicIndexStyles({ structure, settings, description });
        this.project.structure = await insertIndexJSFile({ structure, settings, description });
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