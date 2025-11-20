import z from "zod";

export const wishlistSchema = z.object({
    id: z.string().optional(),
    user_id: z.string().optional(),
    catalog_id: z.string().optional(),
    is_deleted: z.boolean().optional(),

});

export type IWishlist = z.infer<typeof wishlistSchema>;
