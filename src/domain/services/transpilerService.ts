import { getTranspilerFileScript as _transpilerScript } from '../../infrastructure/llm/scripts/code';
import { directNeuralHelp } from '../../infrastructure/llm/models/directNeuralHelp';
import { maybeExtractTextBetweenQuotes } from './utils';

import {Settings, Structure} from "../types";

type Props = {
    structure: Structure;
    settings: Settings
}

export async function insertTranspilerIntoProjectStructure({ structure, settings }: Props) {
    const { DEPS, P_NAME } = settings;
    const projectStructure = structure[P_NAME] as Structure;
    const transpilerScript = _transpilerScript({ deps: DEPS });

    const babelFileRes = await directNeuralHelp({
        temperature: 0.6,
        maxTokens: 8000,
        mainMessage: transpilerScript,
        messages: []
    });

    console.log(' -- Transpiler configuration was inserted successfully -- ');

    const maybeCleanedBabelFile = maybeExtractTextBetweenQuotes(babelFileRes)

    structure[P_NAME] = {
        ...projectStructure,
        '.babelrc': maybeCleanedBabelFile
    };

    settings.transpilerDeps = JSON.parse(maybeCleanedBabelFile).presets;

    return structure;
}
