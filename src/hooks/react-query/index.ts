// Export all React Query hooks
export * from "./user";
export * from "./addon";
export * from "./address";
export * from "./brand";
export * from "./catalog";
export * from "./character";
export * from "./series";
export * from "./voucher";

// Export pagination hooks (excluding duplicates)
export {
    usePaginatedQuery,
    createPaginatedHook
} from "./pagination";
