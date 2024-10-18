function callNeuralHelp(text) {
    return fetch(`https://example.com/?text=${text}`)
}

module.exports = {
    callNeuralHelp
}