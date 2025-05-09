import { getTranspilerFileScript as _transpilerScript } from '../../infrastructure/llm/scripts/code';
import { directNeuralHelp } from '../../infrastructure/llm/models/directNeuralHelp';
import { maybeExtractTextBetweenQuotes } from './utils';
import { Project, Settings } from "../ProjectGenerator";

type Props = {
    project: Project;
    settings: Settings
}

export async function insertTranspilerIntoProjectStructure({ project, settings }: Props) {
    const { DEPS, P_NAME } = settings;
    const transpilerScript = _transpilerScript({ deps: DEPS });

    const babelFileRes = await directNeuralHelp({
        temperature: 0.6,
        maxTokens: 8000,
        mainMessage: transpilerScript,
        messages: []
    });

    console.log('Babel structure was accomplished.');
    console.log(babelFileRes);

    const maybeCleanedBabelFile = maybeExtractTextBetweenQuotes(babelFileRes)

    project[P_NAME] = {
        ...project[P_NAME],
        '.babelrc': maybeCleanedBabelFile
    };

    settings.transpilerDeps = JSON.parse(maybeCleanedBabelFile).presets;

    return project;
}
