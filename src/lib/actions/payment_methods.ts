"use server";

import { createClient } from '@/lib/supabase/server';

export const createOrUpdatePaymentMethods = async (model: any) => {
    try {
        const supabase = await createClient();
        const { data: result, error } = await supabase
            .from('payment_methods')
            .upsert(model)
            .select()
            .single();

        if (error) throw error;
        return result;
    } catch (error) {
        console.error('Error creating/updating payment method:', error);
        throw error;
    }
}

export const deletePaymentMethod = async (id: string) => {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('payment_methods')
            .update({ is_deleted: true })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error deleting payment method:', error);
        throw error;
    }
}
