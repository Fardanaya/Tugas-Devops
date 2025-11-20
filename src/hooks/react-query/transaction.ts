import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { usePaginatedQuery } from "./pagination";

// Get all transactions
export const getAllTransactions = async () => {
    const { data, error } = await supabase
        .from("transaction")
        .select(`
      *,
      user:user_id (*),
      catalog:catalog_id (*, character:character_id (*, series:series_id (*))),
      address:address_id (*)
    `)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
};

// Get transaction by ID
export const getTransactionById = async (id: string) => {
    const { data, error } = await supabase
        .from("transaction")
        .select(`
      *,
      user:user_id (*),
      catalog:catalog_id (*, character:character_id (*, series:series_id (*))),
      address:address_id (*)
    `)
        .eq("id", id)
        .single();

    if (error) throw error;
    return data;
};

// Get transactions by user
export const getTransactionsByUser = async (userId: string) => {
    const { data, error } = await supabase
        .from("transaction")
        .select(`
      *,
      user:user_id (*),
      catalog:catalog_id (*, character:character_id (*, series:series_id (*))),
      address:address_id (*)
    `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
};

// Get transactions by catalog
export const getTransactionsByCatalog = async (catalogId: string) => {
    const { data, error } = await supabase
        .from("transaction")
        .select(`
      *,
      user:user_id (*),
      catalog:catalog_id (*, character:character_id (*, series:series_id (*))),
      address:address_id (*)
    `)
        .eq("catalog_id", catalogId)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
};

// Create transaction
export const createTransaction = async (transactionData: any) => {
    const { data, error } = await supabase
        .from("transaction")
        .insert(transactionData)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Delete transaction
export const deleteTransaction = async (id: string) => {
    const { data, error } = await supabase
        .from("transaction")
        .delete()
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Update transaction status in bulk
export const updateTransactionStatusBulk = async (
    catalogId: string,
    oldStatus: string,
    newStatus: string
) => {
    const { data, error } = await supabase
        .from("transaction")
        .update({ status: newStatus } as never)
        .eq("catalog_id", catalogId)
        .eq("status", oldStatus)
        .select();

    if (error) throw error;
    return { success: true, updatedCount: data?.length || 0 };
};

// React Query hooks
export const useAllTransactions = () => {
    return useQuery({
        queryKey: ["transaction", "all"],
        queryFn: getAllTransactions,
    });
};

export const useTransactionById = (id?: string) => {
    return useQuery({
        queryKey: ["transaction", "id", id],
        queryFn: () => getTransactionById(id!),
        enabled: !!id,
    });
};

export const useTransactionsByUser = (userId?: string) => {
    return useQuery({
        queryKey: ["transaction", "user", userId],
        queryFn: () => getTransactionsByUser(userId!),
        enabled: !!userId,
    });
};

export const useTransactionsByCatalog = (catalogId?: string) => {
    return useQuery({
        queryKey: ["transaction", "catalog", catalogId],
        queryFn: () => getTransactionsByCatalog(catalogId!),
        enabled: !!catalogId,
    });
};

export const useCreateTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transaction"] });
        },
    });
};

export const useDeleteTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transaction"] });
        },
    });
};

export const useUpdateTransactionStatusBulk = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            catalogId,
            oldStatus,
            newStatus,
        }: {
            catalogId: string;
            oldStatus: string;
            newStatus: string;
        }) => updateTransactionStatusBulk(catalogId, oldStatus, newStatus),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transaction"] });
        },
    });
};

export const usePaginatedTransactions = (options?: { page?: number; pageSize?: number; searchTerm?: string }) => {
    return usePaginatedQuery<any>("transactions", {
        searchFields: ["id", "status"],
        orderBy: "created_at",
        orderDirection: "desc",
        ...options
    });
};

// Export transaction status constants

// Export transaction status constants
export const transactionStatus = [
    {
        value: "pending",
        label: "Pending",
        color: "#FFB347",
        description: "Waiting approval by Admin",
    },
    {
        value: "waiting",
        label: "Waiting",
        color: "#FFD3B6",
        description: "Waiting Payment by Customer",
    },
    {
        value: "dp",
        label: "Down Payment",
        color: "#FFEEAD",
        description: "Customer paid down payment",
    },
    {
        value: "paid",
        label: "Paid",
        color: "#B5EAD7",
        description: "Customer paid full amount",
    },
    {
        value: "sending",
        label: "Sending",
        color: "#A2C8FF",
        description: "Order is on the way",
    },
    {
        value: "returning",
        label: "Returning",
        color: "#A2C8FF",
        description: "Customer returned the item",
    },
    {
        value: "settlement",
        label: "Settlement",
        color: "#D8B5FF",
        description: "Item has been settled",
    },
    {
        value: "done",
        label: "Done",
        color: "#DCEDC1",
        description: "Transaction Completed",
    },
];

export const extendedTransactionStatus = [
    {
        value: "deposit",
        label: "Deposit",
        color: "#E8B5FF",
        description: "Depo",
    },
    {
        value: "priority",
        label: "Priority Book",
        color: "#E8B5FF",
        description: "Priority Book",
    },
    ...transactionStatus,
    {
        value: "reject",
        label: "Rejected",
        color: "",
        description: "",
    },
    {
        value: "cancel",
        label: "Canceled",
        color: "",
        description: "",
    },
];

export const depositExtendedTransactionStatus = [
    {
        value: "deposit",
        label: "Deposit",
        color: "#E8B5FF",
        description: "Depo",
    },
    {
        value: "priority",
        label: "Priority Book",
        color: "#E8B5FF",
        description: "Priority Book",
    },
    ...transactionStatus,
];

export const getStatusIndex = (
    status: string,
    arr: { value: string }[] = transactionStatus
) => {
    return arr.findIndex((s) => s.value === status);
};
