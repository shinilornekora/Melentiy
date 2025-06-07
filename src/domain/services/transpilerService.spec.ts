import { insertTranspilerIntoProjectStructure } from './transpilerService.js';
import { directNeuralHelp } from '../../infrastructure/llm/models/directNeuralHelp.js';
import { getTranspilerFileScript as _transpilerScript } from '../../infrastructure/llm/scripts/code/index.js';

// Mock dependencies
jest.mock('../../infrastructure/llm/models/directNeuralHelp.js');
jest.mock('../../infrastructure/llm/scripts/code/index.js');

describe('insertTranspilerIntoProjectStructure', () => {
    it('should insert the .babelrc configuration into the project structure and update settings', async () => {
        // Arrange
        const P_NAME = 'project1';
        const DEPS = ['@babel/preset-env', '@babel/preset-react'];
        const transpilerScriptMock = jest.fn(() => `Some prescriptive script.`);
        const directNeuralHelpMock = jest.fn(() => Promise.resolve('@babel/preset-env,@babel/preset-react'));

        const structure: Record<string, any> = {
            [P_NAME]: {
                'package.json': {}
            }
        };
        const settings = {
            DEPS: DEPS,
            P_NAME: P_NAME
        };

        // Cast original implementations to mocked functions
        (_transpilerScript as jest.Mock) = transpilerScriptMock;
        (directNeuralHelp as jest.Mock) = directNeuralHelpMock;

        // Act
        const result = await insertTranspilerIntoProjectStructure({ structure, settings });

        // Assert
        expect(transpilerScriptMock).toHaveBeenCalledWith({ deps: DEPS });
        expect(directNeuralHelpMock).toHaveBeenCalled();
        expect(result[P_NAME]).toEqual(
            expect.objectContaining({
                '.babelrc': expect.any(String)
            })
        );
        expect(settings.transpilerDeps).toEqual(['@babel/preset-env', '@babel/preset-react']);
    });

    it('should handle the case when P_NAME is not present in structure', async () => {
        // Arrange
        const P_NAME = 'project1';
        const DEPS = ['@babel/preset-env', '@babel/preset-react'];
        const transpilerScriptMock = jest.fn(() => `Some prescriptive script.`);
        const directNeuralHelpMock = jest.fn(() => Promise.resolve('@babel/preset-env,@babel/preset-react'));

        const structure: Record<string, any> = {};
        const settings = {
            DEPS: DEPS,
            P_NAME: P_NAME
        };

        (_transpilerScript as jest.Mock) = transpilerScriptMock;
        (directNeuralHelp as jest.Mock) = directNeuralHelpMock;

        // Act
        const result = await insertTranspilerIntoProjectStructure({ structure, settings });

        // Assert
        expect(result).toHaveProperty(P_NAME);
        expect(result[P_NAME]).toEqual(
            expect.objectContaining({
                '.babelrc': expect.any(String)
            })
        );
    });

    it('should maintain existing project structure when updating', async () => {
        // Arrange
        const P_NAME = 'project1';
        const DEPS = ['@babel/preset-env'];
        const transpilerScriptMock = jest.fn(() => `Another prescriptive script.`);
        const directNeuralHelpMock = jest.fn(() => Promise.resolve('@babel/preset-env,@babel/preset-typescript'));

        const structure: Record<string, any> = {
            [P_NAME]: {
                'package.json': { name: P_NAME, version: '1.0.0' }
            }
        };
        const settings = {
            DEPS: DEPS,
            P_NAME: P_NAME
        };

        // Mock the external functions
        (_transpilerScript as jest.Mock) = transpilerScriptMock;
        (directNeuralHelp as jest.Mock) = directNeuralHelpMock;

        // Act
        const result = await insertTranspilerIntoProjectStructure({ structure, settings });

        // Assert
        expect(result[P_NAME]).toHaveProperty('package.json');
        expect(result[P_NAME]['.babelrc']).toEqual('@babel/preset-env,@babel/preset-typescript');
    });
});
