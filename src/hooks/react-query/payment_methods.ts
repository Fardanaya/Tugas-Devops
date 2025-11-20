"use client";

import { supabaseClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IPaymentMethod, defaultPaymentMethod } from "@/lib/types/schemas/payment_methods";
import { usePaginatedQuery } from "./pagination";
import { createOrUpdatePaymentMethods as createOrUpdatePaymentMethodsAction, deletePaymentMethod as deletePaymentMethodAction } from "../../lib/actions/payment_methods";
import { displayToast } from "@/lib/utils";

export function usePaymentMethod(filters?: Record<string, any>) {
    return useQuery({
        queryKey: ["payment_methods", filters],
        queryFn: async () => {
            const supabase = supabaseClient();

            let query = supabase
                .from("payment_methods")
                .select("*");

            // Apply filters if provided
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        if (key === 'search') {
                            query = query.ilike('name', `%${value}%`);
                        }
                    }
                });
            }

            const { data: payment_methods } = await query.order('name', { ascending: true });

            return payment_methods as IPaymentMethod[];
        },
    });
}

export function usePaymentMethodById(id?: string) {
    return useQuery({
        queryKey: ["payment_methods", id],
        queryFn: async () => {
            if (!id) return null;

            const supabase = supabaseClient();
            const { data: payment_method } = await supabase
                .from("payment_methods")
                .select("*")
                .eq("id", id)
                .single();

            return payment_method ? Object.assign({}, defaultPaymentMethod, payment_method) as IPaymentMethod : null;
        },
        enabled: !!id,
    });
}

export function useAllPaymentMethods() {
    return useQuery({
        queryKey: ["payment_methods", "all"],
        queryFn: async () => {
            const supabase = supabaseClient();
            const { data: payment_methods } = await supabase
                .from("payment_methods")
                .select("*")
                .order('name', { ascending: true });

            return payment_methods as IPaymentMethod[];
        },
    });
}

export function usePaginatedPaymentMethods(options: { page?: number; pageSize?: number; searchTerm?: string } = {}) {
    return usePaginatedQuery<IPaymentMethod>("payment_methods", {
        searchFields: ["name"],
        orderBy: "name",
        orderDirection: "asc",
        ...options
    });
}

export function useCreateOrUpdatePaymentMethods() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createOrUpdatePaymentMethodsAction,
        onSuccess: (result, variables) => {
            // Invalidate and refetch payment_methods queries to update the UI
            queryClient.invalidateQueries({ queryKey: ["payment_methods"] });

            // Determine if it was a create or update based on whether the model had an id
            const isUpdate = variables?.id !== undefined && variables?.id !== null;
            displayToast({
                type: "success",
                title: "Success",
                description: `Payment Method ${isUpdate ? "updated" : "created"} successfully`
            });
        },
        onError: () => {
            displayToast({ type: "danger", title: "Error", description: "Failed to create payment method" });
        },
    });
}

export function useDeletePaymentMethod() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deletePaymentMethodAction,
        onSuccess: () => {
            // Invalidate and refetch payment_methods queries to update the UI
            queryClient.invalidateQueries({ queryKey: ["payment_methods"] });
            displayToast({ type: "success", title: "Success", description: "Payment Method deleted successfully" });
        },
        onError: () => {
            displayToast({ type: "danger", title: "Error", description: "Failed to delete payment method" });
        },
    });
}
