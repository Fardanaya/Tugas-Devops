import z from "zod";

export const addressSchema = z.object({
    id: z.string().optional(),
    user_id: z.string().optional(),
    label: z.string().optional(),
    full_address: z.string().optional(),
    address_details: z.string().optional(),
    receiver: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    is_deleted: z.boolean().optional(),
});

export type IAddress = z.infer<typeof addressSchema>;

export const defaultAddress: IAddress = {
    id: undefined,
    user_id: "",
    label: "",
    full_address: "",
    address_details: "",
    receiver: "",
    latitude: undefined,
    longitude: undefined,
    is_deleted: false,
};
