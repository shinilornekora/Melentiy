
import { directNeuralHelp } from './directNeuralHelp';
import { callAlice } from './yandex/callAlice.js';

jest.mock('./yandex/callAlice.js', () => ({
    callAlice: jest.fn()
}));

describe('directNeuralHelp', () => {
    const baseArgs = {
        temperature: 0.5,
        maxTokens: 1000,
        mainMessage: 'Main prompt',
        messages: [{ role: 'user', text: 'Message 1' }]
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls callAlice with correct args and returns its answer', async () => {
        (callAlice as jest.Mock).mockResolvedValue('mocked answer');
        const result = await directNeuralHelp(baseArgs);
        expect(callAlice).toHaveBeenCalledWith(baseArgs);
        expect(result).toBe('mocked answer');
    });

    it('throws if callAlice returns empty or falsy value', async () => {
        (callAlice as jest.Mock).mockResolvedValue('');
        await expect(directNeuralHelp(baseArgs)).rejects.toThrow('Alice didn\'t find answer.');

        (callAlice as jest.Mock).mockResolvedValue(undefined);
        await expect(directNeuralHelp(baseArgs)).rejects.toThrow('Alice didn\'t find answer.');
    });

    it('propagates error from callAlice', async () => {
        (callAlice as jest.Mock).mockRejectedValue(new Error('API error'));
        await expect(directNeuralHelp(baseArgs)).rejects.toThrow('API error');
    });
});
