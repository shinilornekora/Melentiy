import { directNeuralHelp } from './directNeuralHelp';
import { callAlice } from './yandex/callAlice.js';

jest.mock('./yandex/callAlice.js');

describe('directNeuralHelp', () => {
    const mockArgs: any = {
        temperature: 0.7,
        maxTokens: 100,
        mainMessage: 'Test message',
        messages: [
            { role: 'user', content: 'Hello' },
            { role: 'assistant', content: 'Hi there!' }
        ]
    };

    it('should call callAlice with the correct args when MODEL_NAME is "yandex"', async () => {
        const mockAnswer = 'Alice answer';
        (callAlice as jest.Mock).mockResolvedValue(mockAnswer);

        const result = await directNeuralHelp(mockArgs);

        expect(callAlice).toHaveBeenCalledWith(mockArgs);
        expect(result).toBe(mockAnswer);
    });

    it('should throw an error when MODEL_NAME is "yandex" and callAlice returns undefined', async () => {
        (callAlice as jest.Mock).mockResolvedValue(undefined);

        await expect(directNeuralHelp(mockArgs)).rejects.toThrow('Alice didn\'t find answer.');
    });

    it('should not handle other MODEL_NAMEs and throw an error', async () => {
        // @ts-ignore: Force invalid MODEL_NAME to test the error case
        const originalModelName = (require('./directNeuralHelp') as any).MODEL_NAME;
        jest.doMock('./directNeuralHelp', () => ({ MODEL_NAME: 'invalid_model' }));
        
        // Require again to get the rewritten mock
        const { directNeuralHelp } = await import('./directNeuralHelp');

        await expect(directNeuralHelp(mockArgs)).rejects.toThrow('MODEL_NAME is not supported.');
    });
});
