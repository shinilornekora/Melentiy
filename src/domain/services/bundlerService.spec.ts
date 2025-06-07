import { insertRelevantBundler } from './bundlerService.js';
import { directNeuralHelp } from '../../infrastructure/llm/models/directNeuralHelp.js';
import { _bundlerScript } from '../../infrastructure/llm/scripts/settings/index.js';
import { _bundlerFileScript } from '../../infrastructure/llm/scripts/code/index.js';
import { maybeExtractTextBetweenQuotes } from './utils.js';
import { POSSIBLE_BUNDLERS, bundlerFileName } from '../projectConfig.js';

jest.mock('../../infrastructure/llm/models/directNeuralHelp.js');
jest.mock('../../infrastructure/llm/scripts/settings/index.js');
jest.mock('../../infrastructure/llm/scripts/code/index.js');
jest.mock('./utils.js');

describe('insertRelevantBundler', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    test('successfully inserts bundler with valid response', async () => {
        const structure = {
            project1: {}
        };
        const settings: any = {
            P_NAME: 'project1',
            DEPS: 'initial-deps',
            builder: null
        };

        const mocks: any = {
            _bundlerScript: jest.fn().mockReturnValue('bundler script'),
            _bundlerFileScript: jest.fn().mockReturnValue('bundler file script'),
            directNeuralHelp: jest.fn(),
            maybeExtractTextBetweenQuotes: jest.fn().mockReturnValue('config content')
        };

        mocks.directNeuralHelp
            .mockReturnValueOnce('webpack: plugin1,plugin2')
            .mockReturnValueOnce('config content start"\n  const webpack = require("webpack");\n  modules.exports = {\n    entry: "./index.js",\n    plugins: [new webpack оригинальный config],\n  };"\n end');

        const result = await insertRelevantBundler({ structure, settings });

        expect(mocks._bundlerScript).toHaveBeenCalledWith({ deps: 'initial-deps' });
        expect(mocks.directNeuralHelp).toHaveBeenNthCalledWith(
            1,
            {
                temperature: 0.6,
                maxTokens: 8000,
                mainMessage: 'bundler script',
                messages: []
            }
        );
        expect(mocks._bundlerFileScript).toHaveBeenCalledWith({ bundler: 'webpack', bundlerPlugins: 'plugin1,plugin2' });
        expect(mocks.directNeuralHelp).toHaveBeenNthCalledWith(
            2,
            {
                temperature: 0.3,
                maxTokens: 8000,
                mainMessage: 'bundler file script',
                messages: []
            }
        );
        expect(mocks.maybeExtractTextBetweenQuotes).toHaveBeenCalledWith('config content start"\n  const webpack = require("webpack");\n  modules.exports = {\n    entry: "./index.js",\n    plugins: [new webpack оригинальный config],\n  };"\n end');
        expect(result).toEqual({
            project1: {
                [bundlerFileName['webpack']]: 'config content'
            }
        });
        expect(settings.DEPS).toBe('initial-deps,webpack,plugin1,plugin2,webpack-cli, babel-loader');
        expect(settings.builder).toBe('webpack');
    });

    test('throws error if builder response is invalid', async () => {
        const structure = {
            project1: {}
        };
        const settings: any = {
            P_NAME: 'project1',
            DEPS: 'initial-deps'
        };

        (directNeuralHelp as jest.Mock).mockReturnValueOnce('invalid response');

        await expect(insertRelevantBundler({ structure, settings })).rejects.toThrow(
            'Invalid builder data! Expected - 2, got - 1'
        );
    });

    test('throws error if selected bundler is not in POSSIBLE_BUNDLERS', async () => {
        const structure = {
            project1: {}
        };
        const settings: any = {
            P_NAME: 'project1',
            DEPS: 'initial-deps'
        };

        (directNeuralHelp as jest.Mock).mockReturnValueOnce('invalid-bundler: dependencies');

        await expect(insertRelevantBundler({ structure, settings })).rejects.toThrow('INVALID_BUNDLER_WAS_CHOSEN');
    });

    test('throws error if bundler file is too small', async () => {
        const structure = {
            project1: {}
        };
        const settings: any = {
            P_NAME: 'project1',
            DEPS: 'initial-deps'
        };

        (directNeuralHelp as jest.Mock)
            .mockReturnValueOnce('webpack: plugin1,plugin2')
            .mockReturnValueOnce('short config');

        await expect(insertRelevantBundler({ structure, settings })).rejects.toThrow('INVALID_BUNDLER_CONFIG');
    });

    test('adds webpack default plugins if selected', async () => {
        const structure = {
            project1: {}
        };
        const settings: any = {
            P_NAME: 'project1',
            DEPS: 'initial-deps',
            builder: null
        };

        (directNeuralHelp as jest.Mock)
            .mockReturnValueOnce('webpack: somedep')
            .mockReturnValueOnce('some config');

        await insertRelevantBundler({ structure, settings });

        expect(settings.DEPS).toBe('initial-deps,webpack,somedep,webpack-cli, babel-loader');
    });
});
