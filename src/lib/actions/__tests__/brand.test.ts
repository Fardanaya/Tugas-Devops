import { createOrUpdateBrands, deleteBrand } from '../brand';
import { createClient } from '@/lib/supabase/server';

// Mock the Supabase client
jest.mock('@/lib/supabase/server');

describe('Brand Actions', () => {
    const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
    let mockSupabaseClient: any;

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup mock Supabase client
        mockSupabaseClient = {
            from: jest.fn().mockReturnValue({
                upsert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn(),
                    }),
                }),
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        select: jest.fn().mockReturnValue({
                            single: jest.fn(),
                        }),
                    }),
                }),
            }),
        };

        mockCreateClient.mockResolvedValue(mockSupabaseClient);
    });

    describe('Positive Tests', () => {
        it('should successfully create a brand with valid minimal data', async () => {
            const mockData = { name: 'Test Brand' };
            const mockResponse = { id: '123', name: 'Test Brand' };

            mockSupabaseClient.from.mockReturnValue({
                upsert: jest.fn(() => ({
                    select: jest.fn(() => ({
                        single: jest.fn().mockResolvedValue({ data: mockResponse, error: null }),
                    })),
                })),
            });

            const result = await createOrUpdateBrands(mockData);

            expect(result).toEqual(mockResponse);
            expect(mockCreateClient).toHaveBeenCalledTimes(1);
        });

        it('should successfully update a brand with existing id', async () => {
            const mockData = { id: 'existing-123', name: 'Updated Brand Name' };
            const mockResponse = { ...mockData, description: 'Updated description' };

            mockSupabaseClient.from.mockReturnValue({
                upsert: jest.fn(() => ({
                    select: jest.fn(() => ({
                        single: jest.fn().mockResolvedValue({ data: mockResponse, error: null }),
                    })),
                })),
            });

            const result = await createOrUpdateBrands(mockData);

            expect(result).toEqual(mockResponse);
        });

        it('should successfully delete a brand', async () => {
            const mockId = 'brand-123';
            const mockResponse = { id: mockId, is_deleted: true, name: 'Deleted Brand' };

            mockSupabaseClient.from.mockReturnValue({
                update: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        select: jest.fn(() => ({
                            single: jest.fn().mockResolvedValue({ data: mockResponse, error: null }),
                        })),
                    })),
                })),
            });

            const result = await deleteBrand(mockId);

            expect(result).toEqual(mockResponse);
            expect(mockCreateClient).toHaveBeenCalledTimes(1);
        });
    });

    describe('Negative Tests', () => {
        it('should throw error when creating brand with empty name', async () => {
            const mockError = new Error('Brand name is required');
            mockSupabaseClient.from.mockReturnValue({
                upsert: jest.fn(() => ({
                    select: jest.fn(() => ({
                        single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
                    })),
                })),
            });

            await expect(createOrUpdateBrands({ name: '' })).rejects.toThrow('Brand name is required');
        });

        it('should throw error when database operation fails', async () => {
            const mockData = { name: 'Test Brand' };
            const mockError = new Error('Database connection failed');

            mockSupabaseClient.from.mockReturnValue({
                upsert: jest.fn(() => ({
                    select: jest.fn(() => ({
                        single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
                    })),
                })),
            });

            await expect(createOrUpdateBrands(mockData)).rejects.toThrow('Database connection failed');
        });

        it('should throw error when deleting non-existent brand', async () => {
            const mockId = 'non-existent-id';
            const mockError = new Error('Brand not found');

            mockSupabaseClient.from.mockReturnValue({
                update: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        select: jest.fn(() => ({
                            single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
                        })),
                    })),
                })),
            });

            await expect(deleteBrand(mockId)).rejects.toThrow('Brand not found');
        });
    });

    describe('Boundary Checks', () => {
        it('should handle brand name with maximum length', async () => {
            const maxLengthName = 'A'.repeat(255); // Assuming 255 char limit
            const mockData = { name: maxLengthName };
            const mockResponse = { id: '123', name: maxLengthName };

            mockSupabaseClient.from.mockReturnValue({
                upsert: jest.fn(() => ({
                    select: jest.fn(() => ({
                        single: jest.fn().mockResolvedValue({ data: mockResponse, error: null }),
                    })),
                })),
            });

            const result = await createOrUpdateBrands(mockData);
            expect(result.name.length).toBe(255);
        });

        it('should handle brand with empty optional fields', async () => {
            const mockData = {
                name: 'Minimal Brand',
                description: '',
                slogan: '',
                website: '',
                country: null
            };
            const mockResponse = { id: '123', ...mockData };

            mockSupabaseClient.from.mockReturnValue({
                upsert: jest.fn(() => ({
                    select: jest.fn(() => ({
                        single: jest.fn().mockResolvedValue({ data: mockResponse, error: null }),
                    })),
                })),
            });

            const result = await createOrUpdateBrands(mockData);
            expect(result.description).toBe('');
            expect(result.slogan).toBe('');
            expect(result.website).toBe('');
            expect(result.country).toBeNull();
        });

        it('should handle extreme numeric values for usage_limit', async () => {
            const mockData = {
                name: 'Brand with Limits',
                usage_limit: 999999999, // Large number
                per_user_limit: 1 // Minimum allowed
            };
            const mockResponse = { id: '123', ...mockData };

            mockSupabaseClient.from.mockReturnValue({
                upsert: jest.fn(() => ({
                    select: jest.fn(() => ({
                        single: jest.fn().mockResolvedValue({ data: mockResponse, error: null }),
                    })),
                })),
            });

            const result = await createOrUpdateBrands(mockData);
            expect(result.usage_limit).toBe(999999999);
            expect(result.per_user_limit).toBe(1);
        });

        it('should handle null/undefined values', async () => {
            const mockData = {
                name: 'Brand with Nulls',
                description: null,
                slogan: undefined,
                website: null,
                country: undefined
            };
            const mockResponse = { id: '123', ...mockData };

            mockSupabaseClient.from.mockReturnValue({
                upsert: jest.fn(() => ({
                    select: jest.fn(() => ({
                        single: jest.fn().mockResolvedValue({ data: mockResponse, error: null }),
                    })),
                })),
            });

            const result = await createOrUpdateBrands(mockData);
            expect(result.description).toBeNull();
            expect(result.slogan).toBeUndefined();
        });

        it('should handle UUID and special characters in brand ID', async () => {
            const validUuid = '550e8400-e29b-41d4-a716-446655440000';
            const mockId = 'brand_123-TEST';
            const mockResponse = { id: validUuid, is_deleted: true };

            mockSupabaseClient.from.mockReturnValue({
                update: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        select: jest.fn(() => ({
                            single: jest.fn().mockResolvedValue({ data: mockResponse, error: null }),
                        })),
                    })),
                })),
            });

            const result = await deleteBrand(mockId);
            expect(result).toEqual(mockResponse);
            expect(mockCreateClient).toHaveBeenCalledTimes(1);
        });
    });
});

