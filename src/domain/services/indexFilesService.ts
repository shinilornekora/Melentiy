import {
    getIndexPageStylesScript as _indexStyle,
    getIndexPageScript as _indexPage,
    getIndexScript as _indexScript
} from '../../infrastructure/llm/scripts/code';
import { directNeuralHelp } from '../../infrastructure/llm/models/directNeuralHelp';
import { maybeExtractTextBetweenQuotes } from './utils';
import { Project, Settings } from "../ProjectGenerator";

export async function insertIndexPageInProjectStructure(project: Project, settings: Settings, description: string) {
    const { DEPS, P_NAME } = settings;
    const resolvedDeps = DEPS.split(',');
    const indexPageScript = _indexPage({
        description,
        dependencies: resolvedDeps,
        structure: project
    });

    const modelAnswer = await directNeuralHelp({
        temperature: 0.6,
        maxTokens: 8000,
        mainMessage: indexPageScript,
        messages: []
    });
    const pureAnswer = maybeExtractTextBetweenQuotes(modelAnswer);

    project[P_NAME] = {
        ...project[P_NAME],
        public: {
            'index.html': pureAnswer
        }
    };

    return project;
}

export async function insertBasicIndexStyles(project: Project, settings: Settings, description: string) {
    const { P_NAME } = settings;
    const htmlCode = project[P_NAME].public['index.html'];
    const prompt = _indexStyle({ htmlCode, description });
    const modelAnswer = await directNeuralHelp({
        temperature: 0.6,
        maxTokens: 8000,
        mainMessage: prompt,
        messages: []
    });
    
    const pureAnswer = maybeExtractTextBetweenQuotes(modelAnswer);

    project[P_NAME] = {
        ...project[P_NAME],
        public: {
            ...project[P_NAME].public,
            'styles.css': pureAnswer
        }
    };

    return project;
}

export async function insertIndexJSFile(project: Project, settings: Settings, description: string) {
    const { DEPS, P_NAME } = settings;
    const resolvedDeps = DEPS.split(',');
    const htmlCode = project[P_NAME].public['index.html'];
    const prompt = _indexScript({
        htmlCode,
        description ,
        dependencies: resolvedDeps,
    });
    const modelAnswer = await directNeuralHelp({
        temperature: 0.6,
        maxTokens: 8000,
        mainMessage: prompt,
        messages: []
    });
    
    const pureAnswer = maybeExtractTextBetweenQuotes(modelAnswer);

    const indexFileName = pureAnswer.includes('react') ? 'index.jsx' : 'index.ts';

    project[P_NAME] = {
        ...project[P_NAME],
        src: {
            ...project[P_NAME].src,
            [indexFileName]: pureAnswer
        }
    };

    return project;
}