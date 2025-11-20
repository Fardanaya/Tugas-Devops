import { createOrUpdate, deleteSeries } from '../series';
import { createClient } from '@/lib/supabase/server';

// Mock the Supabase client
jest.mock('@/lib/supabase/server');

describe('Series Actions', () => {
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

    describe('createOrUpdate Series', () => {
        it('should successfully create/update a series', async () => {
            const mockData = { id: '1', name: 'Test Series', description: 'Test Description' };
            mockSupabaseClient.from.mockReturnValue({
                upsert: jest.fn(() => ({
                    select: jest.fn(() => ({
                        single: jest.fn().mockResolvedValue({ data: mockData, error: null }),
                    })),
                })),
            });

            const result = await createOrUpdate(mockData);

            expect(result).toEqual(mockData);
            expect(mockCreateClient).toHaveBeenCalledTimes(1);
        });

        it('should throw an error when Supabase upsert fails', async () => {
            const mockData = { name: 'Test Series' };
            const mockError = new Error('Upsert failed');
            mockSupabaseClient.from.mockReturnValue({
                upsert: jest.fn(() => ({
                    select: jest.fn(() => ({
                        single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
                    })),
                })),
            });

            await expect(createOrUpdate(mockData)).rejects.toThrow('Upsert failed');
        });

        it('should handle complex series data with all fields', async () => {
            const mockData = {
                id: '123',
                name: 'Premium Series',
                description: 'A premium anime series',
                brand_id: 'brand-123',
                release_date: '2022-01-01',
                total_episodes: 24,
                genre: 'Romance, Comedy',
                rating: 9.2,
                popularity_score: 85,
                image_url: 'https://example.com/series.jpg',
                status: 'completed',
                is_deleted: false,
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-01-01T00:00:00Z'
            };

            mockSupabaseClient.from.mockReturnValue({
                upsert: jest.fn(() => ({
                    select: jest.fn(() => ({
                        single: jest.fn().mockResolvedValue({ data: mockData, error: null }),
                    })),
                })),
            });

            const result = await createOrUpdate(mockData);

            expect(result).toEqual(mockData);
        });

        it('should handle minimal series data', async () => {
            const mockData = { name: 'Minimal Series' };
            mockSupabaseClient.from.mockReturnValue({
                upsert: jest.fn(() => ({
                    select: jest.fn(() => ({
                        single: jest.fn().mockResolvedValue({ data: mockData, error: null }),
                    })),
                })),
            });

            const result = await createOrUpdate(mockData);

            expect(result).toEqual(mockData);
        });

        it('should handle series update with id', async () => {
            const mockData = { id: 'existing-series', name: 'Updated Series Name' };
            mockSupabaseClient.from.mockReturnValue({
                upsert: jest.fn(() => ({
                    select: jest.fn(() => ({
                        single: jest.fn().mockResolvedValue({ data: mockData, error: null }),
                    })),
                })),
            });

            const result = await createOrUpdate(mockData);

            expect(result).toEqual(mockData);
        });
    });

    describe('deleteSeries', () => {
        it('should successfully delete a series', async () => {
            const mockId = 'series-123';
            const mockResponse = { id: mockId, is_deleted: true };

            mockSupabaseClient.from.mockReturnValue({
                update: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        select: jest.fn(() => ({
                            single: jest.fn().mockResolvedValue({ data: mockResponse, error: null }),
                        })),
                    })),
                })),
            });

            const result = await deleteSeries(mockId);

            expect(result).toEqual(mockResponse);
            expect(mockCreateClient).toHaveBeenCalledTimes(1);
        });

        it('should throw an error when Supabase update fails during delete', async () => {
            const mockId = 'series-123';
            const mockError = new Error('Series deletion failed');

            mockSupabaseClient.from.mockReturnValue({
                update: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        select: jest.fn(() => ({
                            single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
                        })),
                    })),
                })),
            });

            await expect(deleteSeries(mockId)).rejects.toThrow('Series deletion failed');
        });

        it('should handle various series ID formats', async () => {
            const testCases = [
                'simple-series-id',
                '123e4567-e89b-12d3-a456-426614174000',
                'series_with_underscore',
                'series-with-dash'
            ];

            mockSupabaseClient.from.mockReturnValue({
                update: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        select: jest.fn(() => ({
                            single: jest.fn().mockResolvedValue({ data: { id: 'test' }, error: null }),
                        })),
                    })),
                })),
            });

            for (const id of testCases) {
                jest.clearAllMocks();
                mockCreateClient.mockResolvedValue(mockSupabaseClient);

                await expect(deleteSeries(id)).resolves.toBeDefined();
            }
        });

        it('should handle non-existent series id', async () => {
            const mockId = 'non-existent';
            const mockError = new Error('Series not found');

            mockSupabaseClient.from.mockReturnValue({
                update: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        select: jest.fn(() => ({
                            single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
                        })),
                    })),
                })),
            });

            await expect(deleteSeries(mockId)).rejects.toThrow('Series not found');
        });

        it('should handle empty string id', async () => {
            const mockId = '';
            const mockError = new Error('Invalid series ID');

            mockSupabaseClient.from.mockReturnValue({
                update: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        select: jest.fn(() => ({
                            single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
                        })),
                    })),
                })),
            });

            await expect(deleteSeries(mockId)).rejects.toThrow('Invalid series ID');
        });
    });
});
