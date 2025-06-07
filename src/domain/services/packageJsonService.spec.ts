import { insertPackageJSONInProjectStructure } from './packageJsonService';
import { execSync } from 'child_process';
import { Settings, Structure } from "../types";

jest.mock('child_process', () => ({
    execSync: jest.fn()
}));

const execSyncMock = execSync as jest.Mock;

describe('insertPackageJSONInProjectStructure', () => {

    beforeAll(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should insert a package.json into the structure with correct content', async () => {
        const structure: Record<string, any> = {
            'my-project': {
                'src': {}
            }
        };
        const settings: Settings = {
            DEPS: 'lodash',
            P_NAME: 'my-project',
            builder: 'webpack',
            A_TYPE: 'ddd',
            transpilerDeps: []
        };
        const description = 'Sample project';

        execSyncMock.mockImplementation((command: string) => {
            if (command.startsWith('npm show lodash version')) {
                return '4.17.21';
            } else if (command.startsWith('npm show webpack version')) {
                return '5.0.0';
            } else if (command.startsWith('npm show webpack-dev-server version')) {
                return '5.0.0';
            } else if (command.startsWith('npm show html-webpack-plugin version')) {
                return '5.0.0';
            } else {
                return '';
            }
        });

        await insertPackageJSONInProjectStructure({ structure, settings, description });

        const expectedContent = {
            name: 'my-project',
            version: '1.0.0',
            description: 'Sample project',
            scripts: {
                start: 'webpack-dev-server --config webpack.config.js --mode development'
            },
            dependencies: {
                'lodash': '4.17.21'
            },
            devDependencies: {
                'webpack-dev-server': '5.0.0',
                'webpack': '5.0.0',
                'html-webpack-plugin': '5.0.0'
            }
        };

        const expectedOutput = JSON.stringify(expectedContent, null, 2);
        const result = (structure['my-project'] as Record<string, any>)['package.json'];

        expect(result).toBe(expectedOutput);
    });

    it('should handle non-resolvable dependencies as 1.0.0-NON-RESOLVED', async () => {
        const structure: Structure = {
            'my-project': {}
        };
        const settings: Settings = {
            DEPS: 'non-existent',
            P_NAME: 'my-project',
            builder: 'webpack',
            A_TYPE: 'ddd',
            transpilerDeps: []
        };
        const description = 'Sample project';
        execSyncMock.mockImplementation(() => { throw new Error('npm command failed'); });

        await insertPackageJSONInProjectStructure({ structure, settings, description });

        const expectedContent = {
            name: 'my-project',
            version: '1.0.0',
            description: 'Sample project',
            scripts: {
                start: 'webpack-dev-server --config webpack.config.js --mode development'
            },
            dependencies: {
                'non-existent': '1.0.0-NON-RESOLVED'
            },
            devDependencies: {}
        };

        const expectedOutput = JSON.stringify(expectedContent, null, 2);
        const result = (structure['my-project'] as Record<string, any>)['package.json'];

        expect(result).toBe(expectedOutput);
    });

    it('should handle structured devDeps with version override', async () => {
        const structure: Record<string, any> = {
            'my-project': {}
        };
        const settings = {
            A_TYPE: 'ddd',
            DEPS: 'react',
            P_NAME: 'my-project',
            builder: 'webpack',
            transpilerDeps: []
        } as Settings;
        const description = 'Sample project';
        execSyncMock.mockImplementation((command: string) => {
            if (command.includes('react')) {
                return '17.0.2';
            } else if (command.startsWith('npm show webpack-dev-server version')) {
                return '5.0.0';
            } else if (command.startsWith('npm show html-webpack-plugin version')) {
                return '5.0.0';
            } else if (command.includes('webpack')) {
                return '5.0.0';
            } else {
                return '';
            }
        });

        await insertPackageJSONInProjectStructure({ structure, settings, description });

        const expectedContent = {
            name: 'my-project',
            version: '1.0.0',
            description: 'Sample project',
            scripts: {
                start: 'webpack-dev-server --config webpack.config.js --mode development'
            },
            dependencies: {
                'react': '17.0.2'
            },
            devDependencies: {
                'webpack-dev-server': '5.0.0',
                'webpack': '5.0.0',
                'html-webpack-plugin': '5.0.0'
            }
        };

        const expectedOutput = JSON.stringify(expectedContent, null, 2);
        const result = (structure['my-project'] as Record<string, any>)['package.json'];
        expect(result).toBe(expectedOutput);
    });

    it('should merge existing project structure', async () => {
        const existingStructure: Record<string, any> = {
            'my-project': {
                'src': {},
                'README.md': 'Existing content'
            }
        };
        const settings: Settings = {
            DEPS: 'lodash',
            P_NAME: 'my-project',
            builder: 'webpack',
            A_TYPE: 'ddd',
            transpilerDeps: []
        };
        const description = 'Sample project';

        execSyncMock.mockImplementation((command: string) => {
            if (command.includes('lodash')) {
                return '4.17.21';
            } else if (command.startsWith('npm show webpack-dev-server version')) {
                return '5.0.0';
            } else if (command.startsWith('npm show html-webpack-plugin version')) {
                return '5.0.0';
            } else if (command.includes('webpack')) {
                return '5.0.0';
            } else {
                return '';
            }
        });

        await insertPackageJSONInProjectStructure({ structure: existingStructure, settings, description });

        // console.log(existingStructure['my-project']);
        const expectedContent = '{\n' +
            '  "name": "my-project",\n' +
            '  "version": "1.0.0",\n' +
            '  "description": "Sample project",\n' +
            '  "scripts": {\n' +
            '    "start": "webpack-dev-server --config webpack.config.js --mode development"\n' +
            '  },\n' +
            '  "dependencies": {\n' +
            '    "lodash": "4.17.21"\n' +
            '  },\n' +
            '  "devDependencies": {\n' +
            '    "webpack-dev-server": "5.0.0",\n' +
            '    "webpack": "5.0.0",\n' +
            '    "html-webpack-plugin": "5.0.0"\n' +
            '  }\n' +
        '}';

        const pStructure = existingStructure['my-project'];

        expect(pStructure['README.md']).toBe('Existing content');
        expect(pStructure['package.json']).toBe(expectedContent);
    });



    it('should lowercase dependency and dev dependencies names', async () => {
        const structure: Record<string, any> = {
            'my-project': {}
        };
        const settings: Settings = {
            DEPS: 'LoDash',
            P_NAME: 'my-project',
            builder: 'webpack',
            A_TYPE: 'ddd',
            transpilerDeps: []
        };
        const description = 'Sample project';

        execSyncMock.mockImplementation((command: string) => {
            return '0.0.1';
        });

        await insertPackageJSONInProjectStructure({ structure, settings, description });

        const expectedDeps = {
            'lodash': '0.0.1'
        };
        const expectedDevDeps = {
            'webpack-dev-server': '0.0.1',
            'webpack': '0.0.1',
            'html-webpack-plugin': '0.0.1'
        };

        const result = (structure['my-project'] as Record<string, any>)['package.json'];
        const jsonContent = JSON.parse(result);
        expect(jsonContent.dependencies).toEqual(expectedDeps);
        expect(jsonContent.devDependencies).toEqual(expectedDevDeps);
    });
});