"use server";

import { createClient } from '@/lib/supabase/server';
import { voucherSchema } from '../types/schemas/voucher';

export const createOrUpdate = async (model: any) => {
    try {
        const supabase = await createClient();

        const validatedData = voucherSchema.parse(model);

        const { data: result, error } = await supabase
            .from('vouchers')
            .upsert(validatedData)
            .select()
            .single();

        if (error) throw error;
        return result;
    } catch (error) {
        console.error('Error creating/updating voucher:', error);
        throw error;
    }
}

export const deleteVoucher = async (id: string) => {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('vouchers')
            .update({ is_deleted: true })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error deleting voucher:', error);
        throw error;
    }
}
