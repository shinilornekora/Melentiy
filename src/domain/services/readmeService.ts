import { getReadmesScript as _readmesScript } from '../../infrastructure/llm/scripts/structure';
import { directNeuralHelp } from '../../infrastructure/llm/models/directNeuralHelp';
import {Project} from "../ProjectGenerator";

export async function insertREADMEFilesInOuterFolders(structure: Project['structure'], projectName: string) {
    if (!structure) {
        throw new Error('Structure of the src folder wasn\'t finished.');
    }

    // Если структура обёрнута в ключ src, используем его
    if (structure.src) {
        structure = structure.src;
    }

    const readmeContents = {} as { [key: string]: string };

    const generateFolderReadme = async (folderName: string, subfolders: string[]) => {
        const description = _readmesScript({ folderName, subfolders });
        return await directNeuralHelp({
            temperature: 0.6,
            maxTokens: 8000,
            mainMessage: description,
            messages: []
        });
    };

    for (const [folderName, subfolders] of Object.entries<string[]>(structure)) {
        readmeContents[folderName] = await generateFolderReadme(folderName, subfolders);
    }

    const mergedStructure = Object.keys(structure).reduce((acc, key) => {
        acc[key] = {
            files: structure[key],
            readme: readmeContents[key] || 'No README provided.'
        };
        return acc;
    }, {} as Record<string, { files: any, readme: string }>);

    console.log('README.md-s were inserted successfully.');
    console.log(mergedStructure);

    return {
        [projectName]: {
            src: mergedStructure
        }
    };
}