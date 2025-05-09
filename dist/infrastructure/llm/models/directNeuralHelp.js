"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.directNeuralHelp = directNeuralHelp;
const callAlice_1 = require("./yandex/callAlice");
// Пока что хардкодим.
// Потом можно будет давать выбор модели.
const MODEL_NAME = 'yandex';
async function directNeuralHelp(args) {
    switch (MODEL_NAME) {
        case "yandex":
            return await (0, callAlice_1.callAlice)(args);
    }
}
