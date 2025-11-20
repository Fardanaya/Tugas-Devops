import z from "zod";

export const characterSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required").optional(),
    series_id: z.string().optional(),
    is_deleted: z.boolean().optional(),
});

export type ICharacter = z.infer<typeof characterSchema>;

export const defaultCharacter: ICharacter = {
    id: undefined,
    name: "",
    series_id: "",
    is_deleted: false,
};
