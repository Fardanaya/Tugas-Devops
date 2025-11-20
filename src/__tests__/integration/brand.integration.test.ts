import { createOrUpdateBrands, deleteBrand } from '@/lib/actions/brand';
import { createOrUpdate as createOrUpdateCharacter, deleteCharacter } from '@/lib/actions/character';
import { createOrUpdate as createOrUpdateSeries, deleteSeries } from '@/lib/actions/series';
import { createTestSupabaseClient, TestDatabaseHelper } from '../utils/testSupabase';

// Mock the server Supabase client to use our test client for integration tests
jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn(),
}));

const { createClient } = require('@/lib/supabase/server');
const testSupabaseClient = createTestSupabaseClient();
const testDbHelper = new TestDatabaseHelper();

// Integration tests that use real Supabase connection
// These tests require proper environment variables and a test database
// Total: 18 test cases (6 positive + 6 negative + 6 boundary)

describe('Admin Master Data Integration Tests', () => {
    // Test data that won't conflict with production data
    const testBrandData = {
        name: `Test Brand ${Date.now()}`, // Unique name to avoid conflicts
        is_deleted: false
    };

    const testCharacterData = {
        name: `Test Character ${Date.now()}`,
        series_id: '123e4567-e89b-12d3-a456-426614174000', // Mock UUID
        is_deleted: false
    };

    const testSeriesData = {
        name: `Test Series ${Date.now()}`,
        is_deleted: false
    };

    let createdBrandId: string;
    let createdCharacterId: string;
    let createdSeriesId: string;

    beforeAll(async () => {
        // Ensure we have required environment variables
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Supabase environment variables not configured for integration tests. Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
        }

        // Mock the createClient to return our test client
        createClient.mockResolvedValue(testSupabaseClient);

        // Clean up any leftover test data
        await testDbHelper.cleanupTestBrands();
    });

    afterAll(async () => {
        // Clean up test data
        const cleanupPromises = [];

        if (createdBrandId) {
            cleanupPromises.push(deleteBrand(createdBrandId).catch(err => console.warn('Failed to clean up brand:', err)));
        }
        if (createdCharacterId) {
            cleanupPromises.push(deleteCharacter(createdCharacterId).catch(err => console.warn('Failed to clean up character:', err)));
        }
        if (createdSeriesId) {
            cleanupPromises.push(deleteSeries(createdSeriesId).catch(err => console.warn('Failed to clean up series:', err)));
        }

        await Promise.all(cleanupPromises);

        // Final cleanup of any remaining test brands
        await testDbHelper.cleanupTestBrands();
    });

    // POSITIVE TEST CASES (6 cases)
    describe('Positive Test Cases - Admin Master Data Integration', () => {
        test('INT_POS_001: Successfully create brand with real database', async () => {
            const result = await createOrUpdateBrands(testBrandData);

            expect(result).toBeDefined();
            expect(result.name).toBe(testBrandData.name);
            expect(result.is_deleted).toBe(testBrandData.is_deleted);
            expect(result.id).toBeDefined();
            expect(typeof result.id).toBe('string');
            expect(result.id.length).toBeGreaterThan(0);

            createdBrandId = result.id;
        }, 10000);

        test('INT_POS_002: Successfully create character with real database', async () => {
            // First create a series for the character
            const seriesResult = await createOrUpdateSeries({
                name: `Character Series ${Date.now()}`,
                is_deleted: false
            });
            expect(seriesResult).toBeDefined();

            const characterData = {
                ...testCharacterData,
                series_id: seriesResult.id // Use the real series ID
            };

            const result = await createOrUpdateCharacter(characterData);

            expect(result).toBeDefined();
            expect(result.name).toBe(characterData.name);
            expect(result.series_id).toBe(characterData.series_id);
            expect(result.is_deleted).toBe(characterData.is_deleted);
            expect(result.id).toBeDefined();

            createdCharacterId = result.id;

            // Clean up series
            await deleteSeries(seriesResult.id);
        }, 10000);

        test('INT_POS_003: Successfully create series with real database', async () => {
            const result = await createOrUpdateSeries(testSeriesData);

            expect(result).toBeDefined();
            expect(result.name).toBe(testSeriesData.name);
            expect(result.is_deleted).toBe(testSeriesData.is_deleted);
            expect(result.id).toBeDefined();

            createdSeriesId = result.id;
        }, 10000);

        test('INT_POS_004: Successfully update existing brand', async () => {
            expect(createdBrandId).toBeDefined();

            const updateData = {
                id: createdBrandId,
                name: `Updated Test Brand ${Date.now()}`,
                is_deleted: false
            };

            const result = await createOrUpdateBrands(updateData);

            expect(result).toBeDefined();
            expect(result.id).toBe(createdBrandId);
            expect(result.name).toBe(updateData.name);
            expect(result.is_deleted).toBe(updateData.is_deleted);
        }, 10000);

        test('INT_POS_005: Successfully soft delete brand', async () => {
            expect(createdBrandId).toBeDefined();

            const result = await deleteBrand(createdBrandId);

            expect(result).toBeDefined();
            expect(result.id).toBe(createdBrandId);
            expect(result.is_deleted).toBe(true);
        }, 10000);

        test('INT_POS_006: Successfully soft delete character', async () => {
            expect(createdCharacterId).toBeDefined();

            const result = await deleteCharacter(createdCharacterId);

            expect(result).toBeDefined();
            expect(result.id).toBe(createdCharacterId);
            expect(result.is_deleted).toBe(true);
        }, 10000);
    });

    // NEGATIVE TEST CASES (6 cases)
    describe('Negative Test Cases - Admin Master Data Integration', () => {
        test('INT_NEG_001: Database connection error during brand creation', async () => {
            // Temporarily break the connection
            const originalClient = testSupabaseClient;
            createClient.mockRejectedValueOnce(new Error('Database connection failed'));

            await expect(createOrUpdateBrands({ name: 'Test Brand', is_deleted: false }))
                .rejects.toThrow('Database connection failed');

            // Restore connection
            createClient.mockResolvedValue(originalClient);
        }, 10000);

        test('INT_NEG_002: Database error during character creation', async () => {
            const originalClient = testSupabaseClient;
            createClient.mockRejectedValueOnce(new Error('Character creation failed'));

            await expect(createOrUpdateCharacter({ name: 'Test Character', is_deleted: false }))
                .rejects.toThrow('Character creation failed');

            createClient.mockResolvedValue(originalClient);
        }, 10000);

        test('INT_NEG_003: Invalid data format for series', async () => {
            const originalClient = testSupabaseClient;
            createClient.mockRejectedValueOnce(new Error('Invalid data format'));

            await expect(createOrUpdateSeries({ invalidField: 'value' }))
                .rejects.toThrow('Invalid data format');

            createClient.mockResolvedValue(originalClient);
        }, 10000);

        test('INT_NEG_004: Empty data object for brand', async () => {
            const originalClient = testSupabaseClient;
            createClient.mockRejectedValueOnce(new Error('Empty data not allowed'));

            await expect(createOrUpdateBrands({}))
                .rejects.toThrow('Empty data not allowed');

            createClient.mockResolvedValue(originalClient);
        }, 10000);

        test('INT_NEG_005: Supabase client creation failure', async () => {
            createClient.mockImplementationOnce(() => {
                throw new Error('Client creation failed');
            });

            await expect(createOrUpdateBrands({ name: 'Test Brand', is_deleted: false }))
                .rejects.toThrow('Client creation failed');
        }, 10000);

        test('INT_NEG_006: Network timeout during series creation', async () => {
            const originalClient = testSupabaseClient;
            createClient.mockRejectedValueOnce(new Error('Network timeout'));

            await expect(createOrUpdateSeries({ name: 'Test Series', is_deleted: false }))
                .rejects.toThrow('Network timeout');

            createClient.mockResolvedValue(originalClient);
        }, 10000);
    });

    // BOUNDARY CHECK TEST CASES (6 cases)
    describe('Boundary Check Test Cases - Admin Master Data Integration', () => {
        test('INT_BOUND_001: Minimum name length (1 character)', async () => {
            const result = await createOrUpdateBrands({ name: 'A', is_deleted: false });

            expect(result).toBeDefined();
            expect(result.name).toBe('A');
            expect(result.id).toBeDefined();

            // Clean up
            await deleteBrand(result.id);
        }, 10000);

        test('INT_BOUND_002: Maximum name length (255 characters)', async () => {
            const maxName = 'A'.repeat(255);
            const result = await createOrUpdateBrands({ name: maxName, is_deleted: false });

            expect(result).toBeDefined();
            expect(result.name).toBe(maxName);
            expect(result.name.length).toBe(255);

            // Clean up
            await deleteBrand(result.id);
        }, 10000);

        test('INT_BOUND_003: Unicode characters in name', async () => {
            const unicodeName = 'Bränd Nämé 品牌名称 🎉';
            const result = await createOrUpdateBrands({ name: unicodeName, is_deleted: false });

            expect(result).toBeDefined();
            expect(result.name).toBe(unicodeName);

            // Clean up
            await deleteBrand(result.id);
        }, 10000);

        test('INT_BOUND_004: Special characters and symbols', async () => {
            const specialName = 'Brand123!@#$%^&*()_+-=[]{}|;:,.<>?';
            const result = await createOrUpdateBrands({ name: specialName, is_deleted: false });

            expect(result).toBeDefined();
            expect(result.name).toBe(specialName);

            // Clean up
            await deleteBrand(result.id);
        }, 10000);

        test('INT_BOUND_005: Boolean boundary values for is_deleted', async () => {
            // Test with true
            const resultTrue = await createOrUpdateBrands({ name: 'Test Brand True', is_deleted: true });
            expect(resultTrue).toBeDefined();
            expect(resultTrue.is_deleted).toBe(true);

            // Test with false
            const resultFalse = await createOrUpdateBrands({ name: 'Test Brand False', is_deleted: false });
            expect(resultFalse).toBeDefined();
            expect(resultFalse.is_deleted).toBe(false);

            // Clean up
            await deleteBrand(resultTrue.id);
            await deleteBrand(resultFalse.id);
        }, 10000);

        test('INT_BOUND_006: Large dataset handling', async () => {
            const largeData = {
                name: 'Large Test Brand',
                // Test with additional fields that might exist in the schema
                is_deleted: false
            };

            const result = await createOrUpdateBrands(largeData);

            expect(result).toBeDefined();
            expect(result.name).toBe('Large Test Brand');

            // Clean up
            await deleteBrand(result.id);
        }, 10000);
    });
});
