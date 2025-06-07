import { insertREADMEFilesInOuterFolders } from './readmeService.js';

// Моки для внешних зависимостей
const getReadmesScriptMock = jest.fn();
const directNeuralHelpMock = jest.fn();

// Мокаем импорты
jest.mock('../../infrastructure/llm/scripts/structure/index.js', () => ({
    getReadmesScript: (...args: any[]) => getReadmesScriptMock(...args),
}));
jest.mock('../../infrastructure/llm/models/directNeuralHelp.js', () => ({
    directNeuralHelp: (...args: any[]) => directNeuralHelpMock(...args),
}));

describe('insertREADMEFilesInOuterFolders', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('корректно вставляет readme для каждой папки', async () => {
        // Стартовая структура src с двумя папками
        const structure = {
            'my-project': {
                src: {
                    'core': ['file1.js', 'file2.js'],
                    'lib': ['other.js'],
                },
                package: "package.json"
            }
        };

        // Моки: возвращаемое описание и контент README
        getReadmesScriptMock.mockImplementation(({ folderName, subfolders }) => `desc-${folderName}-${subfolders.join('|')}`);
        directNeuralHelpMock.mockImplementation(async ({ mainMessage }) => `README_${mainMessage}`);

        const result = await insertREADMEFilesInOuterFolders({
            structure,
            projectName: 'my-project'
        });

        // Проверяем структуру src после преобразования
        expect((result['my-project'] as any).src['core']).toEqual({
            files: ['file1.js', 'file2.js'],
            readme: 'README_desc-core-file1.js|file2.js'
        });
        expect((result['my-project'] as any).src['lib']).toEqual({
            files: ['other.js'],
            readme: 'README_desc-lib-other.js'
        });

        // package не потерялся
        expect((result['my-project'] as any).package).toBe("package.json");
    });

    it('не затирает другие ключи верхнего уровня структуры', async () => {
        const structure = {
            'my-project': {
                src: {
                    'core': ['main.ts'],
                },
                README: "main readme"
            }
        };
        getReadmesScriptMock.mockReturnValue('desc');
        directNeuralHelpMock.mockReturnValue('README_txt');
        const result = await insertREADMEFilesInOuterFolders({ structure, projectName: 'my-project' });
        expect((result['my-project'] as any).README).toBe("main readme");
    });

    it('кидает ошибку, если structure = null/undefined', async () => {
        await expect(
            insertREADMEFilesInOuterFolders({ structure: null as any, projectName: 'foo' })
        ).rejects.toThrow("Structure of the src folder wasn't finished.");
    });

    it('добавляет readme = "No README provided." если directNeuralHelp не вернул README', async () => {
        const structure = { 'my-project': { src: { 'util': ['foo.js'] } } };
        getReadmesScriptMock.mockReturnValue('desc');
        directNeuralHelpMock.mockReturnValue(undefined); // README не вернули
        const result = await insertREADMEFilesInOuterFolders({ structure, projectName: 'my-project' });
        expect((result['my-project'] as any).src['util']).toEqual({
            files: ['foo.js'],
            readme: 'No README provided.'
        });
    });
});