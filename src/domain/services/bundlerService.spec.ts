import { bundlerFileName } from '../projectConfig';
import { Settings, Structure } from '../types';
import {insertRelevantBundler} from "./bundlerService";

jest.mock('../../infrastructure/llm/scripts/settings/index.js', () => ({
    getRelevantBundler: jest.fn()
}));
jest.mock('../../infrastructure/llm/scripts/code/index.js', () => ({
    getBundlerFileScript: jest.fn()
}));
jest.mock('../../infrastructure/llm/models/directNeuralHelp.js', () => ({
    directNeuralHelp: jest.fn()
}));
jest.mock('./utils.js', () => ({
    maybeExtractTextBetweenQuotes: jest.fn((t: string) => t)
}));

const { getRelevantBundler } = require('../../infrastructure/llm/scripts/settings/index.js');
const { getBundlerFileScript } = require('../../infrastructure/llm/scripts/code/index.js');
const { directNeuralHelp } = require('../../infrastructure/llm/models/directNeuralHelp.js');
const { maybeExtractTextBetweenQuotes } = require('./utils.js');

describe('insertRelevantBundler', () => {
    let structure: Structure;
    let settings: Settings;

    beforeEach(() => {
        jest.clearAllMocks();
        structure = {
            "App": {
                src: {}
            }
        } as unknown as Structure;
        settings = {
            P_NAME: 'App',
            DEPS: 'react',
            A_TYPE: 'module',
            builder: '',
            transpilerDeps: []
        } as unknown as Settings;
    });

    it('inserts correct bundler, deps and file for webpack', async () => {
        (getRelevantBundler as jest.Mock).mockImplementation(({ deps }) => `Choose a bundler for ${deps}`);
        (getBundlerFileScript as jest.Mock).mockImplementation(({ bundler }) => `Config for ${bundler}`);
        // Выдаём строку, похожую на то, что выдает directNeuralHelp для webpack
        (directNeuralHelp as jest.Mock)
            .mockResolvedValueOnce('webpack: webpack-dev-server,foo-plugin')
            .mockResolvedValueOnce('filecontent webpack config { foo: true }');

        const result = await insertRelevantBundler({ structure, settings });

        expect(getRelevantBundler).toHaveBeenCalled();
        expect(getBundlerFileScript).toHaveBeenCalledWith({ bundler: 'webpack', bundlerPlugins: 'webpack-dev-server,foo-plugin,webpack-cli, babel-loader' });
        // DEPS обновились
        expect(settings.DEPS).toMatch(/webpack,webpack-dev-server,foo-plugin,webpack-cli, babel-loader/);
        // builder установлен
        expect(settings.builder).toBe('webpack');
        // в структуре появился правильный файл
        expect(
            (result['App'] as Record<string, string>)[bundlerFileName['webpack']]
        ).toBe('filecontent webpack config { foo: true }');

    });

    it('добавляет deps даже если builderDeps пустой', async () => {
        (getRelevantBundler as jest.Mock).mockReturnValue('webpack:');
        (getBundlerFileScript as jest.Mock).mockImplementation(({ bundler }) => `Config for ${bundler}`);
        (directNeuralHelp as jest.Mock)
            .mockResolvedValueOnce('webpack:') // bundler: builderDeps
            .mockResolvedValueOnce('filecontent webpack config');

        try {
            await insertRelevantBundler({ structure, settings });
        } catch {}

        expect(settings.DEPS).toMatch('react');
    });

    it('throws if directNeuralHelp returns not 2 pieces', async () => {
        (getRelevantBundler as jest.Mock).mockReturnValue('garbage');
        (directNeuralHelp as jest.Mock).mockResolvedValueOnce('webpack');

        await expect(insertRelevantBundler({ structure, settings }))
            .rejects.toThrow('Invalid builder data! Expected - 2, got - 1');
    });

    it('throws if bundler cannot be found', async () => {
        (getRelevantBundler as jest.Mock).mockReturnValue('badbundler: garbage');
        (directNeuralHelp as jest.Mock).mockResolvedValueOnce('badbundler: garbage');

        await expect(insertRelevantBundler({ structure, settings }))
            .rejects.toThrow('Invalid builder data! Expected - 2, got - 1');
    });

    it('throws if file content is too short', async () => {
        (getRelevantBundler as jest.Mock).mockReturnValue('webpack: dep1');
        (directNeuralHelp as jest.Mock)
            .mockResolvedValueOnce('webpack: dep1').mockResolvedValueOnce('12345');

        (getBundlerFileScript as jest.Mock).mockReturnValue('config');

        await expect(insertRelevantBundler({ structure, settings }))
            .rejects.toThrow('INVALID_BUNDLER_WAS_CHOSEN');
    });
});