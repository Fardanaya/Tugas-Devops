import z from "zod";

export const paymentSchema = z.object({
    id: z.string().optional(),
    nominal: z.number().optional(),
    proof: z.string().optional(),
    is_deleted: z.boolean().optional(),

});

export type IPayment = z.infer<typeof paymentSchema>;
