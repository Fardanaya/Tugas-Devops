// Optional setup for Jest
// You can configure global mocks, test utilities, etc.

// Mock Supabase client for testing server actions
jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn(),
}));

// Mock Next.js cookies since server actions use them via Supabase
jest.mock('next/headers', () => ({
    cookies: jest.fn(() => ({
        get: jest.fn(),
        getAll: jest.fn(),
        set: jest.fn(),
        remove: jest.fn(),
    })),
    remove: jest.fn(),
}));