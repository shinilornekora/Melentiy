import { insertTranspilerIntoProjectStructure } from './transpilerService.js';
import {Structure} from "../types";

const transpilerScriptMock = jest.fn();
const directNeuralHelpMock = jest.fn();
const maybeExtractTextBetweenQuotesMock = jest.fn();

// Мокаем модули
jest.mock('../../infrastructure/llm/scripts/code/index.js', () => ({
    getTranspilerFileScript: (...args: any[]) => transpilerScriptMock(...args)
}));

jest.mock('../../infrastructure/llm/models/directNeuralHelp.js', () => ({
    directNeuralHelp: (...args: any[]) => directNeuralHelpMock(...args),
}));

jest.mock('./utils.js', () => ({
    maybeExtractTextBetweenQuotes: (...args: any[]) => maybeExtractTextBetweenQuotesMock(...args)
}));

describe('insertTranspilerIntoProjectStructure', () => {
    let structure: any;
    let settings: any;

    beforeEach(() => {
        jest.clearAllMocks();
        structure = {
            'project-x': {
                src: {},
                'old': 1
            }
        };
        settings = {
            DEPS: 'dependency-1,dependency-2',
            P_NAME: 'project-x',
            transpilerDeps: []
        };
    });

    it('добавляет .babelrc в структуру проекта с разобранным конфигом, обновляет settings.transpilerDeps', async () => {
        const expectedTranspilerScriptArg = { deps: 'dependency-1,dependency-2' };
        const transpilerScriptOutput = 'transpiler-code';
        const directNeuralResponse = 'result-from-llm';
        const babelrcConfig = JSON.stringify({ presets: ["@babel/preset-env", "@babel/preset-react"] });

        transpilerScriptMock.mockReturnValue(transpilerScriptOutput);
        directNeuralHelpMock.mockResolvedValue(directNeuralResponse);
        maybeExtractTextBetweenQuotesMock.mockReturnValue(babelrcConfig);

        const result = await insertTranspilerIntoProjectStructure({ structure, settings });

        // Точно вызваны зависимости с правильными аргументами
        expect(transpilerScriptMock).toHaveBeenCalledWith(expectedTranspilerScriptArg);
        expect(directNeuralHelpMock).toHaveBeenCalledWith({
            temperature: 0.2,
            maxTokens: 8000,
            mainMessage: transpilerScriptOutput,
            messages: []
        });
        expect(maybeExtractTextBetweenQuotesMock).toHaveBeenCalledWith(directNeuralResponse);

        // .babelrc добавлен в структуру и этот ключ не потерялся
        expect((result['project-x'] as Structure)['.babelrc']).toBe(babelrcConfig);
        expect((result['project-x'] as Structure)['src']).toBeDefined();
        expect((result['project-x'] as Structure)['old']).toBe(1);

        // В settings.transpilerDeps теперь массив из babelrc
        expect(settings.transpilerDeps).toEqual(["@babel/preset-env", "@babel/preset-react"]);
    });

    it('корректно обрабатывает, если конфиг пуст', async () => {
        transpilerScriptMock.mockReturnValue('foo');
        directNeuralHelpMock.mockResolvedValue('{}');
        maybeExtractTextBetweenQuotesMock.mockReturnValue('{}');

        const testSettings = { ...settings };
        const testStructure = { ...structure, ['project-x']: { ...structure['project-x'] } };

        const result = await insertTranspilerIntoProjectStructure({ structure: testStructure, settings: testSettings });

        expect((result['project-x'] as Structure)['.babelrc']).toBe('{}');
        expect(testSettings.transpilerDeps).toBeUndefined(); // JSON.parse('{}').presets -> undefined
    });

    it('кидает ошибку, если неверный JSON', async () => {
        transpilerScriptMock.mockReturnValue('foo');
        directNeuralHelpMock.mockResolvedValue('INVALID');
        maybeExtractTextBetweenQuotesMock.mockReturnValue('not-json');

        await expect(insertTranspilerIntoProjectStructure({ structure, settings })
        ).rejects.toThrow();
    });
});