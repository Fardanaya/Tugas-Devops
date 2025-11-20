"use server";

import { supabase } from '@/lib/supabase';

export const createOrUpdate = async (model: any) => {
    try {
        const { data: result, error } = await supabase
            .from('users')
            .upsert(model)
            .select()
            .single();

        if (error) throw error;
        return result;
    } catch (error) {
        console.error('Error creating/updating user:', error);
        throw error;
    }
}

export const deleteUser = async (id: string) => {
    try {
        const { data, error } = await (supabase
            .from('users') as any)
            .update({ is_deleted: true })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}
