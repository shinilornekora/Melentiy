let indexJSFileScriptMock: jest.Mock;
let directNeuralHelpMock: jest.Mock;
let maybeExtractTextBetweenQuotesMock: jest.Mock;
let validateBundleScriptMock: jest.Mock;

jest.mock('../../infrastructure/llm/scripts/validation/index.js', () => ({
    indexJSFileScript: (...args: any[]) => indexJSFileScriptMock(...args),
}));
jest.mock('../../infrastructure/llm/models/directNeuralHelp.js', () => ({
    directNeuralHelp: (...args: any[]) => directNeuralHelpMock(...args),
}));
jest.mock('./utils.js', () => ({
    maybeExtractTextBetweenQuotes: (...args: any[]) => maybeExtractTextBetweenQuotesMock(...args),
}));
jest.mock('../../infrastructure/llm/scripts/validation/bundlerFile.js', () => ({
    validateBundleScript: (...args: any[]) => validateBundleScriptMock(...args),
}));
jest.mock('../projectConfig.js', () => ({
    bundlerFileName: { webpack: 'webpack.config.js', vite: 'vite.config.js' }
}));

import { validateIndexFile, validateBundleFile } from './validateService';

beforeEach(() => {
    indexJSFileScriptMock = jest.fn();
    directNeuralHelpMock = jest.fn();
    maybeExtractTextBetweenQuotesMock = jest.fn();
    validateBundleScriptMock = jest.fn();
});

// далее — describe и тесты без изменений!
describe('validateIndexFile', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const structure = {
        myProject: {
            src: {
                'index.js': 'console.log(1);',
                'other.js': 'foo'
            },
            'package.json': '{}'
        }
    };

    const settings = {
        DEPS: 'lodash',
        P_NAME: 'myProject'
    } as any;

    it('возвращает новую структуру, если файл изменен', async () => {
        indexJSFileScriptMock.mockReturnValue('prompt');
        directNeuralHelpMock.mockResolvedValue('model-raw');
        maybeExtractTextBetweenQuotesMock.mockReturnValue('console.log(2);');

        const result = await validateIndexFile({ structure, settings });

        expect(indexJSFileScriptMock).toHaveBeenCalled();
        expect(directNeuralHelpMock).toHaveBeenCalled();
        expect(maybeExtractTextBetweenQuotesMock).toHaveBeenCalledWith('model-raw');
        expect((result['myProject'] as any).src['index.js']).toBe('console.log(2);');
    });

    it('возвращает прежнюю структуру, если файл не изменен', async () => {
        indexJSFileScriptMock.mockReturnValue('prompt');
        directNeuralHelpMock.mockResolvedValue('model-raw');
        maybeExtractTextBetweenQuotesMock.mockReturnValue('console.log(1);');

        const result = await validateIndexFile({ structure, settings });

        expect(result).toBe(structure);
    });

    it('вызывает ошибку, если файл index превратился в объект', async () => {
        const badStructure = {
            myProject: { src: { 'index.js': { not: 'a string' } } }
        };
        await expect(
            validateIndexFile({ structure: badStructure, settings })
        ).rejects.toThrow('INDEX_FILE_BECAME_OBJECT_SOMEHOW');
    });

    it('ищет index-файл не только по точному совпадению', async () => {
        // Если файл называется index.ts, применяется та же логика
        const struct = { myProject: { src: { 'index.ts': 'code' } } };
        indexJSFileScriptMock.mockReturnValue('prompt');
        directNeuralHelpMock.mockResolvedValue('model');
        maybeExtractTextBetweenQuotesMock.mockReturnValue('changed');
        const result = await validateIndexFile({ structure: struct, settings });
        expect((result['myProject'] as any).src['index.ts']).toBe('changed');
    });
});

describe('validateBundleFile', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const structure = {
        myProject: {
            src: { 'index.js': 'console.log(1);' },
            'webpack.config.js': 'oldContent',
        }
    };

    const settings = {
        P_NAME: 'myProject',
        builder: 'webpack'
    } as any;

    it('возвращает новую структуру если файл изменен', async () => {
        validateBundleScriptMock.mockReturnValue('prompt-bundler');
        directNeuralHelpMock.mockResolvedValue('model-answer-bundler');
        maybeExtractTextBetweenQuotesMock.mockReturnValue('newConfigContent');

        const result = await validateBundleFile({ structure, settings });

        expect(validateBundleScriptMock).toHaveBeenCalled();
        expect(directNeuralHelpMock).toHaveBeenCalled();
        expect(maybeExtractTextBetweenQuotesMock).toHaveBeenCalledWith('model-answer-bundler');
        expect((result['myProject'] as any)['webpack.config.js']).toBe('newConfigContent');
    });

    it('возвращает прежнюю структуру если файл не изменен', async () => {
        validateBundleScriptMock.mockReturnValue('prompt');
        directNeuralHelpMock.mockResolvedValue('model-answer');
        maybeExtractTextBetweenQuotesMock.mockReturnValue('oldContent');
        const result = await validateBundleFile({ structure, settings });
        expect(result).toBe(structure);
    });

    it('использует правильное имя файла для vite', async () => {
        const struct = { myProject: { 'vite.config.js': '123' } };
        const sets = { P_NAME: 'myProject', builder: 'vite' };
        validateBundleScriptMock.mockReturnValue('prompt');
        directNeuralHelpMock.mockResolvedValue('resp');
        maybeExtractTextBetweenQuotesMock.mockReturnValue('abc');
        const result = await validateBundleFile({ structure: struct, settings: sets as any });
        expect((result['myProject'] as any)['vite.config.js']).toBe('abc');
    });
});