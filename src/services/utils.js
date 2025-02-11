function maybeExtractTextBetweenQuotes(text) {
    const match = text.match(/```(.+?)```/s);
    return match ? match[1] : text;
}

module.exports = { maybeExtractTextBetweenQuotes };
