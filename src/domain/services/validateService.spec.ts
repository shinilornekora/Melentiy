import { validateIndexFile } from './validateService';
import { validateBundleFile } from './validateService';
import { Structure, Settings } from '../types';
import { directNeuralHelp } from '../../infrastructure/llm/models/directNeuralHelp';
import { validateBundleScript } from '../../infrastructure/llm/scripts/validation/bundlerFile';
import { bundlerFileName } from '../projectConfig';

jest.mock('../../infrastructure/llm/scripts/validation/bundlerScript');
jest.mock('../projectConfig');

const mockDirectNeuralHelp = directNeuralHelp as jest.MockedFunction<typeof directNeuralHelp>;
const mockValidateBundleScript = validateBundleScript as jest.MockedFunction<typeof validateBundleScript>;
const mockBundlerFileName = bundlerFileName as any;

// Mocks
jest.mock("../../infrastructure/llm/models/directNeuralHelp.js", () => ({
    directNeuralHelp: jest.fn()
}));

jest.mock("../../infrastructure/llm/scripts/validation/index.js", () => {
    return {
        indexJSFileScript: jest.fn(() => "Improve the index.js file")
    };
});

jest.mock("./utils.js", () => ({
    maybeExtractTextBetweenQuotes: (text: string) => text.replace(/.*(".*?").*/s, '$1')
}));

describe('validateIndexFile', () => {
    const mockSettings: Settings = {
        DEPS: "react,redux",
        P_NAME: "myProject",
        builder: "webpack"
    };

    const mockStructure: Structure = {
        myProject: {
            src: {
                'index.js': "console.log('old content');"
            }
        }
    };

    it('should update the index file if there are changes in the model answer', async () => {
        (directNeuralHelp as jest.Mock).mockResolvedValueOnce("console.log('new content');");
        const expectedStructure: Structure = {
            ...mockStructure,
            myProject: {
                ...mockStructure.myProject,
                src: {
                    ...mockStructure.myProject.src,
                    indexjs: "console.log('new content');"
                }
            }
        };

        const result = await validateIndexFile({ structure: mockStructure, settings: mockSettings });
        expect(directNeuralHelp).toHaveBeenCalled();
        expect(result).toEqual(expectedStructure);
    });

    it('should not update the index file if there are no changes in the model answer', async () => {
        (directNeuralHelp as jest.Mock).mockResolvedValueOnce("console.log('old content');");
        const result = await validateIndexFile({ structure: mockStructure, settings: mockSettings });
        expect(directNeuralHelp).toHaveBeenCalled();
        expect(result).toEqual(mockStructure);
    });

    it('should throw an error when index.js file becomes an object somehow', async () => {
        const faultyStructure: Structure = {
            myProject: {
                src: {
                    'index.js': {
                        role: "user",
                        text: "console.log('content');"
                    }
                }
            }
        };

        await expect(validateIndexFile({ structure: faultyStructure, settings: mockSettings }))
            .rejects
            .toThrow('INDEX_FILE_BECAME_OBJECT_SOMEHOW');
    });

    it('should return same structure if no index.js file is found in src', async () => {
        const structureWithoutIndex = {
            myProject: {
                src: {
                    'main.js': "console.log('another content');"
                }
            }
        };

        await expect(validateIndexFile({ structure: structureWithoutIndex, settings: mockSettings }))
            .rejects
            .toThrow('INDEX_FILE_BECAME_OBJECT_SOMEHOW');
    });
});

describe('validateBundleFile', () => {
    const P_NAME = 'myProject';
    const builder = 'webpack';
    const bundlerCertainFileName = 'bundler.js';
    mockBundlerFileName[builder] = bundlerCertainFileName;

    const sampleBundleFileContent = 'console.log("original bundler file");';
    const sampleImprovedBundleFileContent = 'console.log("improved bundler file");';
    const sampleStructure: Structure = {
        [P_NAME]: {
            [bundlerCertainFileName]: sampleBundleFileContent,
            src: {
                'index.js': 'console.log("original entry point");'
            },
            packageJson: {
                name: 'my-package',
                version: '1.0.0'
            },
            webpackConfig: {
                mode: 'development'
            }
        }
    };

    beforeEach(() => {
        jest.resetAllMocks();

        mockValidateBundleScript.mockReturnValueOnce('Check and improve bundler file');
    });

    it('returns modified structure when LLM returns improved content', async () => {
        const settings: Settings = {
            P_NAME,
            builder
        };
        const expectedModifiedStructure: Structure = {
            ...sampleStructure,
            [P_NAME]: {
                ...sampleStructure[P_NAME],
                [bundlerCertainFileName]: sampleImprovedBundleFileContent,
            }
        };

        mockDirectNeuralHelp.mockResolvedValueOnce(sampleImprovedBundleFileContent);

        const result = await validateBundleFile({ structure: sampleStructure, settings });

        expect(result).toEqual(expectedModifiedStructure);
        expect(mockDirectNeuralHelp).toBeCalledWith({
            temperature: 0.3,
            maxTokens: 8000,
            mainMessage: 'Check and improve bundler file',
            messages: [
                { role: 'user', text: 'STRUCTURE: {"' + bundlerCertainFileName + '":"console.log(\\"original bundler file\\");","src":{"index.js":"console.log(\\"original entry point\\");"},"packageJson":{"name":"my-package","version":"1.0.0"},"webpackConfig":{"mode":"development"}}' }
            ]
        });
        expect(console.log).toBeCalledWith(`-- Validated bundler file [WAS_CHANGED] --`);
    });

    it('should return original structure when LLM returns the same content', async () => {
        const settings: Settings = {
            P_NAME,
            builder
        };

        mockDirectNeuralHelp.mockResolvedValueOnce(sampleBundleFileContent);

        const result = await validateBundleFile({ structure: sampleStructure, settings });

        expect(result).toEqual(sampleStructure);
        expect(mockDirectNeuralHelp).toBeCalledWith({
            temperature: 0.3,
            maxTokens: 8000,
            mainMessage: 'Check and improve bundler file',
            messages: [
                { role: 'user', text: 'STRUCTURE: {"' + bundlerCertainFileName + '":"console.log(\\"original bundler file\\");","src":{"index.js":"console.log(\\"original entry point\\");"},"packageJson":{"name":"my-package","version":"1.0.0"},"webpackConfig":{"mode":"development"}}' }
            ]
        });
        expect(console.log).toBeCalledWith(`-- Validated bundler file [NO_CHANGES] --`);
    });

    it('should log when project structure does not change', async () => {
        const settings: Settings = {
            P_NAME,
            builder
        };
        mockDirectNeuralHelp.mockResolvedValueOnce('console.log("unmodified bundler file");'); // Simulate LLM output as original

        const result = await validateBundleFile({ structure: sampleStructure, settings });

        expect(result).toEqual(sampleStructure);
        expect(console.log).toBeCalledWith(`-- Validated bundler file [NO_CHANGES] --`);
    });
});
