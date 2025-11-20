"use client";

import { supabaseClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { IAddress, defaultAddress } from "@/lib/types/schemas/address";

export function useAddress(filters?: Record<string, any>) {
    return useQuery({
        queryKey: ["addresses", filters],
        queryFn: async () => {
            const supabase = supabaseClient();

            let query = supabase
                .from("addresses")
                .select("*");

            // Apply filters if provided
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        if (key === 'user_id') {
                            query = query.eq('user_id', value);
                        }
                    }
                });
            }

            const { data: addresses } = await query.order('created_at', { ascending: false });

            return addresses as IAddress[];
        },
    });
}

export function useAddressById(id?: string) {
    return useQuery({
        queryKey: ["addresses", id],
        queryFn: async () => {
            if (!id) return null;

            const supabase = supabaseClient();
            const { data: address } = await supabase
                .from("addresses")
                .select("*")
                .eq("id", id)
                .single();

            return address ? Object.assign({}, defaultAddress, address) as IAddress : null;
        },
        enabled: !!id,
    });
}

export function useAllAddresses() {
    return useQuery({
        queryKey: ["addresses", "all"],
        queryFn: async () => {
            const supabase = supabaseClient();
            const { data: addresses } = await supabase
                .from("addresses")
                .select("*")
                .order('created_at', { ascending: false });

            return addresses as IAddress[];
        },
    });
}
