import {
    insertIndexPageInProjectStructure,
    insertBasicIndexStyles,
    getIndexFileName,
    insertIndexJSFile
} from './indexFilesService';

import {
    getIndexPageStylesScript as _indexStyle,
    getIndexPageScript as _indexPage,
    getIndexScript as _indexScript
} from '../../infrastructure/llm/scripts/code/index.js';
import { directNeuralHelp } from '../../infrastructure/llm/models/directNeuralHelp.js';
import { maybeExtractTextBetweenQuotes } from './utils.js';

import { Project, Settings, Structure } from "../types.js";

jest.mock('./utils.js', () => ({
    maybeExtractTextBetweenQuotes: jest.fn((input: string) => input)
}));

jest.mock('../../infrastructure/llm/models/directNeuralHelp.js', () => ({
    directNeuralHelp: jest.fn()
}));

jest.mock('../../infrastructure/llm/scripts/code/index.js', () => ({
    getIndexPageScript: jest.fn(),
    getIndexScript: jest.fn(),
    getIndexPageStylesScript: jest.fn()
}));

describe('insertIndexPageInProjectStructure', () => {
    const P_NAME = 'test-project';
    const DEPS = 'react,typescript';
    const description = 'A test project description';

    const settings: Settings = {
        P_NAME,
        DEPS,
    } as Settings;

    let structure: Structure;
    beforeEach(() => {
        jest.resetAllMocks();
        structure = {
            [P_NAME]: {
                public: {
                    'index.html': ''
                },
                src: {}
            }
        } as Structure;
    });

    it('should insert index.html into public directory', async () => {
        (_indexPage as jest.Mock).mockReturnValue('index page script');
        (directNeuralHelp as jest.Mock).mockResolvedValue('the html!');
        (maybeExtractTextBetweenQuotes as jest.Mock).mockReturnValue('the html!');

        await insertIndexPageInProjectStructure({
            structure,
            settings,
            description,
        });

        const proj = structure[P_NAME] as Structure;
        const pub = proj.public as Structure;
        expect(pub['index.html']).toBe('the html!');
    });

    it('should throw if P_NAME is not an object', async () => {
        (_indexPage as jest.Mock).mockReturnValue('index page script');
        (directNeuralHelp as jest.Mock).mockResolvedValue('html');

        const badStruct = { [P_NAME]: 123 as unknown as Structure };
        await expect(insertIndexPageInProjectStructure({ structure: badStruct, settings, description }))
            .rejects.toThrow('Invalid abstract tree data - root is not an object.');
    });

    it('should call console.log when success', async () => {
        (_indexPage as jest.Mock).mockReturnValue('index page script');
        (directNeuralHelp as jest.Mock).mockResolvedValue('page!');
        (maybeExtractTextBetweenQuotes as jest.Mock).mockReturnValue('page!');
        const spy = jest.spyOn(console, 'log').mockImplementation(() => {});

        await insertIndexPageInProjectStructure({
            structure,
            settings,
            description,
        });

        expect(spy).toHaveBeenCalledWith(' -- Index page was inserted successfully -- ');
        spy.mockRestore();
    });
});

describe('insertBasicIndexStyles', () => {
    const P_NAME = 'projectName';
    const settings: Settings = { P_NAME, DEPS: 'react,typescript' } as Settings;
    const description = 'desc';

    let structure: Structure;
    beforeEach(() => {
        jest.resetAllMocks();
        structure = {
            [P_NAME]: {
                public: {
                    'index.html': '<html></html>'
                },
                src: {}
            }
        } as Structure;
    });

    it('should insert styles.css with content', async () => {
        (_indexStyle as jest.Mock).mockReturnValue('prompt-css');
        (directNeuralHelp as jest.Mock).mockResolvedValue('body { color: red; }');
        (maybeExtractTextBetweenQuotes as jest.Mock).mockReturnValue('body { color: red; }');
        await insertBasicIndexStyles({ structure, settings, description });
        const proj = structure[P_NAME] as Structure;
        const pub = proj.public as Structure;
        expect(pub['styles.css']).toBe('body { color: red; }');
    });
});

describe('getIndexFileName', () => {
    it('returns index.tsx for react+ts', () => {
        expect(getIndexFileName('interface X {}\nreact')).toBe('index.tsx');
    });
    it('returns index.jsx for only react', () => {
        expect(getIndexFileName('react')).toBe('index.jsx');
    });
    it('returns index.vue for vue', () => {
        expect(getIndexFileName('vue')).toBe('index.vue');
    });
    it('returns index.ts for only ts', () => {
        expect(getIndexFileName('type Foo = number')).toBe('index.ts');
    });
    it('returns index.ts for interface match', () => {
        expect(getIndexFileName('interface X {}')).toBe('index.ts');
    });
    it('returns index.js for generic', () => {
        expect(getIndexFileName('something random')).toBe('index.js');
    });
});

describe('insertIndexJSFile', () => {
    const P_NAME = 'somep';
    const settings: Settings = { P_NAME, DEPS: '' } as Settings;
    const description = 'desc';

    let structure: Structure;
    beforeEach(() => {
        jest.resetAllMocks();
        structure = {
            [P_NAME]: {
                public: {
                    'index.html': '<html></html>'
                },
                src: {
                    keepme: 'foo'
                }
            }
        } as Structure;
    });

    it('should insert index.js file for generic code', async () => {
        (_indexScript as jest.Mock).mockReturnValue('prompt for index');
        (directNeuralHelp as jest.Mock).mockResolvedValue('console.log("hello")');
        (maybeExtractTextBetweenQuotes as jest.Mock).mockReturnValue('console.log("hello")');
        await insertIndexJSFile({ structure, settings, description });
        const proj = structure[P_NAME] as Structure;
        const src = proj.src as Structure;
        expect(src['index.js']).toBe('console.log("hello")');
    });

    it('should insert index.ts file if .ts code', async () => {
        (_indexScript as jest.Mock).mockReturnValue('prompt for index');
        (directNeuralHelp as jest.Mock).mockResolvedValue('type Blah = number');
        (maybeExtractTextBetweenQuotes as jest.Mock).mockReturnValue('type Blah = number');
        await insertIndexJSFile({ structure, settings, description });
        const proj = structure[P_NAME] as Structure;
        const src = proj.src as Structure;
        expect(src['index.ts']).toBe('type Blah = number');
    });

    it('should insert index.jsx file if react', async () => {
        (_indexScript as jest.Mock).mockReturnValue('prompt for index');
        (directNeuralHelp as jest.Mock).mockResolvedValue('react');
        (maybeExtractTextBetweenQuotes as jest.Mock).mockReturnValue('react');
        await insertIndexJSFile({ structure, settings, description });
        const proj = structure[P_NAME] as Structure;
        const src = proj.src as Structure;
        expect(src['index.jsx']).toBe('react');
    });

    it('should insert index.tsx file if react+ts', async () => {
        (_indexScript as jest.Mock).mockReturnValue('prompt for index');
        (directNeuralHelp as jest.Mock).mockResolvedValue('interface Foo {}\nreact');
        (maybeExtractTextBetweenQuotes as jest.Mock).mockReturnValue('interface Foo {}\nreact');
        await insertIndexJSFile({ structure, settings, description });
        const proj = structure[P_NAME] as Structure;
        const src = proj.src as Structure;
        expect(src['index.tsx']).toBe('interface Foo {}\nreact');
    });

    it('should filter out malicious index dirs', async () => {
        const proj = structure[P_NAME] as Structure;
        proj.src = {
            'index.malicious': { bad: true } as any,
            keepme: 'bar'
        };
        (_indexScript as jest.Mock).mockReturnValue('prompt for index');
        (directNeuralHelp as jest.Mock).mockResolvedValue('console.log("clean")');
        (maybeExtractTextBetweenQuotes as jest.Mock).mockReturnValue('console.log("clean")');
        await insertIndexJSFile({ structure, settings, description });
        const newProj = structure[P_NAME] as Structure;
        const src = newProj.src as Structure;
        expect(src).not.toHaveProperty('index.malicious');
        expect(src['index.js']).toBe('console.log("clean")');
        expect(src.keepme).toBe('bar');
    });
});