import {
    getIndexPageStylesScript as _indexStyle,
    getIndexPageScript as _indexPage,
    getIndexScript as _indexScript
} from '../../infrastructure/llm/scripts/code';
import { directNeuralHelp } from '../../infrastructure/llm/models/directNeuralHelp';
import { maybeExtractTextBetweenQuotes } from './utils';

import {Project, Settings, Structure} from "../types";

type Props = {
    structure: Structure;
    settings: Settings;
    description: string;
}

export async function insertIndexPageInProjectStructure({ structure, settings, description }: Props) {
    const { DEPS, P_NAME } = settings;
    const projectStructure = structure[P_NAME] as Structure;
    const publicProjectSector = projectStructure['public'] as Structure;
    const resolvedDeps = DEPS.split(',');
    const indexPageScript = _indexPage({
        description,
        dependencies: resolvedDeps,
        structure: structure
    });

    const modelAnswer = await directNeuralHelp({
        temperature: 0.6,
        maxTokens: 8000,
        mainMessage: indexPageScript,
        messages: []
    });
    const pureAnswer = maybeExtractTextBetweenQuotes(modelAnswer);

    if (typeof structure[P_NAME] !== 'object') {
        throw new Error('Invalid abstract tree data - root is not an object.');
    }

    structure[P_NAME] = {
        ...projectStructure,
        public: {
            ...publicProjectSector,
            'index.html': pureAnswer
        }
    };

    console.log(' -- Index page was inserted successfully -- ');

    return structure;
}

export async function insertBasicIndexStyles({ structure, settings, description }: Props) {
    const { P_NAME } = settings;
    const projectStructure = structure[P_NAME] as Structure;
    const publicProjectSector = projectStructure['public'] as Structure;
    const htmlCode = publicProjectSector['index.html'] as string;

    const prompt = _indexStyle({ htmlCode, description });
    const modelAnswer = await directNeuralHelp({
        temperature: 0.6,
        maxTokens: 8000,
        mainMessage: prompt,
        messages: []
    });
    
    const pureAnswer = maybeExtractTextBetweenQuotes(modelAnswer);

    if (typeof structure[P_NAME] !== 'object') {
        throw new Error('Invalid abstract tree data - root is not an object.');
    }

    structure[P_NAME] = {
        ...projectStructure,
        public: {
            ...publicProjectSector,
            'styles.css': pureAnswer
        }
    };

    console.log(' -- Index style was inserted successfully --');

    return structure;
}

export async function insertIndexJSFile({ structure, settings, description }: Props) {
    const { DEPS, P_NAME } = settings;
    const resolvedDeps = DEPS.split(',');

    const projectStructure = structure[P_NAME] as Structure;
    const publicProjectSector = projectStructure['public'] as Structure;
    const srcProjectSector = projectStructure['src'] as Structure;
    const htmlCode = publicProjectSector['index.html'] as string;

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

    if (typeof structure[P_NAME] !== 'object') {
        throw new Error('Invalid abstract tree data - root is not an object.');
    }

    structure[P_NAME] = {
        ...projectStructure,
        src: {
            ...srcProjectSector as Structure,
            [indexFileName]: pureAnswer
        }
    };

    console.log(' -- Index script was inserted successfully --');

    return structure;
}