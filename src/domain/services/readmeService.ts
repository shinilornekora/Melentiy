import { getReadmesScript as _readmesScript } from '../../infrastructure/llm/scripts/structure';
import { directNeuralHelp } from '../../infrastructure/llm/models/directNeuralHelp';

import { Structure } from "../types";

const generateFolderReadme = async (folderName: string, subfolders: string[]) => {
    const description = _readmesScript({ folderName, subfolders });
    return await directNeuralHelp({
        temperature: 0.6,
        maxTokens: 8000,
        mainMessage: description,
        messages: []
    });
};

type Props = {
    structure: Structure;
    projectName: string;
}

type ReadmeProcessedProps = {
    files: Structure | string | string[],
    readme: string
}

export async function insertREADMEFilesInOuterFolders({ structure, projectName }: Props) {
    if (!structure) {
        throw new Error('Structure of the src folder wasn\'t finished.');
    }

    const readmeContents = {} as { [key: string]: string };

    const projectContents = structure[projectName] as Structure;
    const projectSourceFolder = projectContents['src'] as Structure;

    for (const [folderName, subfolders] of Object.entries<string[]>(projectSourceFolder as Record<string, string[]>)) {
        readmeContents[folderName] = await generateFolderReadme(folderName, subfolders);
    }

    const mergedStructure = Object.keys(projectSourceFolder).reduce((acc, key) => {
        acc[key] = {
            files: projectSourceFolder[key],
            readme: readmeContents[key] || 'No README provided.'
        };
        return acc;
    }, {} as Record<string, ReadmeProcessedProps>);

    console.log(' -- README_en.md-s were inserted successfully --');

    const returnValue: Structure = {
        ...structure,
        [projectName]: {
            ...projectContents,
            src: {
                // Нет смысла учитывать ранее состояние.
                // Скрипт получает всегда сырую структуру.
                ...mergedStructure,
            }
        }
    }

    return returnValue;
}