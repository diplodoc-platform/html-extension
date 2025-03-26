/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    testEnvironment: 'jsdom',
    transformIgnorePatterns: [],
    snapshotSerializers: ['jest-serializer-html'],
    transform: {
        '^.+\\.(j|t)s?$': [
            'ts-jest',
            {
                tsconfig: './tsconfig.json',
                diagnostics: true,
                isolatedModules: true,
            },
        ],
    },
};
