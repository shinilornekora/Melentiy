import { maybeExtractTextBetweenQuotes } from './utils';

describe('maybeExtractTextBetweenQuotes', () => {
    it('should extract text between triple backticks when both are present', () => {
        const input = '````Hello, world!```';
        const expected = 'Hello, world!';
        expect(maybeExtractTextBetweenQuotes(input)).toBe(expected);
    });

    it('should return text after triple backticks at the beginning when no ending triple backticks', () => {
        const input = '````This is markdown code.';
        const expected = 'This is markdown code.';
        expect(maybeExtractTextBetweenQuotes(input)).toBe(expected);
    });

    it('should return the original text when no triple backticks at the beginning', () => {
        const input = 'This is not code.';
        const expected = 'This is not code.';
        expect(maybeExtractTextBetweenQuotes(input)).toBe(expected);
    });

    it('should return text after triple backticks even if they are lowercase or mixed case', () => {
        const input = '````Text with triple backtick at start but not at end```';
        const expected = 'Text with triple backtick at start but not at end';
        expect(maybeExtractTextBetweenQuotes(input)).toBe(expected);
    });

    it('should handle empty string', () => {
        const input = '';
        const expected = '';
        expect(maybeExtractTextBetweenQuotes(input)).toBe(expected);
    });

    it('should handle triple backticks only at the end', () => {
        const input = 'Text ending with triple backtick```';
        const expected = 'Text ending with triple backtick```';
        expect(maybeExtractTextBetweenQuotes(input)).toBe(expected);
    });

    it('should handle triple backticks at beginning, but not valid at the end', () => {
        const input = '````End without triple backtick!';
        const expected = 'End without triple backtick!';
        expect(maybeExtractTextBetweenQuotes(input)).toBe(expected);
    });
});
