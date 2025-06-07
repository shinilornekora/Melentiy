import {
    getProjectNameScript,
    getProjectArchScript,
    getProjectDepsScript,
    getProjectImprovedDepsScript,
    getAllSettings,
} from '../../infrastructure/llm/scripts/settings/index.js';
import { directNeuralHelp } from '../../infrastructure/llm/models/directNeuralHelp.js';
import { getProjectMainSettings, parseSettings, improveDependencies } from './settingsService';
import {Settings} from "../types";

jest.mock('../../infrastructure/llm/scripts/settings/index.js', () => ({
    getProjectNameScript: jest.fn(),
    getProjectArchScript: jest.fn(),
    getProjectDepsScript: jest.fn(),
    getProjectImprovedDepsScript: jest.fn(),
    getAllSettings: jest.fn()
}));
jest.mock('../../infrastructure/llm/models/directNeuralHelp.js', () => ({
    directNeuralHelp: jest.fn()
}));

describe('getProjectMainSettings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls all script generators and returns LLM result', async () => {
        (getAllSettings as jest.Mock).mockReturnValue('main_settings_prompt');
        (getProjectNameScript as jest.Mock).mockReturnValue('name_prompt');
        (getProjectArchScript as jest.Mock).mockReturnValue('arch_prompt');
        (getProjectDepsScript as jest.Mock).mockReturnValue('deps_prompt');
        (directNeuralHelp as jest.Mock).mockResolvedValue('llm_result');

        const result = await getProjectMainSettings('Project descr');
        expect(getAllSettings).toHaveBeenCalled();
        expect(getProjectNameScript).toHaveBeenCalledWith({ description: 'Project descr' });
        expect(getProjectArchScript).toHaveBeenCalledWith({ description: 'Project descr' });
        expect(getProjectDepsScript).toHaveBeenCalledWith({ description: 'Project descr' });
        expect(directNeuralHelp).toHaveBeenCalledWith({
            temperature: 0.2,
            maxTokens: 8000,
            mainMessage: 'main_settings_prompt',
            messages: [
                { role: 'user', text: 'name_prompt' },
                { role: 'user', text: 'arch_prompt' },
                { role: 'user', text: 'deps_prompt' }
            ]
        });
        expect(result).toBe('llm_result');
    });
});

describe('parseSettings', () => {
    it('parses valid settings string', async () => {
        const src = [
            'A_TYPE: Web App',
            'P_NAME: my-app',
            'DEPS: ["react","typescript"]'
        ].join('\n');
        const result = await parseSettings(src);
        expect(result).toEqual({
            A_TYPE: 'Web App',
            P_NAME: 'my-app',
            DEPS: '["react","typescript"]'
        });
    });

    it('throws if line is badly formatted', async () => {
        const src = [
            'A_TYPE: Web App',
            'P_NAME, my-app', // should throw here
            'DEPS: ["react","typescript"]'
        ].join('\n');
        await expect(parseSettings(src)).rejects.toThrow('Failed to parse settings');
    });

    it('ignores blank and curly brace lines', async () => {
        const src = [
            '',
            '{',
            'A_TYPE: SPA',
            '}',
            'P_NAME: wow',
            '',
            'DEPS: ["ui"]'
        ].join('\n');
        const result = await parseSettings(src);
        expect(result).toEqual({
            A_TYPE: 'SPA',
            P_NAME: 'wow',
            DEPS: '["ui"]'
        });
    });
});

describe('improveDependencies', () => {
    const baseSettings: Settings = {
        A_TYPE: 'ddd',
        P_NAME: 'test',
        DEPS: 'old_deps',
        builder: 'webpack',
        transpilerDeps: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls script and LLM and updates deps', async () => {
        (getProjectImprovedDepsScript as jest.Mock).mockReturnValue('deps_improve_prompt');
        (directNeuralHelp as jest.Mock).mockResolvedValue('new_deps');

        const result = await improveDependencies(baseSettings, 'description');
        expect(getProjectImprovedDepsScript).toHaveBeenCalledWith({ deps: 'old_deps', description: 'description' });
        expect(directNeuralHelp).toHaveBeenCalledWith({
            temperature: 0.6,
            maxTokens: 8000,
            mainMessage: 'deps_improve_prompt',
            messages: []
        });
        expect(result).toEqual({ ...baseSettings, DEPS: 'new_deps' });
    });

    it('throws if LLM returns empty result', async () => {
        (getProjectImprovedDepsScript as jest.Mock).mockReturnValue('prompt');
        (directNeuralHelp as jest.Mock).mockResolvedValue(undefined);

        await expect(improveDependencies(baseSettings, 'desc')).rejects.toThrow('Failed to improve deps');
    });

    it('propagates LLM errors', async () => {
        (getProjectImprovedDepsScript as jest.Mock).mockReturnValue('prompt');
        (directNeuralHelp as jest.Mock).mockRejectedValue(new Error('fail'));

        await expect(improveDependencies(baseSettings, 'desc')).rejects.toThrow('fail');
    });
});