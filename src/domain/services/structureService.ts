import { getProjectSrcScript as _srcScript } from '../../infrastructure/llm/scripts/structure';
import { directNeuralHelp } from '../../infrastructure/llm/models/directNeuralHelp';
import {Settings} from "../ProjectGenerator";

export async function getProjectStructure({ A_TYPE, DEPS }: Settings) {
    const foldersScript = _srcScript({ archType: A_TYPE, deps: DEPS });

    let structure = await directNeuralHelp({
        temperature: 0.6,
        maxTokens: 8000,
        mainMessage: foldersScript,
        messages: []
    });

    // Убираем возможное оформление markdown
    structure = structure.replace(/```json/g, '').replace(/`/g, '');
    return JSON.parse(structure);
}
