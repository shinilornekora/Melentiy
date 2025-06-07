import { getProjectStructure } from './structureService';
import { directNeuralHelp } from '../../infrastructure/llm/models/directNeuralHelp.js';
import { _srcScript } from '../../infrastructure/llm/scripts/structure/index.js';

jest.mock('../../infrastructure/llm/models/directNeuralHelp.js');
jest.mock('../../infrastructure/llm/scripts/structure/index.js');

describe('getProjectStructure', () => {
    it('should return parsed JSON structure without markdown formatting', async () => {
        const mockSettings = {
            A_TYPE: 'frontend',
            DEPS: ['React', 'TypeScript']
        };

        const mockScript = 'Generate project structure for React and TypeScript';
        const mockResponse = '```json{ "folderStructure": [ "src", "public", "package.json" ] }```';

        (_srcScript as jest.Mock).mockReturnValue(mockScript);
        (directNeuralHelp as jest.Mock).mockResolvedValue(mockResponse);

        const result = await getProjectStructure(mockSettings);
        expect(result).toEqual({ folderStructure: [ "src", "public", "package.json" ] });
        expect(directNeuralHelp).toHaveBeenCalledWith({
            temperature: 0.6,
            maxTokens: 8000,
            mainMessage: mockScript,
            messages: []
        });
    });

    it('should handle structure response without markdown', async () => {
        const mockSettings = {
            A_TYPE: 'backend',
            DEPS: ['Node.js', 'Express']
        };

        const mockScript = 'Generate backend structure with Node.js and Express';
        const mockResponse = '{ "folderStructure": [ "server", "routes", "Models", "app.js" ] }';

        (_srcScript as jest.Mock).mockReturnValue(mockScript);
        (directNeuralHelp as jest.Mock).mockResolvedValue(mockResponse);

        const result = await getProjectStructure(mockSettings);
        expect(result).toEqual({ folderStructure: [ "server", "routes", "Models", "app.js" ] });
    });

    it('should throw error if parsing JSON fails', async () => {
        const mockSettings = {
            A_TYPE: 'mobile',
            DEPS: ['Flutter']
        };

        const mockScript = 'Mobile app using Flutter';
        const mockResponse = '```json{ invalid JSON ```';

        (_srcScript as jest.Mock).mockReturnValue(mockScript);
        (directNeuralHelp as jest.Mock).mockResolvedValue(mockResponse);

        await expect(getProjectStructure(mockSettings)).rejects.toThrow();
    });
});
