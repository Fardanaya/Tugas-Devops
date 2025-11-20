module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@components/(.*)$': '<rootDir>/src/components/$1',
        '^@lib/(.*)$': '<rootDir>/src/lib/$1',
        '^@app/(.*)$': '<rootDir>/src/app/$1',
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js)',
        '<rootDir>/src/**/*.test.(ts|tsx|js)',
    ],
    reporters: [
        'default',
        ['jest-html-reporter', {
            pageTitle: 'Cloudyrent Master Data Unit Tests',
            outputPath: './test-results/unit-tests.html',
            includeFailureMsg: true,
            includeStackTrace: true,
            includeSuiteFailure: true,
            styleOverridePath: false,
        }],
    ],
    collectCoverageFrom: [
        'src/lib/actions/*.ts',
    ],
    coverageReporters: ['text', 'lcov', 'html'],
    coverageDirectory: './test-results/coverage',
};
