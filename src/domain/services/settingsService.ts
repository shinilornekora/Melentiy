import {
    getProjectNameScript as _nameScript,
    getProjectArchScript as _archScript,
    getProjectDepsScript as _depsScript,
    getProjectImprovedDepsScript as _depsImproveScript,
    getAllSettings as _settingsScript,
} from '../../infrastructure/llm/scripts/settings';
import { directNeuralHelp } from '../../infrastructure/llm/models/directNeuralHelp';

import {ARCH_TYPE, Settings} from "../types";

export async function getProjectMainSettings(description: string) {
    const mainSettingsScript = _settingsScript();
    const basicScripts = [
        _nameScript({ description }),
        _archScript({ description }),
        _depsScript({ description })
    ].map(script => ({ role: 'user', text: script }));

    return await directNeuralHelp({
        temperature: 0.6,
        maxTokens: 8000,
        mainMessage: mainSettingsScript,
        messages: basicScripts
    });
}

type RawSettingType = 'A_TYPE' | 'P_NAME' | 'DEPS';

export async function parseSettings(rawSettings: string) {
    const finalSettings = {} as Settings;

    try {
        rawSettings.split('\n')
            .filter(Boolean)
            .filter(sym => !['{', '}'].includes(sym))
            .forEach((value: string) => {
                const rawSettingsSplitValue = value.split(': ');

                if (rawSettingsSplitValue.length !== 2) {
                    throw new Error('Invalid Settings Data! Expected - 2, got - ' + rawSettingsSplitValue.length);
                }

                const [fieldType, fieldValue] = rawSettingsSplitValue as [RawSettingType, Settings[RawSettingType]];

                // TODO: Подумать, как перестроить парсинг сырых настроек.
                // @ts-expect-error: тс не проглотит конфликтующее поле.
                finalSettings[fieldType] = fieldValue;
            });
    } catch (err) {
        throw new Error('Failed to parse settings');
    }

    return finalSettings;
}

export async function improveDependencies(settings: Settings, description: string) {
    const { DEPS } = settings;
    const improveScript = _depsImproveScript({ deps: DEPS, description });

    const newDeps = await directNeuralHelp({
        temperature: 0.6,
        maxTokens: 8000,
        mainMessage: improveScript,
        messages: []
    });

    if (!newDeps) {
        throw new Error('Failed to improve deps');
    }

    return { ...settings, DEPS: newDeps };
}
