import fs from 'fs/promises';
import path from 'path';
import { createRealProjectStructure } from './fileSystemService';

jest.mock('fs/promises');
jest.mock('path', () => {
  const pathMock = jest.requireActual('path');
  return {
    ...pathMock,
    join: jest.fn((...parts) => parts.join('/')),
    dirname: jest.fn((file: string) => pathMock.dirname(file)),
  };
});

describe('createRealProjectStructure', () => {
  const mockBasePath = '/project/base/path';
  const mockStructure: any = {
    'folder1': {
      folder2: {
        'README_en.md': 'Readme content',
      },
      'README_en.md': 'Another readme content',
    },
    'src/index.js': 'console.log("Hello!");',
    'public': [
      'image.png',
      'style.css',
    ],
  };

  beforeEach(() => {
    (path.join as jest.Mock).mockImplementation((...parts) => parts.join('/'));
    (path.dirname as jest.Mock).mockImplementation((file: string) => path.dirname(file));
    jest.resetAllMocks();
  });

  it('creates directories and files for object structures', async () => {
    await createRealProjectStructure(mockStructure, mockBasePath);

    expect(fs.mkdir).toHaveBeenCalledWith('/project/base/path/folder1', { recursive: true });
    expect(fs.mkdir).toHaveBeenCalledWith('/project/base/path/folder1/folder2', { recursive: true });
    expect(fs.writeFile).toHaveBeenCalledWith('/project/base/path/folder1/folder2/README_en.md', 'Readme content');
    expect(fs.writeFile).toHaveBeenCalledWith('/project/base/path/folder1/README_en.md', 'Another readme content');

    expect(fs.mkdir).toHaveBeenCalledWith('/project/base/path/public', { recursive: true });
    expect(fs.writeFile).toHaveBeenCalledWith('/project/base/path/public/image.png', '');
    expect(fs.writeFile).toHaveBeenCalledWith('/project/base/path/public/style.css', '');

    expect(fs.writeFile).toHaveBeenCalledWith('/project/base/path/src/index.js', 'console.log("Hello!");');
  });

  it('handles nested objects by recursively creating directories and files', async () => {
    const nestedPaths = [];
    const nestedFiles = [];

    fs.mkdir.mockImplementation((par: string) => {
      nestedPaths.push(par);
      return Promise.resolve();
    });

    fs.writeFile.mockImplementation((file: string, content: string) => {
      nestedFiles.push({ file, content });
      return Promise.resolve();
    });

    await createRealProjectStructure(mockStructure, mockBasePath);

    expect(nestedPaths).toContain('/project/base/path/folder1');
    expect(nestedPaths).toContain('/project/base/path/folder1/folder2');

    expect(nestedFiles.some(f => f.file === '/project/base/path/folder1/folder2/README_en.md')).toBeTruthy();
    expect(nestedFiles.some(f => f.file === '/project/base/path/folder1/README_en.md')).toBeTruthy();
    expect(nestedFiles.some(f => f.file === '/project/base/path/src/index.js')).toBeTruthy();
    expect(nestedFiles.some(f => f.file === '/project/base/path/public/image.png')).toBeTruthy();
    expect(nestedFiles.some(f => f.file === '/project/base/path/public/style.css')).toBeTruthy();
  });

  it('stops processing if the value is undefined', async () => {
    const incompleteStructure: any = {
      'folder': undefined
    };

    await createRealProjectStructure(incompleteStructure, mockBasePath);

    expect(fs.mkdir).not.toHaveBeenCalled();
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it('throws error if fs functions fail', async () => {
    const error = new Error('Cannot create directory');
    fs.mkdir.mockRejectedValueOnce(error);

    await expect(createRealProjectStructure(mockStructure, mockBasePath)).rejects.toThrow('Cannot create directory');
  });

  it('ignores keys without file extension and non-string value', async () => {
    const structure: any = {
      'folder3': 'not-directory',
      'file.txt': 123,
      'README_en.md': { name: 'test' }
    };

    await createRealProjectStructure(structure, mockBasePath);

    expect(fs.mkdir).not.toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalledWith('/project/base/path/README_en.md', 'test');
  });

  it('creates files for keys containing file name and string values', async () => {
    const structure: any = {
      'scripts/test.js': 'File content',
    };

    await createRealProjectStructure(structure, mockBasePath);

    expect(fs.writeFile).toHaveBeenCalledWith('/project/base/path/scripts/test.js', 'File content');
  });
});
