export default {
    transform: {},
    coverageThreshold: {
        global: {
            lines: 90,
            statements: 90,
            functions: 90,
            branches: 80,
        },
    },
    testMatch: ['**/*.test.js'],
    setupFilesAfterEnv: ['./tests/jest.setup.js'],
    collectCoverageFrom: [`**/src/**/*.js`, `!**/src/server.js`],
    coverageReporters: ['text', 'cobertura'],
};
