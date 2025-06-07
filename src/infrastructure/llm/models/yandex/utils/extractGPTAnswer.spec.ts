import { AliceAnswer, extractAliceAnswer } from './extractGPTAnswer'

describe('extractAliceAnswer', () => {
    it('should extract the text from the first message alternative successfully', () => {
        const answer: AliceAnswer = {
            result: {
                alternatives: [
                    {
                        message: {
                            text: 'Hello, world!',
                        },
                    },
                ],
            },
        }

        const result = extractAliceAnswer(answer)
        expect(result).toBe('Hello, world!')
    })

    it('should throw an error when no answer is provided', () => {
        const answer: AliceAnswer | undefined = undefined

        expect(() => extractAliceAnswer(answer)).toThrow('Fetch error. Check if you are connected to the Internet.')
    })

    it('should throw an error when answer does not contain result', () => {
        const answer: AliceAnswer = {
            result: undefined,
        }

        expect(() => extractAliceAnswer(answer)).toThrow('It seems that API key has expired.')
    })

    it('should throw an error when alternatives are missing or empty', () => {
        const answer: AliceAnswer = {
            result: {
                alternatives: [],
            },
        }

        expect(() => extractAliceAnswer(answer)).toThrow('Model response is invalid - servers are overheated.')

        delete answer.result?.alternatives

        expect(() => extractAliceAnswer(answer)).toThrow('Model response is invalid - servers are overheated.')
    })
})
