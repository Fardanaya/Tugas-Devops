import { createOrUpdateBrands, deleteBrand } from '@/lib/actions/brand';

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn(),
}));

const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
};

const { createClient } = require('@/lib/supabase/server');

describe('Brand Actions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        createClient.mockResolvedValue(mockSupabase);
    });

    // POSITIVE TEST CASES (6 cases)
    describe('Positive Test Cases - createOrUpdateBrands', () => {
        test('TC_POS_001: Successfully create new brand', async () => {
            const newBrand = { name: 'New Brand' };
            const expectedResult = { id: '123', name: 'New Brand', is_deleted: false };

            mockSupabase.single.mockResolvedValue({ data: expectedResult, error: null });

            const result = await createOrUpdateBrands(newBrand);

            expect(createClient).toHaveBeenCalled();
            expect(mockSupabase.from).toHaveBeenCalledWith('brands');
            expect(mockSupabase.upsert).toHaveBeenCalledWith(newBrand);
            expect(mockSupabase.select).toHaveBeenCalledWith();
            expect(mockSupabase.single).toHaveBeenCalled();
            expect(result).toEqual(expectedResult);
        });

        test('TC_POS_002: Successfully update existing brand', async () => {
            const updateBrand = { id: '123', name: 'Updated Brand' };
            const expectedResult = { id: '123', name: 'Updated Brand', is_deleted: false };

            mockSupabase.single.mockResolvedValue({ data: expectedResult, error: null });

            const result = await createOrUpdateBrands(updateBrand);

            expect(mockSupabase.upsert).toHaveBeenCalledWith(updateBrand);
            expect(result).toEqual(expectedResult);
        });

        test('TC_POS_003: Create brand with is_deleted field', async () => {
            const newBrand = { name: 'Test Brand', is_deleted: false };
            const expectedResult = { id: '456', name: 'Test Brand', is_deleted: false };

            mockSupabase.single.mockResolvedValue({ data: expectedResult, error: null });

            const result = await createOrUpdateBrands(newBrand);

            expect(result).toEqual(expectedResult);
        });

        test('TC_POS_004: Update brand with is_deleted true', async () => {
            const updateBrand = { id: '789', name: 'Deleted Brand', is_deleted: true };
            const expectedResult = { id: '789', name: 'Deleted Brand', is_deleted: true };

            mockSupabase.single.mockResolvedValue({ data: expectedResult, error: null });

            const result = await createOrUpdateBrands(updateBrand);

            expect(result).toEqual(expectedResult);
        });

        test('TC_POS_005: Create brand with special characters', async () => {
            const newBrand = { name: 'Brand & Co. ©' };
            const expectedResult = { id: '101', name: 'Brand & Co. ©', is_deleted: false };

            mockSupabase.single.mockResolvedValue({ data: expectedResult, error: null });

            const result = await createOrUpdateBrands(newBrand);

            expect(result).toEqual(expectedResult);
        });

        test('TC_POS_006: Create brand with long name', async () => {
            const longName = 'A'.repeat(100);
            const newBrand = { name: longName };
            const expectedResult = { id: '202', name: longName, is_deleted: false };

            mockSupabase.single.mockResolvedValue({ data: expectedResult, error: null });

            const result = await createOrUpdateBrands(newBrand);

            expect(result).toEqual(expectedResult);
        });
    });

    // NEGATIVE TEST CASES (6 cases)
    describe('Negative Test Cases - createOrUpdateBrands', () => {
        test('TC_NEG_001: Database error during creation', async () => {
            const newBrand = { name: 'Test Brand' };
            const dbError = new Error('Database connection failed');

            mockSupabase.single.mockResolvedValue({ data: null, error: dbError });

            await expect(createOrUpdateBrands(newBrand)).rejects.toThrow('Database connection failed');
        });

        test('TC_NEG_002: Invalid data format', async () => {
            const invalidBrand = { invalidField: 'value' };

            mockSupabase.single.mockResolvedValue({ data: null, error: new Error('Invalid data') });

            await expect(createOrUpdateBrands(invalidBrand)).rejects.toThrow('Invalid data');
        });

        test('TC_NEG_003: Empty brand object', async () => {
            const emptyBrand = {};

            mockSupabase.single.mockResolvedValue({ data: null, error: new Error('Empty data') });

            await expect(createOrUpdateBrands(emptyBrand)).rejects.toThrow('Empty data');
        });

        test('TC_NEG_004: Supabase client creation fails', async () => {
            createClient.mockImplementation(() => {
                throw new Error('Client creation failed');
            });

            const newBrand = { name: 'Test Brand' };

            await expect(createOrUpdateBrands(newBrand)).rejects.toThrow('Client creation failed');
        });

        test('TC_NEG_005: Network timeout error', async () => {
            const newBrand = { name: 'Test Brand' };

            mockSupabase.single.mockRejectedValue(new Error('Network timeout'));

            await expect(createOrUpdateBrands(newBrand)).rejects.toThrow('Network timeout');
        });

        test('TC_NEG_006: Permission denied error', async () => {
            const newBrand = { name: 'Test Brand' };

            const permissionError = new Error('Permission denied');
            (permissionError as any).code = 'PGRST301';

            mockSupabase.single.mockResolvedValue({
                data: null,
                error: permissionError
            });

            await expect(createOrUpdateBrands(newBrand)).rejects.toThrow('Permission denied');
        });
    });

    // BOUNDARY CHECK TEST CASES (6 cases)
    describe('Boundary Check Test Cases - createOrUpdateBrands', () => {
        test('TC_BOUND_001: Minimum name length (1 character)', async () => {
            const minBrand = { name: 'A' };
            const expectedResult = { id: '303', name: 'A', is_deleted: false };

            mockSupabase.single.mockResolvedValue({ data: expectedResult, error: null });

            const result = await createOrUpdateBrands(minBrand);
            expect(result).toEqual(expectedResult);
        });

        test('TC_BOUND_002: Maximum name length (255 characters)', async () => {
            const maxName = 'A'.repeat(255);
            const maxBrand = { name: maxName };
            const expectedResult = { id: '404', name: maxName, is_deleted: false };

            mockSupabase.single.mockResolvedValue({ data: expectedResult, error: null });

            const result = await createOrUpdateBrands(maxBrand);
            expect(result).toEqual(expectedResult);
        });

        test('TC_BOUND_003: Name with Unicode characters', async () => {
            const unicodeBrand = { name: 'Bränd Nämé 品牌名称' };
            const expectedResult = { id: '505', name: 'Bränd Nämé 品牌名称', is_deleted: false };

            mockSupabase.single.mockResolvedValue({ data: expectedResult, error: null });

            const result = await createOrUpdateBrands(unicodeBrand);
            expect(result).toEqual(expectedResult);
        });

        test('TC_BOUND_004: Name with numbers and symbols', async () => {
            const symbolBrand = { name: 'Brand123!@#$%^&*()' };
            const expectedResult = { id: '606', name: 'Brand123!@#$%^&*()', is_deleted: false };

            mockSupabase.single.mockResolvedValue({ data: expectedResult, error: null });

            const result = await createOrUpdateBrands(symbolBrand);
            expect(result).toEqual(expectedResult);
        });

        test('TC_BOUND_005: Boolean boundary values for is_deleted', async () => {
            // Test with true
            const brandTrue = { name: 'Test Brand', is_deleted: true };
            const resultTrue = { id: '707', name: 'Test Brand', is_deleted: true };

            mockSupabase.single.mockResolvedValueOnce({ data: resultTrue, error: null });

            const result1 = await createOrUpdateBrands(brandTrue);
            expect(result1.is_deleted).toBe(true);

            // Test with false
            const brandFalse = { name: 'Test Brand', is_deleted: false };
            const resultFalse = { id: '808', name: 'Test Brand', is_deleted: false };

            mockSupabase.single.mockResolvedValueOnce({ data: resultFalse, error: null });

            const result2 = await createOrUpdateBrands(brandFalse);
            expect(result2.is_deleted).toBe(false);
        });

        test('TC_BOUND_006: Large dataset handling', async () => {
            const largeBrand = {
                name: 'Large Brand Name',
                // Simulate large object
                metadata: 'x'.repeat(1000)
            };
            const expectedResult = { id: '909', ...largeBrand, is_deleted: false };

            mockSupabase.single.mockResolvedValue({ data: expectedResult, error: null });

            const result = await createOrUpdateBrands(largeBrand);
            expect(result.name).toBe('Large Brand Name');
        });
    });

    // POSITIVE TEST CASES for deleteBrand (3 cases)
    describe('Positive Test Cases - deleteBrand', () => {
        test('TC_POS_DEL_001: Successfully soft delete brand', async () => {
            const brandId = '123';
            const expectedResult = { id: '123', name: 'Test Brand', is_deleted: true };

            mockSupabase.single.mockResolvedValue({ data: expectedResult, error: null });

            const result = await deleteBrand(brandId);

            expect(createClient).toHaveBeenCalled();
            expect(mockSupabase.from).toHaveBeenCalledWith('brands');
            expect(mockSupabase.update).toHaveBeenCalledWith({ is_deleted: true });
            expect(mockSupabase.eq).toHaveBeenCalledWith('id', brandId);
            expect(result).toEqual(expectedResult);
        });

        test('TC_POS_DEL_002: Delete brand with valid UUID', async () => {
            const brandId = '123e4567-e89b-12d3-a456-426614174000';
            const expectedResult = { id: brandId, name: 'UUID Brand', is_deleted: true };

            mockSupabase.single.mockResolvedValue({ data: expectedResult, error: null });

            const result = await deleteBrand(brandId);
            expect(result).toEqual(expectedResult);
        });

        test('TC_POS_DEL_003: Delete non-existent brand (should still succeed)', async () => {
            const brandId = 'non-existent';
            const expectedResult = { id: brandId, name: 'Ghost Brand', is_deleted: true };

            mockSupabase.single.mockResolvedValue({ data: expectedResult, error: null });

            const result = await deleteBrand(brandId);
            expect(result).toEqual(expectedResult);
        });
    });

    // NEGATIVE TEST CASES for deleteBrand (3 cases)
    describe('Negative Test Cases - deleteBrand', () => {
        test('TC_NEG_DEL_001: Database error during deletion', async () => {
            const brandId = '123';

            mockSupabase.single.mockResolvedValue({ data: null, error: new Error('Delete failed') });

            await expect(deleteBrand(brandId)).rejects.toThrow('Delete failed');
        });

        test('TC_NEG_DEL_002: Empty brand ID', async () => {
            const brandId = '';

            mockSupabase.single.mockResolvedValue({ data: null, error: new Error('Invalid ID') });

            await expect(deleteBrand(brandId)).rejects.toThrow('Invalid ID');
        });

        test('TC_NEG_DEL_003: Permission denied for deletion', async () => {
            const brandId = '123';

            const permissionError = new Error('Permission denied');
            (permissionError as any).code = 'PGRST301';

            mockSupabase.single.mockResolvedValue({
                data: null,
                error: permissionError
            });

            await expect(deleteBrand(brandId)).rejects.toThrow('Permission denied');
        });
    });
});
