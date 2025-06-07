import { getProjectSrcScript as _srcScript } from '../../infrastructure/llm/scripts/structure/index.js';
import { directNeuralHelp } from '../../infrastructure/llm/models/directNeuralHelp.js';

import {Settings} from "../types.js";

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
