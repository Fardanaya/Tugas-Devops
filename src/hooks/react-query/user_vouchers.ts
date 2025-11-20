"use client";

import { supabaseClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IUserVoucher, defaultUserVoucher } from "@/lib/types/schemas/user-voucher";
import { createOrUpdate as createOrUpdateAction, deleteUserVoucher as deleteAction } from "@/lib/actions/user_vouchers";
import { displayToast } from "@/lib/utils";

export function useUserVouchers(filters?: Record<string, any>) {
    return useQuery({
        queryKey: ["user_vouchers", filters],
        queryFn: async () => {
            const supabase = supabaseClient();

            let query = supabase
                .from("user_vouchers")
                .select(`
                    *,
                    users:user_id (
                        id,
                        email,
                        name,
                        full_name,
                        instagram
                    ),
                    vouchers:vouchers_id (
                        id,
                        code,
                        name,
                        type
                    )
                `);

            // Apply filters if provided
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        if (key === 'user_id') {
                            query = query.eq('user_id', value);
                        }
                        if (key === 'vouchers_id') {
                            query = query.eq('vouchers_id', value);
                        }
                    }
                });
            }

            const { data: user_vouchers } = await query.order('created_at', { ascending: false });

            return user_vouchers as Array<IUserVoucher & {
                users: { id: string; email: string; name: string; full_name: string; instagram: string };
                vouchers: { id: string; code: string; name: string; type: string };
            }>;
        },
    });
}

export function useUserVouchersByVoucher(voucherId?: string) {
    return useQuery({
        queryKey: ["user_vouchers", "voucher", voucherId],
        queryFn: async () => {
            if (!voucherId) return [];

            const supabase = supabaseClient();
            const { data: user_vouchers } = await supabase
                .from("user_vouchers")
                .select(`
                    *,
                    users:user_id (
                        id,
                        email,
                        name,
                        full_name,
                        instagram
                    )
                `)
                .eq("vouchers_id", voucherId)
                .order('created_at', { ascending: false });

            // Filter out records where users relationship is null
            return ((user_vouchers || []) as any[]).filter(uv => uv.users).map(uv => uv as IUserVoucher & {
                users: { id: string; email: string; name: string; full_name: string; instagram: string };
            });
        },
        enabled: !!voucherId,
    });
}

export function useUserVoucherById(id?: string) {
    return useQuery({
        queryKey: ["user_vouchers", id],
        queryFn: async () => {
            if (!id) return null;

            const supabase = supabaseClient();
            const { data: user_voucher } = await supabase
                .from("user_vouchers")
                .select(`
                    *,
                    users:user_id (
                        id,
                        email,
                        name,
                        full_name,
                        instagram
                    ),
                    vouchers:vouchers_id (
                        id,
                        code,
                        name,
                        type
                    )
                `)
                .eq("id", id)
                .single();

            return user_voucher ? Object.assign({}, defaultUserVoucher, user_voucher) as IUserVoucher : null;
        },
        enabled: !!id,
    });
}

export function useCreateOrUpdateUserVouchers() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createOrUpdateAction,
        onSuccess: () => {
            // Invalidate and refetch user_vouchers queries
            queryClient.invalidateQueries({ queryKey: ["user_vouchers"] });
            displayToast({
                type: "success",
                title: "Success",
                description: "User voucher assignment updated successfully"
            });
        },
        onError: () => {
            displayToast({ type: "danger", title: "Error", description: "Failed to update user voucher" });
        },
    });
}

export function useDeleteUserVoucher() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteAction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user_vouchers"] });
            displayToast({ type: "success", title: "Success", description: "User voucher removed successfully" });
        },
        onError: () => {
            displayToast({ type: "danger", title: "Error", description: "Failed to remove user voucher" });
        },
    });
}
