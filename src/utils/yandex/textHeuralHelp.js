const { directNeuralHelp } = require("./directNeuralHelp");

export async function callNeuralHelp(text) {
    return await directNeuralHelp({ message: text })
}