"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReadmesScript = void 0;
const getReadmesScript = ({ folderName, subfolders }) => `
    You are a frontend expert. Your task is to create a README file for the folder structure described below.

    Folder: **${folderName}**
    Subfolders: ${subfolders && subfolders.length > 0 ? subfolders.join(', ') : 'None'}

    The README should include:
    - A short description of the folder's purpose.
    - Explanation of what each subfolder (if any) is for.
    - Any other relevant details that would help a developer understand the contents and purpose of the folder.

    Please write the README in a clear and concise manner, following standard README conventions.
`;
exports.getReadmesScript = getReadmesScript;
