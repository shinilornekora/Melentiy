module.exports = {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    testMatch: [
        "**/?(*.)+(spec|test).[tj]s?(x)"
    ],
    globals: {
        "ts-jest": {
            useESM: true
        }
    }
};

