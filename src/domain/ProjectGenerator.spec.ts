import {
    getProjectMainSettings,
    improveDependencies,
    parseSettings
} from './services/settingsService.js';
import { getProjectStructure } from './services/structureService.js';
import { insertREADMEFilesInOuterFolders } from './services/readmeService.js';
import { insertRelevantBundler } from './services/bundlerService.js';
import { insertTranspilerIntoProjectStructure } from './services/transpilerService.js';
import { insertPackageJSONInProjectStructure } from './services/packageJsonService.js';
import { createRealProjectStructure } from './services/fileSystemService.js';
import {
    insertBasicIndexStyles,
    insertIndexJSFile,
    insertIndexPageInProjectStructure,
} from './services/indexFilesService.js';
import { validateBundleFile, validateIndexFile } from './services/validateService.js';

import { ProjectGenerator } from './ProjectGenerator.js';
import {Settings} from "./types";

// Мокаем все сервисы:
jest.mock('./services/settingsService.js', () => ({
    getProjectMainSettings: jest.fn(),
    improveDependencies: jest.fn(),
    parseSettings: jest.fn()
}));
jest.mock('./services/structureService.js', () => ({
    getProjectStructure: jest.fn()
}));
jest.mock('./services/readmeService.js', () => ({
    insertREADMEFilesInOuterFolders: jest.fn()
}));
jest.mock('./services/bundlerService.js', () => ({
    insertRelevantBundler: jest.fn()
}));
jest.mock('./services/transpilerService.js', () => ({
    insertTranspilerIntoProjectStructure: jest.fn()
}));
jest.mock('./services/packageJsonService.js', () => ({
    insertPackageJSONInProjectStructure: jest.fn()
}));
jest.mock('./services/fileSystemService.js', () => ({
    createRealProjectStructure: jest.fn()
}));
jest.mock('./services/utils.js', () => ({
    maybeExtractTextBetweenQuotes: jest.fn((s: string) => s)
}));
jest.mock('./services/indexFilesService.js', () => ({
    insertBasicIndexStyles: jest.fn(),
    insertIndexJSFile: jest.fn(),
    insertIndexPageInProjectStructure: jest.fn(),
}));
jest.mock('./services/validateService.js', () => ({
    validateBundleFile: jest.fn(),
    validateIndexFile: jest.fn(),
}));

beforeEach(() => {
    jest.clearAllMocks();
});

describe('ProjectGenerator', () => {
    const RAW_SETTINGS = '"{ \\"P_NAME\\": \\"TestApp\\", \\"DEPS\\": \\"react\\" }"';
    const PARSED_SETTINGS = { A_TYPE: 'module', P_NAME: 'TestApp', DEPS: 'react', builder: 'webpack', transpilerDeps: [] };
    const IMPROVED_SETTINGS = { ...PARSED_SETTINGS, improved: true };
    const FAKE_STRUCTURE = { src: { "index.js": "" } };
    const TREE_WITH_README = { "TestApp": { src: { "index.js": "" }, "README.md": "" } };
    const TREE_WITH_TRANS = { "TestApp": { src: { "index.js": "" }, "README.md": "", "babel.config.js": "" } };
    const FINAL_TREE = { "TestApp": { src: { "index.js": "console.log('Hello')" }, "README.md": "", "babel.config.js": "" } };

    test('getProjectSettings sets project.settings', async () => {
        (getProjectMainSettings as jest.Mock).mockResolvedValue(RAW_SETTINGS);
        (parseSettings as jest.Mock).mockResolvedValue(PARSED_SETTINGS);
        (improveDependencies as jest.Mock).mockResolvedValue(IMPROVED_SETTINGS);

        const gen = new ProjectGenerator('desc');
        await gen.getProjectSettings();

        expect(getProjectMainSettings).toHaveBeenCalledWith('desc');
        expect(parseSettings).toHaveBeenCalledWith(RAW_SETTINGS);
        expect(improveDependencies).toHaveBeenCalledWith(PARSED_SETTINGS, 'desc');
        expect(gen.project.settings).toBe(IMPROVED_SETTINGS);
    });

    test('getProjectSettings throws error if no raw settings', async () => {
        (getProjectMainSettings as jest.Mock).mockResolvedValue('');
        const gen = new ProjectGenerator('desc');
        await expect(gen.getProjectSettings()).rejects.toThrow('NO_RAW_SETTINGS_IN_RESPONSE');
    });

    test('getProjectStructure sets structure (src root case)', async () => {
        const gen = new ProjectGenerator('desc');
        gen.project.settings = { ...PARSED_SETTINGS } as Settings;

        (getProjectStructure as jest.Mock).mockResolvedValue({ src: FAKE_STRUCTURE.src });

        await gen.getProjectStructure();

        expect(getProjectStructure).toHaveBeenCalledWith(PARSED_SETTINGS);
        expect(gen.project.structure["TestApp"]).toEqual({ src: FAKE_STRUCTURE.src });
    });

    test('getProjectStructure sets structure (flat case)', async () => {
        const gen = new ProjectGenerator('desc');
        gen.project.settings = { ...PARSED_SETTINGS } as Settings;

        (getProjectStructure as jest.Mock).mockResolvedValue({ "index.js": "" });

        await gen.getProjectStructure();

        expect(gen.project.structure["TestApp"]).toEqual({ src: { "index.js": "" } });
    });

    test('getAbstractProjectTree mutates structure in sequence', async () => {
        (insertREADMEFilesInOuterFolders as jest.Mock).mockResolvedValue(TREE_WITH_README);
        (insertTranspilerIntoProjectStructure as jest.Mock).mockResolvedValue(TREE_WITH_TRANS);
        (insertRelevantBundler as jest.Mock).mockResolvedValue(TREE_WITH_TRANS);
        (insertPackageJSONInProjectStructure as jest.Mock).mockResolvedValue(TREE_WITH_TRANS);
        (insertIndexPageInProjectStructure as jest.Mock).mockResolvedValue(TREE_WITH_TRANS);
        (insertBasicIndexStyles as jest.Mock).mockResolvedValue(TREE_WITH_TRANS);
        (insertIndexJSFile as jest.Mock).mockResolvedValue(FINAL_TREE);

        const gen = new ProjectGenerator('desc');
        gen.project.structure = { ...FAKE_STRUCTURE };
        gen.project.settings = { ...PARSED_SETTINGS } as Settings;

        await gen.getAbstractProjectTree();

        expect(gen.project.structure).toEqual(FINAL_TREE);
        expect(insertREADMEFilesInOuterFolders).toHaveBeenCalled();
        expect(insertTranspilerIntoProjectStructure).toHaveBeenCalled();
        expect(insertRelevantBundler).toHaveBeenCalled();
        expect(insertPackageJSONInProjectStructure).toHaveBeenCalled();
        expect(insertIndexPageInProjectStructure).toHaveBeenCalled();
        expect(insertBasicIndexStyles).toHaveBeenCalled();
        expect(insertIndexJSFile).toHaveBeenCalled();
    });

    test('validateAbstractProjectTree calls validateIndexFile several times and validateBundleFile', async () => {
        (validateIndexFile as jest.Mock).mockImplementation(async ({ structure }) => structure);
        (validateBundleFile as jest.Mock).mockImplementation(async ({ structure }) => structure);

        const gen = new ProjectGenerator('desc');
        gen.project.structure = { ...FAKE_STRUCTURE };
        gen.project.settings = { ...PARSED_SETTINGS } as Settings;

        await gen.validateAbstractProjectTree();

        expect(validateIndexFile).toHaveBeenCalledTimes(6);
        expect(validateBundleFile).toHaveBeenCalledTimes(1);
    });

    test('convertAbstractTreeToRealFS throws if settings empty', async () => {
        const gen = new ProjectGenerator('desc');
        // @ts-expect-error
        gen.project.settings = {};
        await expect(gen.convertAbstractTreeToRealFS()).rejects.toThrow('CANNOT_CONVERT_EMPTY_STRUCTURE');
    });

    test('convertAbstractTreeToRealFS calls createRealProjectStructure', async () => {
        (createRealProjectStructure as jest.Mock).mockResolvedValue(undefined);
        const gen = new ProjectGenerator('desc');
        gen.project.settings = { ...PARSED_SETTINGS } as Settings;
        gen.project.structure = { ...FAKE_STRUCTURE };

        await gen.convertAbstractTreeToRealFS();
        expect(createRealProjectStructure).toHaveBeenCalledWith(gen.project.structure);
    });

    test('generateProject calls build and returns OK', async () => {
        const gen = new ProjectGenerator('desc');
        gen.build = jest.fn().mockResolvedValue(undefined);

        const res = await gen.generateProject();
        expect(res).toBe('OK');
    });

    test('generateProject handles error in build and returns ERROR', async () => {
        const gen = new ProjectGenerator('desc');
        gen.build = jest.fn().mockImplementation(() => { throw new Error('fail') });

        const res = await gen.generateProject();
        expect(res).toBe('ERROR');
    });
});