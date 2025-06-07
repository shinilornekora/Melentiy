import { insertIndexPageInProjectStructure, getIndexFileName, insertIndexJSFile } from './indexFilesService.ts';
import {
    getIndexPageScript as _indexPage,
} from '../../infrastructure/llm/scripts/code/index.js';
import { directNeuralHelp } from '../../infrastructure/llm/models/directNeuralHelp.js';
import { maybeExtractTextBetweenQuotes } from './utils.js';
import { Project, Settings, Structure } from "../types.js";
import { insertBasicIndexStyles } from './indexFilesService';


jest.mock('./utils.js', () => ({
    maybeExtractTextBetweenQuotes: (input: string): string => input
}));

jest.mock('../../infrastructure/llm/models/directNeuralHelp.js', () => ({
    directNeuralHelp: jest.fn((args: any) => Promise.resolve(args.mainMessage))
}));

jest.mock('../../infrastructure/llm/scripts/code/index.js', () => ({
    getIndexPageScript: jest.fn(() => 'dummy-index-page-script'),
    getIndexScript: jest.fn(() => 'dummy-index-script')
}));

describe('insertIndexPageInProjectStructure', () => {
    const P_NAME = 'test-project';
    const DEPS = 'react,typescript';
    const description = 'A test project description';

    const settings: Settings = {
        P_NAME,
        DEPS,
    };

    let structure: Project = {
        [P_NAME]: {
            public: {
                'index.html': ''
            },
            src: {}
        }
    };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should insert index.html into public directory', async () => {
        const mockIndexPageScript = 'Mocked script for index.html';
        const mockModelAnswer = '"Mocked model answer"';
        const mockPureAnswer = 'Mocked pure answer';

        (_indexPage as jest.Mock).mockReturnValue(mockIndexPageScript);
        (directNeuralHelp as jest.Mock).mockResolvedValue(mockModelAnswer);
        (maybeExtractTextBetweenQuotes as jest.Mock).mockReturnValue(mockPureAnswer);

        const updatedStructure = await insertIndexPageInProjectStructure({
            structure,
            settings,
            description,
        });

        expect(directNeuralHelp).toHaveBeenCalledWith({
            temperature: 0.3,
            maxTokens: 8000,
            mainMessage: mockIndexPageScript,
            messages: [],
        });
        expect(updatedStructure[P_NAME].public['index.html']).toBe(mockPureAnswer);
    });

    it('should handle invalid abstract tree data and throw an error', async () => {
        const invalidStructure = {
            [P_NAME]: 'string instead of object',
        };

        (_indexPage as jest.Mock).mockReturnValue('script');
        (directNeuralHelp as jest.Mock).mockResolvedValue('"html code"');

        await expect(
            insertIndexPageInProjectStructure({ structure: invalidStructure as Project, settings, description })
        ).rejects.toThrow('Invalid abstract tree data - root is not an object.');
    });

    it('should call console.log once when the index page was inserted successfully', async () => {
        const consoleSpy = jest.spyOn(console, 'log');
        const mockIndexPageScript = 'Mocked script for index.html';
        const mockModelAnswer = '"Mocked model answer"';
        const mockPureAnswer = 'Mocked pure answer';

        (_indexPage as jest.Mock).mockReturnValue(mockIndexPageScript);
        (directNeuralHelp as jest.Mock).mockResolvedValue(mockModelAnswer);
        (maybeExtractTextBetweenQuotes as jest.Mock).mockReturnValue(mockPureAnswer);

        await insertIndexPageInProjectStructure({ structure, settings, description });

        expect(consoleSpy).toHaveBeenCalledWith(' -- Index page was inserted successfully -- ');
    });
});

describe('insertBasicIndexStyles', () => {
    const mockP_NAME = 'projectName';
    const mockSettings: Settings = {
        P_NAME: mockP_NAME,
        DEPS: 'react,typescript'
    };
    const mockDescription = 'Sample project description';

    const mockHtmlCode = '<html>\n    <head>\n        <title>Test Project</title>\n    </head>\n    <body>\n        <div id="root"></div>\n    </body>\n</html>';

    const baseStructure: Project = {
        [mockP_NAME]: {
            public: {
                'index.html': mockHtmlCode
            },
            src: {
                'App.jsx': 'App code'
            }
        }
    };

    beforeEach(() => {
        const mockReturn = {
            message: {
                content: {
                    text: '`body { background: white; }`'
                }
            }
        };
        (directNeuralHelp as jest.Mock).mockResolvedValue(mockReturn);
        (maybeExtractTextBetweenQuotes as jest.Mock).mockReturnValue('body { background: white; }');
    });

    test('should insert styles.css with generated content', async () => {
        const expectedStructure: Project = {
            [mockP_NAME]: {
                public: {
                    'index.html': mockHtmlCode,
                    'styles.css': 'body { background: white; }'
                },
                src: {
                    'App.jsx': 'App code'
                }
            }
        };

        const result = await insertBasicIndexStyles({
            structure: baseStructure as unknown as Project,
            settings: mockSettings,
            description: mockDescription
        });

        expect(result).toEqual(expectedStructure);
        expect(directNeuralHelp).toHaveBeenCalledWith({
            temperature: 0.3,
            maxTokens: 8000,
            mainMessage: expect.any(String),
            messages: []
        });
    });

    test('should throw an error if project name is not an object in the structure', async () => {
        const invalidProjectNameStructure: Project = {
            [mockP_NAME]: 'invalid value'
        };

        await expect(
            insertBasicIndexStyles({
                structure: invalidProjectNameStructure as unknown as Project,
                settings: mockSettings,
                description: mockDescription
            })
        ).rejects.toThrow('Invalid abstract tree data - root is not an object.');
    });
});



describe('getIndexFileName', () => {
    test('returns index.tsx for React with TypeScript content', () => {
        const scriptContent = 'interface TestInterface {}\ntype TestType = number;';
        expect(getIndexFileName(scriptContent)).toBe('index.tsx');
    });

    test('returns index.jsx for React without TypeScript', () => {
        const scriptContent = 'const App = () => <div>Hello React</div>';
        expect(getIndexFileName(scriptContent)).toBe('index.jsx');
    });

    test('returns index.vue for Vue content', () => {
        const scriptContent = '<template><div>Vue Component</div></template>';
        expect(getIndexFileName(scriptContent)).toBe('index.vue');
    });

    test('returns index.ts for TypeScript only', () => {
        const scriptContent = 'type MyType = string;';
        expect(getIndexFileName(scriptContent)).toBe('index.ts');
    });

    test('returns index.ts when TypeScript without interface is defined with space', () => {
        const scriptContent = 'type MyType = string;';
        expect(getIndexFileName(scriptContent)).toBe('index.ts');
    });

    test('returns index.js when no pattern is matched', () => {
        const scriptContent = 'const x = 5; console.log(x);';
        expect(getIndexFileName(scriptContent)).toBe('index.js');
    });

    test('returns index.ts even if TypeScript keyword is after other languages', () => {
        const scriptContent = 'some vue content\ntype TestType = string;';
        expect(getIndexFileName(scriptContent)).toBe('index.ts');
    });

    test('returns index.js when nothing matches', () => {
        const scriptContent = '';
        expect(getIndexFileName(scriptContent)).toBe('index.js');
    });
});

describe('insertIndexJSFile', () => {
    let testStructure = {
        'testProject': {
            public: {
                'index.html': 'dummy-html'
            },
            src: {
                'otherFile.js': 'other content',
                'index.invalid': { another: 'object' }
            }
        }
    } as Structure;

    const validSettings = {
        DEPS: 'react,typescript',
        P_NAME: 'testProject'
    } as Settings;
    const description = 'A test project';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should insert an index.js file correctly when no TypeScript/React definitions are in the script', async () => {
        const scriptContent = 'console.log("hello world");';
        const mockDirectNeuralHelp = jest.requireMock('../../infrastructure/llm/models/directNeuralHelp.js')
            .directNeuralHelp as jest.Mock;
        const mockGetIndexScript = jest.requireMock('../../infrastructure/llm/scripts/code/index.js').getIndexScript as jest.Mock;

        mockDirectNeuralHelp.mockResolvedValueOnce(scriptContent);
        mockGetIndexScript.mockReturnValueOnce(scriptContent);

        await insertIndexJSFile({ structure: testStructure, settings: validSettings, description });

        expect(testStructure['testProject']?.src['index.js']).toBe('console.log("hello world");');
    });

    it('should insert an index.ts file when script contains TypeScript but not React', async () => {
        const tsContent = 'interface Test { id: number; } console.log("TypeScript world");';
        const mockDirectNeuralHelp = jest.requireMock('../../infrastructure/llm/models/directNeuralHelp.js')
            .directNeuralHelp as jest.Mock;
        const mockGetIndexScript = jest.requireMock('../../infrastructure/llm/scripts/code/index.js').getIndexScript as jest.Mock;

        mockDirectNeuralHelp.mockResolvedValueOnce(tsContent);
        mockGetIndexScript.mockReturnValueOnce(tsContent);

        await insertIndexJSFile({ structure: testStructure, settings: { ...validSettings, DEPS: 'typescript' }, description });

        expect(testStructure['testProject']?.src['index.ts']).toBe('interface Test { id: number; } console.log("TypeScript world");');
    });

    it('should insert an index.jsx file when script contains React but not TypeScript', async () => {
        const jsxContent = "function App() { return <div>Hello React</div>; }";
        const mockDirectNeuralHelp = jest.requireMock('../../infrastructure/llm/models/directNeuralHelp.js')
            .directNeuralHelp as jest.Mock;
        const mockGetIndexScript = jest.requireMock('../../infrastructure/llm/scripts/code/index.js').getIndexScript as jest.Mock;

        mockDirectNeuralHelp.mockResolvedValueOnce(jsxContent);
        mockGetIndexScript.mockReturnValueOnce(jsxContent);

        await insertIndexJSFile({ structure: testStructure, settings: { ...validSettings, DEPS: 'react' }, description });

        expect(testStructure['testProject']?.src['index.jsx']).toBe("function App() { return <div>Hello React</div>; }");
    });

    it('should insert an index.tsx file when script contains both React and TypeScript', async () => {
        const tsxContent = "interface State { count: number; } function App() { return <div>{}</div>; }";
        const mockDirectNeuralHelp = jest.requireMock('../../infrastructure/llm/models/directNeuralHelp.js')
            .directNeuralHelp as jest.Mock;
        const mockGetIndexScript = jest.requireMock('../../infrastructure/llm/scripts/code/index.js').getIndexScript as jest.Mock;

        mockDirectNeuralHelp.mockResolvedValueOnce(tsxContent);
        mockGetIndexScript.mockReturnValueOnce(tsxContent);

        await insertIndexJSFile({ structure: testStructure, settings: validSettings, description });

        expect(testStructure['testProject']?.src['index.tsx']).toBe("interface State { count: number; } function App() { return <div>{}</div>; }");
    });

    it('should filter out malicious index directory objects from the src structure', async () => {
        const scriptContent = 'console.log("no problem here");';
        const structure = {
            'testProject': {
                public: {
                    'index.html': 'dummy-html'
                },
                src: {
                    'index.invalidDir': {},
                    'anotherIndex.invalidDir': { nested: 'dir' },
                    'otherFile.js': 'other content'
                }
            }
        } as Structure;
        const mockDirectNeuralHelp = jest.requireMock('../../infrastructure/llm/models/directNeuralHelp.js')
            .directNeuralHelp as jest.Mock;
        const mockGetIndexScript = jest.requireMock('../../infrastructure/llm/scripts/code/index.js').getIndexScript as jest.Mock;

        mockDirectNeuralHelp.mockResolvedValueOnce(scriptContent);
        mockGetIndexScript.mockReturnValueOnce(scriptContent);

        await insertIndexJSFile({ structure, settings: validSettings, description });

        expect(Object.keys(structure['testProject']?.src)).not.toContain('index.invalidDir');
        expect(Object.keys(structure['testProject']?.src)).not.toContain('anotherIndex.invalidDir');
        expect(Object.keys(structure['testProject']?.src)).toContain('index.js');
        expect(structure['testProject']?.src['index.js']).toBe(scriptContent);
    });

    it('should throw an error if the project root is not an object', async () => {
        const corruptedStructure = {
            'testProject': 'not an object'
        } as Structure;
        await expect(
            insertIndexJSFile({ structure: corruptedStructure, settings: validSettings, description })
        ).rejects.toThrowError('Invalid abstract tree data - root is not an object.');
    });
});
