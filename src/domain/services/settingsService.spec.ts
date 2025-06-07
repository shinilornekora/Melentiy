import { parseSettings } from './settingsService.js';
import { improveDependencies } from './settingsService.js';
import { directNeuralHelp } from '../../infrastructure/llm/models/directNeuralHelp.js';
import { getProjectImprovedDepsScript as _depsImproveScript } from '../../infrastructure/llm/scripts/settings/index.js';

jest.mock('../../infrastructure/llm/models/directNeuralHelp.js', () => ({
    directNeuralHelp: jest.fn(),
}));

jest.mock('../../infrastructure/llm/scripts/settings/index.js', () => ({
    getProjectImprovedDepsScript: jest.fn(),
}));

describe('improveDependencies', () => {
    const mockSettings = {
        DEPS: 'initialDeps',
        P_NAME: 'ProjectName',
        ARCH: 'ArchitectureType',
    };

    const mockDescription = 'A great project';

    it('should call directNeuralHelp with correct parameters and return updated settings', async () => {
        const mockImprovedDeps = 'improvedDeps';
        _depsImproveScript.mockReturnValueOnce('improveScript');
        directNeuralHelp.mockResolvedValueOnce(mockImprovedDeps);

        const result = await improveDependencies(mockSettings, mockDescription);

        expect(_depsImproveScript).toHaveBeenCalledWith({ deps: 'initialDeps', description: 'A great project' });
        expect(directNeuralHelp).toHaveBeenCalledWith({
            temperature: 0.6,
            maxTokens: 8000,
            mainMessage: 'improveScript',
            messages: [],
        });

        expect(result).toEqual({
            ...mockSettings,
            DEPS: mockImprovedDeps,
        });
    });

    it('should throw an error if newDeps is not returned', async () => {
        _depsImproveScript.mockReturnValueOnce('improveScript');
        directNeuralHelp.mockResolvedValueOnce(undefined);

        await expect(improveDependencies(mockSettings, mockDescription)).rejects.toThrow(
            'Failed to improve deps'
        );
    });

    it('should throw an error if ditectNeuralHelp throws', async () => {
        _depsImproveScript.mockReturnValueOnce('improveScript');
        directNeuralHelp.mockRejectedValueOnce(new Error('LLM went wrong'));

        await expect(improveDependencies(mockSettings, mockDescription)).rejects.toThrow();
    });
});

describe('parseSettings', () => {
    it('should correctly parse the raw settings string', async () => {
        const input = `P_NAME: projectName
A_TYPE: Web Application
DEPS: [\\"react\\", \\"typescript\\"]`;

        const expectedOutput = {
            P_NAME: 'projectName',
            A_TYPE: 'Web Application',
            DEPS: ['react', 'typescript']
        };

        const result = await parseSettings(input);

        expect(result).toEqual(expectedOutput);
    });

    it('should throw error if line is formatted incorrectly', async () => {
        const input = `P_NAME: projectName
A_TYPE, Web Application
DEPS: [\\"react\\", \\"typescript\\"]`;

        await expect(parseSettings(input)).rejects.toThrow(/Invalid Settings Data! Expected - 2/);
    });

    it('should throw error if rawSettings is empty or invalid', async () => {
        const input = `{ foo: "bar" }`;

        await expect(parseSettings(input)).rejects.toThrow('Failed to parse settings');
    });

    it('should ignore empty lines and curly braces lines', async () => {
        const input = `

A_TYPE: Web Application

{ start }
P_NAME: projectName
DEPS: [\\"react\\", \\"typescript\\"]

{ end }
`;

        const expectedOutput = {
            A_TYPE: 'Web Application',
            P_NAME: 'projectName',
            DEPS: ['react', 'typescript']
        };

        const result = await parseSettings(input);

        expect(result).toEqual(expectedOutput);
    });
});
