type Props = {
    folderName: string;
    subfolders: string[]
}

export const getReadmesScript = ({ folderName, subfolders }: Props) => `
    You are a frontend expert. Your task is to create a README file for the folder structure described below.

    Folder: **${folderName}**
    Subfolders: ${subfolders && subfolders.length > 0 ? subfolders.join(', ') : 'None'}

    The README should include:
    - A short description of the folder's purpose.
    - Explanation of what each subfolder is made for.
    - Other relevant details that would help a developer understand the contents and purpose of the folder.

    Please write the README in a clear and concise manner, following standard README conventions.
`;