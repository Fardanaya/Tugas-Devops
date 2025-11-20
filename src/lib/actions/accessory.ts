"use server";

import { createClient } from '@/lib/supabase/server';
import { accessorySchema } from "../types/schemas/accessory";

export const createOrUpdateAccessory = async (model: any) => {
    try {
        // Create authenticated Supabase client
        const supabase = await createClient();

        // Validate the model against the schema
        const validatedData = accessorySchema.parse(model);

        // Prepare the data for Supabase
        const dataToSave = {
            ...validatedData,
        };

        // Create or update the accessory
        const { data: result, error } = await supabase
            .from('accessories')
            .upsert(dataToSave as any)
            .select()
            .single();

        if (error) throw error;

        return result;
    } catch (error) {
        console.error('Error creating/updating accessory:', error);
        throw error;
    }
}

export const deleteAccessory = async (id: string) => {
    try {
        // Create authenticated Supabase client
        const supabase = await createClient();

        // Soft delete the accessory
        const { data, error } = await supabase
            .from('accessories')
            .update({ is_deleted: true })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error deleting accessory:', error);
        throw error;
    }
}

export const getAccessoryById = async (id: string) => {
    try {
        // Create authenticated Supabase client
        const supabase = await createClient();

        // Get the accessory by id
        const { data: accessory, error } = await supabase
            .from('accessories')
            .select(`
                *,
                catalog:catalog(*)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        return accessory;
    } catch (error) {
        console.error('Error fetching accessory by id:', error);
        throw error;
    }
}
