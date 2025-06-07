
import { getProjectStructure } from './structureService';
import { getProjectSrcScript as _srcScript } from '../../infrastructure/llm/scripts/structure/index.js';
import { directNeuralHelp } from '../../infrastructure/llm/models/directNeuralHelp.js';

jest.mock('../../infrastructure/llm/scripts/structure/index.js', () => ({
    getProjectSrcScript: jest.fn()
}));
jest.mock('../../infrastructure/llm/models/directNeuralHelp.js', () => ({
    directNeuralHelp: jest.fn()
}));

describe('getProjectStructure', () => {
    const mockScript = 'folders script';
    const mockSettings = { A_TYPE: 'spa', DEPS: ['react'] };

    beforeEach(() => {
        jest.clearAllMocks();
        ( _srcScript as jest.Mock ).mockReturnValue(mockScript);
    });

    it('calls _srcScript and directNeuralHelp with correct params', async () => {
        const rawJson = JSON.stringify({ structure: ['src', 'public'] });
        (directNeuralHelp as jest.Mock).mockResolvedValue(rawJson);

        const result = await getProjectStructure(mockSettings as any);

        expect(_srcScript).toHaveBeenCalledWith({ archType: 'spa', deps: ['react'] });
        expect(directNeuralHelp).toHaveBeenCalledWith({
            temperature: 0.6,
            maxTokens: 8000,
            mainMessage: mockScript,
            messages: []
        });
        expect(result).toEqual({ structure: ['src', 'public'] });
    });

    it('strips markdown formatting from the result before parsing (no line breaks)', async function () {
        var markdownJson = '{"foo":1,"bar":[1,2,3]}';
        (directNeuralHelp as jest.Mock).mockResolvedValue(markdownJson);

        var result = await getProjectStructure(mockSettings as any);

        expect(result).toEqual({ foo: 1, bar: [1,2,3] });
    });

    it('throws if JSON.parse fails', async () => {
        (directNeuralHelp as jest.Mock).mockResolvedValue('bad json');

        await expect(getProjectStructure(mockSettings as any)).rejects.toThrow();
    });
});

