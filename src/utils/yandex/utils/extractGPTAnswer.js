module.exports = function extractAliceAnswer(answer) {
    return answer.result.alternatives[0].message.text
}