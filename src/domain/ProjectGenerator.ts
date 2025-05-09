import { getProjectMainSettings, parseSettings, improveDependencies } from './services/settingsService.js';
import { getProjectStructure } from './services/structureService';
import { insertREADMEFilesInOuterFolders } from './services/readmeService';
import { insertRelevantBundler } from './services/bundlerService';
import { insertTranspilerIntoProjectStructure } from './services/transpilerService';
import { insertPackageJSONInProjectStructure } from './services/packageJsonService';
import { createRealProjectStructure } from './services/fileSystemService';
import { maybeExtractTextBetweenQuotes } from './services/utils.js';
import {
    insertIndexPageInProjectStructure, 
    insertBasicIndexStyles, 
    insertIndexJSFile,
} from './services/indexFilesService';

export type ARCH_TYPE = 'fsd' | 'module' | 'microfronts' | 'clean' | 'ddd';

export type Message = {
    role: string,
    text: string
};

export type Settings = {
    A_TYPE: ARCH_TYPE;
    P_NAME: string;
    DEPS: string;
    builder: 'webpack' | 'rollup' | 'vite';
    transpilerDeps: string[];
}

export type Project = {
    // Тип мало того что рекурсивный, так еще и динамический.
    // На любую попытку индексировать тип чем-то кроме отведенных полей будем возвращать структуру
    // Вот только тип ее будет сложноват, пока что поставлю any.
    [key: string]: any;
    settings: Settings;
    structure: any;
}

export class ProjectGenerator {
    private readonly description: string;
    private project: Project;

    constructor(text: string) {
        this.description = text;
        this.project = {} as Project;
    }

    async getProjectSettings() {
        const rawSettings = await getProjectMainSettings(this.description);
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

    async getAbstractProjectTree() {
        const { P_NAME } = this.project.settings;
        this.project.structure = await insertREADMEFilesInOuterFolders(this.project.structure, P_NAME);
        this.project.structure = await insertTranspilerIntoProjectStructure({ project: this.project.structure, settings: this.project.settings });
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