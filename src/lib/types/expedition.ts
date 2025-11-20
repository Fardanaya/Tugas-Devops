import z from "zod";

export const expeditionSchema = z.object({
    id: z.string(),
    name: z.string(),
    code: z.string(),
    icon: z.string(),
    private: z.boolean(),
});

export type IExpedition = z.infer<typeof expeditionSchema>;

export const defaultExpedition: IExpedition = {
    id: "",
    name: "",
    code: "",
    icon: "",
    private: false,
};
