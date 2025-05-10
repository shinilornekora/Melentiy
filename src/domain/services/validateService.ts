import { Structure, Settings } from "../types";
import { indexJSFileScript } from "../../infrastructure/llm/scripts/validation";
import { directNeuralHelp } from "../../infrastructure/llm/models/directNeuralHelp";
import { maybeExtractTextBetweenQuotes } from "./utils";
import {validateBundleScript} from "../../infrastructure/llm/scripts/validation/bundlerFile";
import {bundlerFileName} from "../projectConfig";

type Props = {
    structure: Structure;
    settings: Settings;
}

export const validateIndexFile = async ({ structure, settings }: Props) => {
    const { DEPS, P_NAME } = settings;
    const projectStructure = structure[P_NAME] as Structure;
    const scriptedProjectStructure = JSON.stringify(projectStructure);
    const scriptFolder = projectStructure.src as Structure;

    const improveIndexScriptFileScript = indexJSFileScript();
    const depsScript = `DEPENDENCIES: ${DEPS}`;
    const structureScript = `STRUCTURE: ${scriptedProjectStructure}`;
    const basicScripts = [
        depsScript,
        structureScript
    ].map(script => ({ role: 'user', text: script }));

    const modelAnswer = await directNeuralHelp({
        temperature: 0.6,
        maxTokens: 8000,
        mainMessage: improveIndexScriptFileScript,
        messages: basicScripts,
    })

    const pureAnswer = maybeExtractTextBetweenQuotes(modelAnswer);
    const indexFileName = Object
        .keys(scriptFolder)
        .find(filename => filename.startsWith('index')) as string;

    const scriptFileWasChanged = pureAnswer !== scriptFolder[indexFileName];

    console.log(`-- Validated index script file [${scriptFileWasChanged ? 'WAS_CHANGED' : 'NO_CHANGES'}] --`);

    if (scriptFileWasChanged) {
        return {
            ...structure,
            [P_NAME]: {
                ...projectStructure,
                src: {
                    ...scriptFolder,
                    [indexFileName]: pureAnswer,
                }
            }
        }
    }

    return structure;
}

export const validateBundleFile = async ({ structure, settings }: Props) => {
    const { P_NAME, builder } = settings;
    const bundlerCertainFileName = bundlerFileName[builder];
    const projectStructure = structure[P_NAME] as Structure;
    const scriptedProjectStructure = JSON.stringify(projectStructure);

    const improveBundleFileScript = validateBundleScript();
    const structureScript = `STRUCTURE: ${scriptedProjectStructure}`;
    const basicScripts = [
        structureScript
    ].map(script => ({ role: 'user', text: script }));

    const modelAnswer = await directNeuralHelp({
        temperature: 0.6,
        maxTokens: 8000,
        mainMessage: improveBundleFileScript,
        messages: basicScripts,
    })

    const pureAnswer = maybeExtractTextBetweenQuotes(modelAnswer);
    const fileWasChanged = pureAnswer !== projectStructure[bundlerCertainFileName];

    console.log(`raw bundler - ${projectStructure[bundlerCertainFileName]}`);
    console.log(`new bundler - ${pureAnswer}`)

    console.log(`-- Validated bundler file [${fileWasChanged ? 'WAS_CHANGED' : 'NO_CHANGES'}] --`);

    if (fileWasChanged) {
        return {
            ...structure,
            [P_NAME]: {
                ...projectStructure,
                [bundlerCertainFileName]: pureAnswer,
            }
        }
    }

    return structure;
}