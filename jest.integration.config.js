const nextJest = require('next/jest')

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env.test files
    dir: './',
})

// Load test environment variables
require('dotenv').config({ path: '.env.test' })

// Integration test config - uses real database connections
const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
        // Handle module aliases (this will be automatically configured for you based on your tsconfig.json paths)
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    testEnvironment: 'jest-environment-jsdom',
    testMatch: [
        '<rootDir>/src/__tests__/integration/**/*.test.ts',
        '<rootDir>/src/__tests__/integration/**/*.test.js',
    ],
    testTimeout: 30000, // 30 seconds for integration tests
    reporters: [
        'default',
        ['jest-html-reporter', {
            outputPath: 'integration-test-report.html',
            pageTitle: 'Cloudyrent Integration Test Report',
            includeFailureMsg: true,
            includeConsoleLog: true
        }]
    ],
    // Don't collect coverage for integration tests by default
    collectCoverage: false,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
