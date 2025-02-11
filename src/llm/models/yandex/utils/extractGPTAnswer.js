module.exports = function extractAliceAnswer(answer) {
    if (!answer) {
        throw new Error('Fetch error. Check if you are connected to the Internet.')
    }

    if (!answer.result) {
        throw new Error('It seems that API key has expired.')
    }

    if (!answer.result.alternatives || !answer.result.alternatives.length) {
        throw new Error('Model response is invalid - servers are overheated.')
    }

    return answer.result.alternatives[0].message.text
}