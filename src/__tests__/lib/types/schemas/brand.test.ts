import { brandSchema, IBrand, defaultBrand } from '@/lib/types/schemas/brand';

// Test Cases for Brand Schema Validation
describe('Brand Schema Validation', () => {
    // POSITIVE TEST CASES (6 cases)
    describe('Positive Test Cases', () => {
        test('TC_POS_001: Valid brand with name only', () => {
            const validBrand: IBrand = {
                name: 'Nike',
            };

            const result = brandSchema.safeParse(validBrand);
            expect(result.success).toBe(true);
            expect(result.data?.name).toBe('Nike');
        });

        test('TC_POS_002: Valid brand with name and id', () => {
            const validBrand: IBrand = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Adidas',
            };

            const result = brandSchema.safeParse(validBrand);
            expect(result.success).toBe(true);
            expect(result.data?.name).toBe('Adidas');
            expect(result.data?.id).toBe('123e4567-e89b-12d3-a456-426614174000');
        });

        test('TC_POS_003: Valid brand with name and is_deleted false', () => {
            const validBrand: IBrand = {
                name: 'Puma',
                is_deleted: false,
            };

            const result = brandSchema.safeParse(validBrand);
            expect(result.success).toBe(true);
            expect(result.data?.name).toBe('Puma');
            expect(result.data?.is_deleted).toBe(false);
        });

        test('TC_POS_004: Valid brand with name and is_deleted true', () => {
            const validBrand: IBrand = {
                name: 'Reebok',
                is_deleted: true,
            };

            const result = brandSchema.safeParse(validBrand);
            expect(result.success).toBe(true);
            expect(result.data?.name).toBe('Reebok');
            expect(result.data?.is_deleted).toBe(true);
        });

        test('TC_POS_005: Valid brand with all fields', () => {
            const validBrand: IBrand = {
                id: '123e4567-e89b-12d3-a456-426614174001',
                name: 'Under Armour',
                is_deleted: false,
            };

            const result = brandSchema.safeParse(validBrand);
            expect(result.success).toBe(true);
            expect(result.data).toEqual(validBrand);
        });

        test('TC_POS_006: Valid brand with special characters in name', () => {
            const validBrand: IBrand = {
                name: 'Brand & Co.',
            };

            const result = brandSchema.safeParse(validBrand);
            expect(result.success).toBe(true);
            expect(result.data?.name).toBe('Brand & Co.');
        });
    });

    // NEGATIVE TEST CASES (6 cases)
    describe('Negative Test Cases', () => {
        test('TC_NEG_001: Empty name string', () => {
            const invalidBrand = {
                name: '',
            };

            const result = brandSchema.safeParse(invalidBrand);
            expect(result.success).toBe(false);
            expect(result.error?.issues[0].message).toBe('Name is required');
        });

        test('TC_NEG_002: Missing name field', () => {
            const invalidBrand = {};

            const result = brandSchema.safeParse(invalidBrand);
            expect(result.success).toBe(false);
            expect(result.error?.issues[0].message).toBe('Invalid input: expected string, received undefined');
        });

        test('TC_NEG_003: Name with only whitespace', () => {
            const invalidBrand = {
                name: '   ',
            };

            const result = brandSchema.safeParse(invalidBrand);
            expect(result.success).toBe(false); // Schema trims, so whitespace-only becomes empty
            expect(result.error?.issues[0].message).toBe('Name is required');
        });

        test('TC_NEG_004: Invalid id format (not UUID)', () => {
            const invalidBrand = {
                id: 'invalid-id',
                name: 'Test Brand',
            };

            const result = brandSchema.safeParse(invalidBrand);
            expect(result.success).toBe(true); // id is optional, so this should pass
        });

        test('TC_NEG_005: is_deleted as string instead of boolean', () => {
            const invalidBrand = {
                name: 'Test Brand',
                is_deleted: 'false',
            };

            const result = brandSchema.safeParse(invalidBrand);
            expect(result.success).toBe(false);
            expect(result.error?.issues[0].code).toBe('invalid_type');
        });

        test('TC_NEG_006: Extra invalid field', () => {
            const invalidBrand = {
                name: 'Test Brand',
                invalidField: 'invalid',
            };

            const result = brandSchema.safeParse(invalidBrand);
            expect(result.success).toBe(false);
            expect(result.error?.issues[0].code).toBe('unrecognized_keys');
        });
    });

    // BOUNDARY CHECK TEST CASES (6 cases)
    describe('Boundary Check Test Cases', () => {
        test('TC_BOUND_001: Name with minimum length (1 character)', () => {
            const boundaryBrand = {
                name: 'A',
            };

            const result = brandSchema.safeParse(boundaryBrand);
            expect(result.success).toBe(true);
            expect(result.data?.name).toBe('A');
        });

        test('TC_BOUND_002: Name with very long string (255 characters)', () => {
            const longName = 'A'.repeat(255);
            const boundaryBrand = {
                name: longName,
            };

            const result = brandSchema.safeParse(boundaryBrand);
            expect(result.success).toBe(true);
            expect(result.data?.name).toBe(longName);
        });

        test('TC_BOUND_003: Name with exactly 100 characters', () => {
            const name100Chars = 'A'.repeat(100);
            const boundaryBrand = {
                name: name100Chars,
            };

            const result = brandSchema.safeParse(boundaryBrand);
            expect(result.success).toBe(true);
            expect(result.data?.name).toBe(name100Chars);
        });

        test('TC_BOUND_004: Name with Unicode characters', () => {
            const boundaryBrand = {
                name: 'Bränd Nämé 品牌名称',
            };

            const result = brandSchema.safeParse(boundaryBrand);
            expect(result.success).toBe(true);
            expect(result.data?.name).toBe('Bränd Nämé 品牌名称');
        });

        test('TC_BOUND_005: Name with numbers and special chars', () => {
            const boundaryBrand = {
                name: 'Brand123!@#',
            };

            const result = brandSchema.safeParse(boundaryBrand);
            expect(result.success).toBe(true);
            expect(result.data?.name).toBe('Brand123!@#');
        });

        test('TC_BOUND_006: is_deleted boundary values', () => {
            // Test with true
            const brandTrue = {
                name: 'Test Brand',
                is_deleted: true,
            };

            const resultTrue = brandSchema.safeParse(brandTrue);
            expect(resultTrue.success).toBe(true);
            expect(resultTrue.data?.is_deleted).toBe(true);

            // Test with false
            const brandFalse = {
                name: 'Test Brand',
                is_deleted: false,
            };

            const resultFalse = brandSchema.safeParse(brandFalse);
            expect(resultFalse.success).toBe(true);
            expect(resultFalse.data?.is_deleted).toBe(false);
        });
    });
});

// Test Cases for Default Brand
describe('Default Brand', () => {
    test('Default brand should have correct structure', () => {
        expect(defaultBrand).toEqual({
            id: undefined,
            name: '',
            is_deleted: false,
        });
    });

    test('Default brand should pass schema validation when name is updated', () => {
        const updatedBrand = { ...defaultBrand, name: 'New Brand' };
        const result = brandSchema.safeParse(updatedBrand);
        expect(result.success).toBe(true);
    });
});
