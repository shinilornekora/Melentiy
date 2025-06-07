import { insertREADMEFilesInOuterFolders } from './readmeService';

// Mocks for dependencies
jest.mock('../../infrastructure/llm/scripts/structure/index.js', () => ({
    getReadmesScript: jest.fn((props: { folderName: string; subfolders: string[] }) =>
        `This is a generated description for ${props.folderName} with subfolders ${props.subfolders.join(', ')}`
    ),
}));
const _readmesScript: any = require('../../infrastructure/llm/scripts/structure/index.js').getReadmesScript;

jest.mock('../../infrastructure/llm/models/directNeuralHelp.js', () => ({
    directNeuralHelp: jest.fn(async (props: { temperature: number; maxTokens: number; mainMessage: string }) => {
        return `Generated README content for message: ${props.mainMessage}`;
    }),
}));
const directNeuralHelp: any = require('../../infrastructure/llm/models/directNeuralHelp.js').directNeuralHelp;

type Structure = {
    [key: string]: Structure | string[];
};

const testProjectName = 'myProject';

describe('insertREADMEFilesInOuterFolders', () => {
    it('should insert README content into outer folders in the src directory', async () => {
        const structure: Structure = {
            [testProjectName]: {
                src: {
                    folder1: ['file1.ts', 'file2.ts'],
                    folder2: ['file3.ts']
                }
            }
        };

        const result = await insertREADMEFilesInOuterFolders({ structure, projectName: testProjectName });

        for (const [folderName, files] of Object.entries<any>(result[testProjectName].src as Record<string, any>)) {
            expect(files).toHaveProperty('readme');
        }

        expect(result).toHaveProperty(testProjectName, {
            src: expect.any(Object),
        });

        for (const folder in result[testProjectName]?.src) {
            if (folder) {
                expect(_readmesScript).toHaveBeenCalledWith(expect.objectContaining({ folderName: folder }));
                expect(directNeuralHelp).toHaveBeenCalledWith(expect.any(Object));
            }
        }
    });

    it('should throw an error if structure is missing', async () => {
        await expect(insertREADMEFilesInOuterFolders({ structure: undefined, projectName: testProjectName }))
            .rejects
            .toThrow('Structure of the src folder wasn\'t finished.');
    });

    it('should set README to default message if not generated', async () => {
        // Ensure generateFolderReadme returns undefined to check the fallback
        // (Currently generateFolderReadme returns a README string, so simulating this via directNeuralHelp mock)
        directNeuralHelp.mockImplementationOnce(async () => '');

        const structure: Structure = {
            [testProjectName]: {
                src: {
                    folder1: ['file1.ts']
                }
            }
        };

        const result = await insertREADMEFilesInOuterFolders({ structure, projectName: testProjectName });
        expect(result[testProjectName].src.folder1.readme).toBe('No README provided.');
    });

    it('should handle nested structures properly', async () => {
        const structure: Structure = {
            [testProjectName]: {
                src: {
                    'nested-folder': {
                        innerFolder: ['innerFile.ts']
                    },
                    'other-folder': ['file.ts']
                }
            }
        };

        const result = await insertREADMEFilesInOuterFolders({ structure, projectName: testProjectName });

        expect(result[testProjectName].src).toHaveProperty('nested-folder', expect.any(Object));
        expect(result[testProjectName].src).toHaveProperty('other-folder.readme');
    });
});
