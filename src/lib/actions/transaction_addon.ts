"use server";

import { supabase } from '@/lib/supabase';

export const createOrUpdate = async (model: any) => {
  try {
    const { data: result, error } = await supabase
      .from('transaction_addons')
      .upsert(model)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error creating/updating transactionAddon:', error);
    throw error;
  }
}

export const deleteTransactionAddon = async (id: string) => {
  try {
    const { data, error } = await (supabase
      .from('transaction_addons') as any)
      .update({ is_deleted: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting transactionAddon:', error);
    throw error;
  }
}
