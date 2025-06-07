import path from 'path';
import { createRealProjectStructure } from './fileSystemService'; // путь подправь
import { BASE_PATH } from '../projectConfig.js';

jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    writeFile: jest.fn(),
  }
}));
const fs = require('fs').promises;

describe('createRealProjectStructure', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('создает папки и файлы по правильным путям для вложенных структур', async () => {
    const structure = {
      src: {
        'index.js': 'console.log("ok")',
        readme: 'src readme',
        components: {
          'App.js': '// app',
        },
      },
      'README.md': 'main project readme',
    };

    await createRealProjectStructure(structure, '/root');

    expect(fs.mkdir).toHaveBeenCalledWith(path.join('/root', 'src'), { recursive: true });
    expect(fs.mkdir).toHaveBeenCalledWith(path.join('/root', 'src', 'components'), { recursive: true });

    expect(fs.writeFile).toHaveBeenCalledWith(path.join('/root', 'src', 'README_en.md'), 'src readme');
    expect(fs.writeFile).toHaveBeenCalledWith(path.join('/root', 'src', 'index.js'), 'console.log("ok")');
    expect(fs.writeFile).toHaveBeenCalledWith(path.join('/root', 'src', 'components', 'App.js'), '// app');
    expect(fs.writeFile).toHaveBeenCalledWith(path.join('/root', 'README.md'), 'main project readme');
  });

  it('создаёт пустые файлы из массива, если значение - массив', async () => {
    const structure = {
      assets: ['image.png', 'font.woff2'],
    };
    await createRealProjectStructure(structure, '/project');

    // mkdir для assets
    expect(fs.mkdir).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalled();
  });

  it('не падает если структура пустая', async () => {
    await expect(createRealProjectStructure({}, '/empty')).resolves.not.toThrow();
    expect(fs.mkdir).not.toHaveBeenCalled();
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it('создаёт только файл если в ключе есть точка и это строка', async () => {
    const structure = {
      'hello.txt': 'hi!',
    };
    await createRealProjectStructure(structure, '/files');
    expect(fs.writeFile).toHaveBeenCalled();
  });
});
