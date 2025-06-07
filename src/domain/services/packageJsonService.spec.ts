import { insertPackageJSONInProjectStructure } from './packageJsonService';
import { BUILDER_CONFIG as builderConfig } from '../projectConfig';
import { exec } from 'child_process';

jest.mock('child_process', () => {
    return {
        execSync: jest.fn()
    };
});

const execSyncMock = jest.mocked(exec);

describe('insertPackageJSONInProjectStructure', () => {
    const mockBuilderConfig = {
        'webpack': {
            command: 'webpack-dev-server',
            devDeps: ['webpack-cli', 'webpack']
        },
        'default': {
            command: 'npm run start',
            devDeps: ['babel', 'eslint']
        }
    };
    
    beforeAll(() => {
        jest.resetModules();
        jest.clearAllMocks();
        (builderConfig as any) = mockBuilderConfig;
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should insert a package.json into the structure with correct content', async () => {
        const structure: any = {
            'my-project': {
                'src': {}
            }
        };
        const settings = {
            DEPS: 'lodash,react',
            P_NAME: 'my-project',
            builder: 'webpack',
            transpilerDeps: ['typescript']
        };
        const description = 'Sample project';

        execSyncMock.mockImplementation((command: string) => {
            if (command.startsWith('npm show react version')) {
                return '17.0.2';
            } else if (command.startsWith('npm show eslint version')) {
                return '6.8.0';
            } else if (command.startsWith('npm show typescript version')) {
                return '4.1.3';
            } else if (command.startsWith('npm show eslint version')) {
                return '6.8.0';
            } else if (command.startsWith('npm show babel version')) {
                return '7.0.0';
            } else if (command.startsWith('npm show eslint version')) {
                return '6.8.0';
            } else if (command.startsWith('npm show webpack-cli version')) {
                return '4.0.0';
            } else if (command.startsWith('npm show webpack version')) {
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
                start: 'webpack-dev-server'
            },
            dependencies: {
                'lodash': '4.17.21',
                'react': '17.0.2'
            },
            devDependencies: {
                'webpack-cli': '4.0.0',
                'webpack': '5.0.0',
                'typescript': '4.1.3'
            }
        };

        const expectedOutput = JSON.stringify(expectedContent, null, 2);
        const result = structure['my-project']['package.json'];

        expect(result).toBe(expectedOutput);
    });

    it('should handle non-resolvable dependencies as 1.0.0-NON-RESOLVED', async () => {
        const structure: any = {
            'my-project': {}
        };
        const settings = {
            DEPS: 'non-existent',
            P_NAME: 'my-project',
            builder: 'default',
            transpilerDeps: ['non-dev-dep']
        };
        const description = 'Sample project';

        execSyncMock.mockImplementation(() => {
            throw new Error('npm command failed');
        });

        await insertPackageJSONInProjectStructure({ structure, settings, description });

        const expectedContent = {
            name: 'my-project',
            version: '1.0.0',
            description: 'Sample project',
            scripts: {
                start: 'npm run start'
            },
            dependencies: {
                'non-existent': '1.0.0-NON-RESOLVED'
            },
            devDependencies: {
                'non-dev-dep': '1.0.0-NON-RESOLVED'
            }
        };

        const expectedOutput = JSON.stringify(expectedContent, null, 2);
        const result = structure['my-project']['package.json'];

        expect(result).toBe(expectedOutput);
    });

    it('should handle structured devDeps with version override', async () => {
        const structure: any = {
            'my-project': {}
        };
        const settings = {
            DEPS: 'react',
            P_NAME: 'my-project',
            builder: 'webpack',
            transpilerDeps: [['typescript', '^4.0.0']]
        };
        const description = 'Sample project';

        execSyncMock.mockImplementation((command: string) => {
            if (command.includes('react')) {
                return '17.0.2';
            } else if (command.includes('webpack')) {
                return '5.0.0';
            } else if (command.includes('typescript')) {
                return '4.1.3'; 
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
                start: 'webpack-dev-server'
            },
            dependencies: {
                'react': '17.0.2'
            },
            devDependencies: {
                'webpack-cli': '4.0.0',
                'webpack': '5.0.0',
                'typescript': '4.1.3'
            }
        };

        const expectedOutput = JSON.stringify(expectedContent, null, 2);
        const result = structure['my-project']['package.json'];
        expect(result).toBe(expectedOutput);
    });

    it('should merge existing project structure', async () => {
        const existingStructure: any = {
            'my-project': {
                'src': {},
                'README.md': 'Existing content'
            }
        };
        const settings = {
            DEPS: 'lodash',
            P_NAME: 'my-project',
            builder: 'default',
            transpilerDeps: []
        };
        const description = 'Sample project';

        execSyncMock.mockImplementation((command: string) => {
            if (command.includes('lodash')) {
                return '4.17.21';
            } else if (command.includes('eslint')) {
                return '6.8.0';
            } else if (command.includes('babel')) {
                return '7.20.2';
            } else {
                return '';
            }
        });

        await insertPackageJSONInProjectStructure({ structure: existingStructure, settings, description });

        expect(existingStructure['my-project']).toHaveProperty('README.md', 'Existing content');
        expect(existingStructure['my-project']).toHaveProperty('package.json');
    });

    it('should lowercase dependency and dev dependencies names', async () => {
        const structure: any = {
            'my-project': {}
        };
        const settings = {
            DEPS: 'Lodash',
            P_NAME: 'my-project',
            builder: 'default',
            transpilerDeps: ['TypeScript']
        };
        const description = 'Sample project';

        execSyncMock.mockImplementation(() => {
            return '0.0.1';
        });

        await insertPackageJSONInProjectStructure({ structure, settings, description });

        const expectedDeps = {
            'lodash': '0.0.1'
        };
        const expectedDevDeps = {
            'typescript': '0.0.1'
        };

        const result = structure['my-project']['package.json'];
        const jsonContent = JSON.parse(result);
        expect(jsonContent.dependencies).toEqual(expectedDeps);
        expect(jsonContent.devDependencies).toEqual(expectedDevDeps);
    });
});
