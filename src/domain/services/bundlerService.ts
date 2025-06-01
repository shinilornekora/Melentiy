import {getRelevantBundler as _bundlerScript} from '../../infrastructure/llm/scripts/settings/index.js';
import {getBundlerFileScript as _bundlerFileScript} from '../../infrastructure/llm/scripts/code/index.js';
import {directNeuralHelp} from '../../infrastructure/llm/models/directNeuralHelp.js';
import {bundlerFileName, POSSIBLE_BUNDLERS} from '../projectConfig.js';
import {maybeExtractTextBetweenQuotes} from './utils.js';

import {BundlerType, Settings, Structure} from "../types.js";

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
        throw new Error('INVALID_BUNDLER_WAS_CHOSEN');
    }

    // Сейчас у GPT есть сложности с сборщиками.
    // Во многом потому что плагины для них из кастомных репозиториев
    // Из-за этого мы постоянно получаем несуществующие библиотеки
    // Пусть дефолтные для вебпака будут определены, вдруг он их не засунет.
    if (bundler === 'webpack') {
        builderDeps += ',webpack-cli, babel-loader';
    }

    // Обновляем зависимости для package.json
    settings.DEPS += `,${bundler},${builderDeps}`;

    const bundlerFileScript = _bundlerFileScript({ bundler, bundlerPlugins: builderDeps });
    const bundlerFileContent = await directNeuralHelp({
        temperature: 0.3,
        maxTokens: 8000,
        mainMessage: bundlerFileScript,
        messages: []
    });

    // Отсекаем сразу бедный конфиг сборщика, проект точно не соберется
    if (bundlerFileContent.length < 20) {
        throw new Error('INVALID_BUNDLER_CONFIG');
    }

    structure[settings.P_NAME] = {
        ...projectStructure,
        [bundlerFileName[bundler]]: maybeExtractTextBetweenQuotes(bundlerFileContent)
    };

    settings.builder = bundler;

    console.log(` -- Bundler was chosen - ${bundler} -- `);

    return structure;
}
