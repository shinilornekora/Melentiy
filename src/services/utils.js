const CODE_SYM = '```';

function maybeExtractTextBetweenQuotes(text) {
    const TEXT_LENGTH = text.length;
    const startsAsCode = text.slice(0, 3) === CODE_SYM;
    const endsAsCode = text.slice(TEXT_LENGTH - 3, TEXT_LENGTH) === CODE_SYM;

    if (startsAsCode && endsAsCode) {
        return text.slice(3, TEXT_LENGTH - 3);
    }

    // Маркдаун не пройдет.
    if (startsAsCode) {
        return text.slice(3, TEXT_LENGTH);
    }

    return text;
}

module.exports = { maybeExtractTextBetweenQuotes };
