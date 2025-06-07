import { getProjectMainSettings, improveDependencies, parseSettings } from './services/settingsService.js';
import { getProjectStructure } from './services/structureService.js';
import { insertREADMEFilesInOuterFolders } from './services/readmeService.js';
import { insertRelevantBundler } from './services/bundlerService.js';
import { insertTranspilerIntoProjectStructure } from './services/transpilerService.js';
import { insertPackageJSONInProjectStructure } from './services/packageJsonService.js';
import { createRealProjectStructure } from './services/fileSystemService.js';
import { maybeExtractTextBetweenQuotes } from './services/utils.js';
import {
    insertBasicIndexStyles,
    insertIndexJSFile,
    insertIndexPageInProjectStructure,
} from './services/indexFilesService.js';
import { Project } from "./types.js";
import { validateBundleFile, validateIndexFile } from "./services/validateService.js";

export const initialProjectState = {
    settings: {
        A_TYPE: "module",
        P_NAME: "unknown",
        DEPS: '',
        builder: "webpack",
        transpilerDeps: [] as string[],
    },
    structure: {}
};

export class ProjectGenerator {
    private readonly description: string;
    project: Project;

    constructor(text: string) {
        this.description = text;
        this.project = initialProjectState as Project;
    }

    async getProjectSettings() {
        console.log('[PHASE 2] Creating the initial settings for the project')
        const rawSettings = await getProjectMainSettings(this.description);

        if (!rawSettings) {
            throw new Error('NO_RAW_SETTINGS_IN_RESPONSE')
        }

        const parsedSettings = await parseSettings(maybeExtractTextBetweenQuotes(rawSettings));
        const finalSettings = await improveDependencies(parsedSettings, this.description);

        console.log('[PHASE 2] Settings were generated successfully.');

        this.project.settings = finalSettings;
    }

    async getProjectStructure() {
        console.log('[PHASE 3] Generating the initial structure for the project.')

        const projectStructure = await getProjectStructure(this.project.settings);

        if (projectStructure.src) {
            this.project.structure[this.project.settings.P_NAME] = projectStructure;
        } else {
            this.project.structure[this.project.settings.P_NAME] = {
                src: projectStructure
            }
        }

        console.log('[PHASE 3] Structure was generated successfully.');
    }

    async getProjectInitials() {
        await this.getProjectSettings();
        await this.getProjectStructure();

        const checkIfSettingsAreEmpty = Object.values(this.project.settings).length === 0
        const checkIfStructureIsEmpty = Object.values(this.project.structure).length === 0

        if (checkIfSettingsAreEmpty || checkIfStructureIsEmpty) {
            throw new Error('PROJECT_INITIALS_ARE_INCORRECT');
        }
    }

    /**
     * Этап генерации in-memory проектного дерева.
     * Оно включает в себя структуру проекта и наполнение файлов.
     */
    async getAbstractProjectTree(){
        console.log('[PHASE 3] Generating the initial tree for the project.')

        this.project.structure = await insertREADMEFilesInOuterFolders({
            structure: this.project.structure,
            projectName: this.project.settings.P_NAME,
        });
        this.project.structure = await insertTranspilerIntoProjectStructure({
            structure: this.project.structure,
            settings: this.project.settings,
        });
        this.project.structure = await insertRelevantBundler({
            structure: this.project.structure,
            settings: this.project.settings,
        });
        this.project.structure = await insertPackageJSONInProjectStructure({
            structure: this.project.structure,
            settings: this.project.settings,
            description: this.description,
        });
        this.project.structure = await insertIndexPageInProjectStructure({
            structure: this.project.structure,
            settings: this.project.settings,
            description: this.description,
        });
        this.project.structure = await insertBasicIndexStyles({
            structure: this.project.structure,
            settings: this.project.settings,
            description: this.description,
        });
        this.project.structure = await insertIndexJSFile({
            structure: this.project.structure,
            settings: this.project.settings,
            description: this.description,
        });

        console.log('[PHASE 3]: Abstract tree was generated successfully.');
    }

    /**
     * Этап валидации абстрактного дерева.
     * Здесь смотрим возможно ли исполнить все скрипты
     * Или мы начали ссылаться на несуществующие файлы.
     */
    async validateAbstractProjectTree() {
        console.log('[PHASE 4] Starting the process of project tree validation');
        for (let i = 0; i <= 5; i++) {
            this.project.structure = await validateIndexFile({
                structure: this.project.structure,
                settings: this.project.settings,
            });
        }
        console.log(`-- Validated index script file --`);

        this.project.structure = await validateBundleFile({
            structure: this.project.structure,
            settings: this.project.settings,
        })
        console.log('[PHASE 4] Ending the process of project tree validation');
    }

    async convertAbstractTreeToRealFS() {
        console.log('[PHASE 5]: Staring the process of project tree convertation');

        if (Object.values(this.project.settings).length === 0) {
            throw new Error('CANNOT_CONVERT_EMPTY_STRUCTURE');
        }

        await createRealProjectStructure(this.project.structure);
        console.log('[PHASE 6]: Ending the process of project tree convertation');
    }

    async build() {
        console.log('\n[PHASE 1] Starting the process of project generator');
        await this.getProjectInitials();
        await this.getAbstractProjectTree();
        await this.validateAbstractProjectTree();
        await this.convertAbstractTreeToRealFS();
        console.log('[LAST PHASE] All build steps were completed. Project was generated.');
    }

    async generateProject() {
        try {
            await this.build();

            return 'OK';
        } catch (error) {
            console.log('[ERROR] Project was NOT generated.');
            console.error(error);

            return 'ERROR';
        }
    }
}
