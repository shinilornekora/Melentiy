import { ProjectGenerator } from './ProjectGenerator.js';
import { getProjectMainSettings, parseSettings, improveDependencies, getProjectStructure, validateIndexFile, validateBundleFile, createRealProjectStructure } from './services/settingsService.js';
import { insertREADMEFilesInOuterFolders } from './services/readmeService.js';
import { insertRelevantBundler } from './services/bundlerService.js';
import { insertTranspilerIntoProjectStructure } from './services/transpilerService.js';
import { insertPackageJSONInProjectStructure } from './services/packageJsonService.js';
import { insertIndexPageInProjectStructure } from './services/indexFilesService.js';
import { of, throwError } from 'rxjs';
import { SPY } from 'jest-mock';

jest.mock('./services/settingsService.js');
jest.mock('./services/structureService.js');
jest.mock('./services/readmeService.js');
jest.mock('./services/bundlerService.js');
jest.mock('./services/transpilerService.js');
jest.mock('./services/packageJsonService.js');
jest.mock('./services/indexFilesService.js');
jest.mock('./services/fileSystemService.js');
jest.mock('./services/validateService.js');

describe('ProjectGenerator', () => {
    let projectGenerator: ProjectGenerator;

    beforeEach(() => {
        projectGenerator = new ProjectGenerator('Test project description');
    });

    it('should call build without errors and return OK', async () => {
        if (getProjectMainSettings) (getProjectMainSettings as jest.Mock).mockReturnValue(of('{"type": "module", "name": "testProject", "dependencies": {"react": "^17.0.2"}, "devDependencies": {"webpack": "^5.72.0"}, "bundler": "webpack", "transpiler": "babel"}'));
        if (parseSettings) (parseSettings as jest.Mock).mockReturnValue(of({A_TYPE: "module", P_NAME: "testProject", DEPS: {}, builder: "webpack", transpilerDeps: []}));
        if (improveDependencies) (improveDependencies as jest.Mock).mockReturnValue(
            of({
                A_TYPE: "module",
                P_NAME: "testProject",
                DEPS: { react: "^17.0.2" },
                builder: "webpack",
                transpilerDeps: ["babel"],
            })
        );
        if (getProjectStructure)
            (getProjectStructure as jest.Mock).mockReturnValue(
                of({
                    src: {
                        index: { content: 'index content' },
                    },
                })
            );
        if (insertREADMEFilesInOuterFolders) (insertREADMEFilesInOuterFolders as jest.Mock).mockImplementation((data) => of(data));
        if (insertTranspilerIntoProjectStructure) (insertTranspilerIntoProjectStructure as jest.Mock).mockImplementation((data) => of(data));
        if (insertRelevantBundler) (insertRelevantBundler as jest.Mock).mockImplementation((data) => of(data));
        if (insertPackageJSONInProjectStructure) (insertPackageJSONInProjectStructure as jest.Mock).mockImplementation((data) => of(data));
        if (insertIndexPageInProjectStructure) (insertIndexPageInProjectStructure as jest.Mock).mockImplementation((data) => of(data));
        if (createRealProjectStructure) (createRealProjectStructure as jest.Mock).mockImplementation((data) => of(data));
        if (validateIndexFile) (validateIndexFile as jest.Mock).mockImplementation((data) => of(data));
        if (validateBundleFile) (validateBundleFile as jest.Mock).mockImplementation((data) => of(data));

        const result = await projectGenerator.generateProject();
        expect(result).toBe('OK');

        expect(getProjectMainSettings as SPY).toHaveBeenCalled();
        expect(parseSettings as SPY).toHaveBeenCalled();
        expect(improveDependencies as SPY).toHaveBeenCalled();
        expect(getProjectStructure as SPY).toHaveBeenCalled();

        expect(insertREADMEFilesInOuterFolders as SPY).toHaveBeenCalled();
        expect(insertTranspilerIntoProjectStructure as SPY).toHaveBeenCalled();
        expect(insertRelevantBundler as SPY).toHaveBeenCalled();
        expect(insertPackageJSONInProjectStructure as SPY).toHaveBeenCalled();
        expect(insertIndexPageInProjectStructure as SPY).toHaveBeenCalled();
        expect(insertBasicIndexStyles as SPY).toHaveBeenCalled();
        expect(insertIndexJSFile as SPY).toHaveBeenCalled();
        expect(validateIndexFile as SPY).toHaveBeenCalled();
        expect(validateBundleFile as SPY).toHaveBeenCalled();
        expect(createRealProjectStructure as SPY).toHaveBeenCalled();
    });

    it('should return ERROR if getProjectSettings throws error and projectGenerator handles all stages correctly', async () => {
        if (getProjectMainSettings) (getProjectMainSettings as jest.Mock).mockReturnValue(throwError(() => new Error('Failed to get main settings')));

        const result = await projectGenerator.generateProject();
        expect(result).toBe('ERROR');
        expect(getProjectMainSettings as SPY).toHaveBeenCalled();
        expect(getProjectStructure as SPY).not.toHaveBeenCalled();
        expect(insertREADMEFilesInOuterFolders as SPY).not.toHaveBeenCalled();
        expect(insertTranspilerIntoProjectStructure as SPY).not.toHaveBeenCalled();
        expect(insertRelevantBundler as SPY).not.toHaveBeenCalled();
        expect(insertPackageJSONInProjectStructure as SPY).not.toHaveBeenCalled();
        expect(createRealProjectStructure as SPY).not.toHaveBeenCalled();
    });

    it('should return ERROR if getProjectStructure throws error and generateProject handles it correctly', async () => {
        if (getProjectMainSettings) (getProjectMainSettings as jest.Mock).mockReturnValue(
            of('{"type": "module", "name": "testProject", "dependencies": {},"bundler": "webpack"}')
        );
        if (parseSettings) (parseSettings as jest.Mock).mockReturnValue(of({});
        // insert empty dependencies to test getProjectInitials error
        if (improveDependencies) (improveDependencies as jest.Mock).mockReturnValue(of(initialProjectState.settings));
        if (getProjectStructure) (getProjectStructure as jest.Mock).mockReturnValue(throwError(() => new Error('Failed to get structure')));

        const result = await projectGenerator.generateProject();
        expect(result).toBe('ERROR');

        expect(getProjectMainSettings as SPY).toHaveBeenCalled();
        expect(parseSettings as SPY).toHaveBeenCalled();
        expect(improveDependencies as SPY).toHaveBeenCalled();
        expect(getProjectStructure as SPY).toHaveBeenCalled();
        expect(insertREADMEFilesInOuterFolders as SPY).not.toHaveBeenCalled();
        expect(insertTranspilerIntoProjectStructure as SPY).not.toHaveBeenCalled();
        expect(createRealProjectStructure as SPY).not.toHaveBeenCalled();
    });

    it('should return ERROR if getAbstractProjectTree throws error', async () => {
        if (getProjectMainSettings) (getProjectMainSettings as jest.Mock).mockReturnValue(of('{"type": "module", "name": "testProject", "dependencies": {}, "bundler": "webpack"}'));
        if (parseSettings) (parseSettings as jest.Mock).mockReturnValue(of({
            A_TYPE: "module",
            P_NAME: "testProject",
            DEPS: {},
            builder: "webpack",
            transpilerDeps: [],
        }));
        if (improveDependencies) (improveDependencies as jest.Mock).mockReturnValue(of({
            A_TYPE: "module",
            P_NAME: "testProject",
            DEPS: {},
            builder: "webpack",
            transpilerDeps: [],
        }));
        if (getProjectStructure)
            (getProjectStructure as jest.Mock).mockReturnValue(
                of({
                    src: {
                        index: { content: 'index content' },
                    },
                })
            );
        if (insertREADMEFilesInOuterFolders) (insertREADMEFilesInOuterFolders as jest.Mock).mockImplementation((data) => throwError(() => new Error('Failed to insert README')));

        const result = await projectGenerator.generateProject();
        expect(result).toBe('ERROR');

        expect(insertREADMEFilesInOuterFolders as SPY).toHaveBeenCalled();
        expect(insertTranspilerIntoProjectStructure as SPY).not.toHaveBeenCalled();
        expect(createRealProjectStructure as SPY).not.toHaveBeenCalled();
    });

    it('should return ERROR if convertAbstractTreeToRealFS throws error', async () => {
        (getProjectMainSettings as jest.Mock).mockReturnValue(
            of('{"type": "module", "name": "testProject", "dependencies": {"react": "^17.0.2"}, "bundler": "webpack"}')
        );
        (parseSettings as jest.Mock).mockReturnValue(
            of({
                A_TYPE: "module",
                P_NAME: "testProject",
                DEPS: { react: "^17.0.2" },
                builder: "webpack",
                transpilerDeps: [],
            })
        );
        (improveDependencies as jest.Mock).mockReturnValue(
            of({
                A_TYPE: "module",
                P_NAME: "testProject",
                DEPS: { react: "^17.0.2" },
                builder: "webpack",
                transpilerDeps: [],
            })
        );
        (getProjectStructure as jest.Mock).mockReturnValue(
            of({
                src: {
                    index: { content: 'index content' },
                },
            })
        );

        (insertREADMEFilesInOuterFolders as jest.Mock).mockImplementation((data) => of(data));
        (insertTranspilerIntoProjectStructure as jest.Mock).mockImplementation((data) => of(data));
        (insertRelevantBundler as jest.Mock).mockImplementation((data) => of(data));
        (insertPackageJSONInProjectStructure as jest.Mock).mockImplementation((data) => of(data));
        (insertIndexPageInProjectStructure as jest.Mock).mockImplementation((data) => of(data));
        (insertBasicIndexStyles as jest.Mock).mockImplementation((data) => of(data));
        (insertIndexJSFile as jest.Mock).mockImplementation((data) => of(data));
        (createRealProjectStructure as jest.Mock).mockImplementation((data) => throwError(() => new Error('Failed to create real structure')));

        const result = await projectGenerator.generateProject();
        expect(result).toBe('ERROR');

        expect(createRealProjectStructure as SPY).toHaveBeenCalled();
    });

    it('should return ERROR if any of validation errors occurs', async () => {
        (getProjectMainSettings as jest.Mock).mockReturnValue(of('{"type": "module", "name": "testProject", "dependencies": {"react": "^17.0.2"}, "bundler": "webpack"}'));
        (parseSettings as jest.Mock).mockReturnValue(of({
            A_TYPE: "module",
            P_NAME: "testProject",
            DEPS: { react: "^17.0.2" },
            builder: "webpack",
            transpilerDeps: [],
        }));
        (improveDependencies as jest.Mock).mockReturnValue(
            of({
                A_TYPE: "module",
                P_NAME: "testProject",
                DEPS: { react: "^17.0.2" },
                builder: "webpack",
                transpilerDeps: [],
            })
        );
        (getProjectStructure as jest.Mock).mockReturnValue(
            of({
                src: {
                    index: { content: 'index content' },
                },
            })
        );
        // Simulate all inner functions succeeding
        (insertREADMEFilesInOuterFolders as jest.Mock).mockImplementation((data) => of(data));
        (insertTranspilerIntoProjectStructure as jest.Mock).mockImplementation((data) => of(data));
        (insertRelevantBundler as jest.Mock).mockImplementation((data) => of(data));
        (insertPackageJSONInProjectStructure as jest.Mock).mockImplementation((data) => of(data));
        (insertIndexPageInProjectStructure as jest.Mock).mockImplementation((data) => of(data));
        (insertBasicIndexStyles as jest.Mock).mockImplementation((data) => of(data));
        (insertIndexJSFile as jest.Mock).mockImplementation((data) => of(data));
        // Simulate one validation step throwing
        (validateIndexFile as jest.Mock).mockImplementationOnce((data) => throwError(() => new Error('Index is bad')));

        const result = await projectGenerator.generateProject();
        expect(result).toBe('ERROR');

        expect(validateIndexFile as SPY).toHaveBeenCalled();
    });

    it('should not process steps if project settings or structure are empty', async () => {
        (getProjectMainSettings as jest.Mock).mockReturnValue(of('{"type": "module", "name": "testProject", "dependencies": {"react": "^17.0.2"}, "bundler": "webpack"}'));
        (parseSettings as jest.Mock).mockReturnValue(of({}));
        (improveDependencies as jest.Mock).mockReturnValue(of({}));
        (getProjectStructure as jest.Mock).mockReturnValue(of({}));

        const result = await projectGenerator.getProjectInitials();
        expect(result).rejects.toThrowError('PROJECT_INITIALS_ARE_INCORRECT');
    });

    it('should return OK if all project stages complete without errors', async () => {
        const expectedSettings = {
            A_TYPE: "module",
            P_NAME: "testProject",
            DEPS: { react: "^17.0.2" },
            builder: "webpack",
            transpilerDeps: ["babel"],
        };
        const expectedStructure = {
            testProject: {
                src: {
                    index: {
                        content: 'index content',
                    },
                    styles: {
                        "main.css": {
                            content: 'body { background-color: red; }',
                        },
                    },
                    packageJson: {},
                    webpackConfig: {},
                },
            },
        };

        (getProjectMainSettings as jest.Mock).mockReturnValue(of('{"type": "module", "name": "testProject", "dependencies": {"react": "^17.0.2"}, "bundler": "webpack"}'));
        (parseSettings as jest.Mock).mockReturnValue(of(expectedSettings));
        (improveDependencies as jest.Mock).mockReturnValue(of(expectedSettings));
        (getProjectStructure as jest.Mock).mockReturnValue(
            of({
                src: expectedStructure.testProject?.src,
            })
        );
        (insertREADMEFilesInOuterFolders as jest.Mock).mockImplementation((data) => of(data));
        (insertTranspilerIntoProjectStructure as jest.Mock).mockImplementation((data) => of(data));
        (insertRelevantBundler as jest.Mock).mockImplementation((data) => of(data));
        (insertPackageJSONInProjectStructure as jest.Mock).mockImplementation((data) => of(data));
        (insertIndexPageInProjectStructure as jest.Mock).mockImplementation((data) => of(data));
        (insertBasicIndexStyles as jest.Mock).mockImplementation((data) => of(data));
        (insertIndexJSFile as jest.Mock).mockImplementation((data) => of(data));
        (validateIndexFile as jest.Mock).mockImplementation((data) => of(data));
        (validateBundleFile as jest.Mock).mockImplementation((data) => of(data));
        (createRealProjectStructure as jest.Mock).mockImplementation((data) => of(data));

        const result = await projectGenerator.generateProject();

        expect(result).toBe('OK');
        expect(projectGenerator.project).toBeDefined();
        expect(projectGenerator.project.settings).toEqual(expectedSettings);
        expect(projectGenerator.project.structure).toEqual(expectedStructure);
    });
});
