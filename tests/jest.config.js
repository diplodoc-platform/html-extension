/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'jsdom',
    transformIgnorePatterns: [],
    snapshotSerializers: ['jest-serializer-html'],
    transform: {
        '^.+\\.(j|t)s?$': ['esbuild-jest', {tsconfig: './tsconfig.json'}],
    },
};
