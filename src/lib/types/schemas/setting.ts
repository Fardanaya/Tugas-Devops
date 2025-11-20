import z from "zod";

export const settingSchema = z.object({
    id: z.string().optional(),
    value: z.string().optional(),
    visible: z.boolean(),
    is_deleted: z.boolean().optional(),

});

export type ISetting = z.infer<typeof settingSchema>;
