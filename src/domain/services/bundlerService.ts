import { getRelevantBundler as _bundlerScript } from '../../infrastructure/llm/scripts/settings';
import { getBundlerFileScript as _bundlerFileScript } from '../../infrastructure/llm/scripts/code';
import { directNeuralHelp } from '../../infrastructure/llm/models/directNeuralHelp';
import { POSSIBLE_BUNDLERS, bundlerFileName } from '../projectConfig';
import { maybeExtractTextBetweenQuotes } from './utils';
import { Project, Settings } from "../ProjectGenerator";

type BundlerType = 'webpack' | 'rollup' | 'vite';

export async function insertRelevantBundler(project: Project, settings: Settings) {
    const { DEPS, P_NAME } = settings;
    const bundlerScript = _bundlerScript({ deps: DEPS });

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

    const [bundler, builderDeps = ''] = rawBuilderConfig as [BundlerType, string];

    if (!POSSIBLE_BUNDLERS.includes(bundler)) {
        throw new Error('Invalid bundler was chosen.');
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

    project[settings.P_NAME] = {
        ...project[settings.P_NAME],
        [bundlerFileName[bundler]]: maybeExtractTextBetweenQuotes(bundlerFileContent)
    };

    settings.builder = bundler;

    return project;
}
