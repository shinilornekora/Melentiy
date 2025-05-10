import {getRelevantBundler as _bundlerScript} from '../../infrastructure/llm/scripts/settings';
import {getBundlerFileScript as _bundlerFileScript} from '../../infrastructure/llm/scripts/code';
import {directNeuralHelp} from '../../infrastructure/llm/models/directNeuralHelp';
import {bundlerFileName, POSSIBLE_BUNDLERS} from '../projectConfig';
import {maybeExtractTextBetweenQuotes} from './utils';

import {BundlerType, Settings, Structure} from "../types";

type Props = {
    structure: Structure;
    settings: Settings;
}

export async function insertRelevantBundler({ structure, settings }: Props) {
    const { DEPS } = settings;
    const bundlerScript = _bundlerScript({ deps: DEPS });
    const projectStructure = structure[settings.P_NAME] as Structure;

    const res = await directNeuralHelp({
        temperature: 0.6,
        maxTokens: 8000,
        mainMessage: bundlerScript,
        messages: []
    });

    const rawBuilderConfig = res.split(': ');

    if (rawBuilderConfig.length !== 2) {
        throw new Error("Invalid builder data! Expected - 2, got - " + rawBuilderConfig.length);
    }

    let [bundler, builderDeps = ''] = rawBuilderConfig as [BundlerType, string];

    if (!POSSIBLE_BUNDLERS.includes(bundler)) {
        throw new Error('Invalid bundler was chosen.');
    }

    if (bundler === 'webpack') {
        builderDeps += ',webpack-cli';
    }

    // Обновляем зависимости для package.json
    settings.DEPS += `,${bundler},${builderDeps}`;

    const bundlerFileScript = _bundlerFileScript({ bundler, bundlerPlugins: builderDeps });
    const bundlerFileContent = await directNeuralHelp({
        temperature: 0.6,
        maxTokens: 8000,
        mainMessage: bundlerFileScript,
        messages: []
    });

    structure[settings.P_NAME] = {
        ...projectStructure,
        [bundlerFileName[bundler]]: maybeExtractTextBetweenQuotes(bundlerFileContent)
    };

    settings.builder = bundler;

    console.log(` -- Bundler was chosen - ${bundler} -- `);

    return structure;
}
