import {coverageConfigDefaults, defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        include: ['test/**/*.spec.ts', 'test/**/*.test.ts'],
        exclude: ['node_modules', 'build'],
        environment: 'node',
        globals: false,
        snapshotSerializers: ['./test/html-snapshot-serializer.ts'],
        snapshotFormat: {
            escapeString: true,
            printBasicPrototype: false,
        },
        coverage: {
            provider: 'v8',
            include: ['src/**'],
            exclude: ['test/**', ...coverageConfigDefaults.exclude],
            reporter: ['text', 'json', 'html', 'lcov'],
        },
    },
});
