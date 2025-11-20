import { createOrUpdate, deleteCharacter } from '../character';
import { createClient } from '@/lib/supabase/server';

// Mock the Supabase client
jest.mock('@/lib/supabase/server');

describe('Character Actions', () => {
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
        it('should successfully create a character with valid minimal data', async () => {
            const mockData = { name: 'Test Character' };
            const mockResponse = { id: '123', name: 'Test Character' };

            mockSupabaseClient.from.mockReturnValue({
                upsert: jest.fn(() => ({
                    select: jest.fn(() => ({
                        single: jest.fn().mockResolvedValue({ data: mockResponse, error: null }),
                    })),
                })),
            });

            const result = await createOrUpdate(mockData);

            expect(result).toEqual(mockResponse);
            expect(mockCreateClient).toHaveBeenCalledTimes(1);
        });

        it('should successfully update a character with existing id', async () => {
            const mockData = { id: 'existing-char-123', name: 'Updated Character Name' };
            const mockResponse = { ...mockData, description: 'Updated description' };

            mockSupabaseClient.from.mockReturnValue({
                upsert: jest.fn(() => ({
                    select: jest.fn(() => ({
                        single: jest.fn().mockResolvedValue({ data: mockResponse, error: null }),
                    })),
                })),
            });

            const result = await createOrUpdate(mockData);

            expect(result).toEqual(mockResponse);
        });

        it('should successfully delete a character', async () => {
            const mockId = 'char-123';
            const mockResponse = { id: mockId, is_deleted: true, name: 'Deleted Character' };

            mockSupabaseClient.from.mockReturnValue({
                update: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        select: jest.fn(() => ({
                            single: jest.fn().mockResolvedValue({ data: mockResponse, error: null }),
                        })),
                    })),
                })),
            });

            const result = await deleteCharacter(mockId);

            expect(result).toEqual(mockResponse);
            expect(mockCreateClient).toHaveBeenCalledTimes(1);
        });
    });

    describe('Negative Tests', () => {
        it('should throw error when creating character with empty name', async () => {
            const mockError = new Error('Character name is required');
            mockSupabaseClient.from.mockReturnValue({
                upsert: jest.fn(() => ({
                    select: jest.fn(() => ({
                        single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
                    })),
                })),
            });

            await expect(createOrUpdate({ name: '' })).rejects.toThrow('Character name is required');
        });

        it('should throw error when database operation fails', async () => {
            const mockData = { name: 'Test Character' };
            const mockError = new Error('Database connection failed');

            mockSupabaseClient.from.mockReturnValue({
                upsert: jest.fn(() => ({
                    select: jest.fn(() => ({
                        single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
                    })),
                })),
            });

            await expect(createOrUpdate(mockData)).rejects.toThrow('Database connection failed');
        });

        it('should throw error when deleting non-existent character', async () => {
            const mockId = 'non-existent-char';
            const mockError = new Error('Character not found');

            mockSupabaseClient.from.mockReturnValue({
                update: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        select: jest.fn(() => ({
                            single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
                        })),
                    })),
                })),
            });

            await expect(deleteCharacter(mockId)).rejects.toThrow('Character not found');
        });
    });

    describe('Boundary Checks', () => {
        it('should handle character name with maximum length', async () => {
            const maxLengthName = 'A'.repeat(255);
            const mockData = { name: maxLengthName };
            const mockResponse = { id: '123', name: maxLengthName };

            mockSupabaseClient.from.mockReturnValue({
                upsert: jest.fn(() => ({
                    select: jest.fn(() => ({
                        single: jest.fn().mockResolvedValue({ data: mockResponse, error: null }),
                    })),
                })),
            });

            const result = await createOrUpdate(mockData);
            expect(result.name.length).toBe(255);
        });

        it('should handle character with extreme popularity score', async () => {
            const mockData = {
                name: 'Popular Character',
                popularity_score: 999999999,
                traits: []
            };
            const mockResponse = { id: '123', ...mockData };

            mockSupabaseClient.from.mockReturnValue({
                upsert: jest.fn(() => ({
                    select: jest.fn(() => ({
                        single: jest.fn().mockResolvedValue({ data: mockResponse, error: null }),
                    })),
                })),
            });

            const result = await createOrUpdate(mockData);
            expect(result.popularity_score).toBe(999999999);
        });

        it('should handle UUID and special characters in character ID', async () => {
            const validUuid = '550e8400-e29b-41d4-a716-446655440000';
            const mockId = 'character_123-TEST@スペシャル';
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

            const result = await deleteCharacter(mockId);
            expect(result.id).toBe(validUuid);
            expect(result.is_deleted).toBe(true);
        });
    });
});
