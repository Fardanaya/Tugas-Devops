import z from "zod";
import type { IBrand } from "./brand";
import type { ICharacter } from "./character";
import type { ISeries } from "./series";

export const catalogSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    catalog_type: z.string().optional(),
    gender: z.string().optional(),
    size: z.string().optional(),
    max_size: z.string().optional(),
    min_lingkar_dada: z.number().nullable().optional(),
    max_lingkar_dada: z.number().nullable().optional(),
    min_lingkar_pinggang: z.number().nullable().optional(),
    max_lingkar_pinggang: z.number().nullable().optional(),
    price: z.number().optional(),
    additional_day_price: z.number().optional(),
    status: z.string().optional(),
    weight: z.number().optional(),
    height: z.number().optional(),
    width: z.number().optional(),
    length: z.number().optional(),
    important_info: z.string().optional(),
    is_weekday: z.boolean().optional(),
    images: z.array(z.string()).optional(),
    brand_id: z.union([z.object({ id: z.string().nullable() }), z.null()]).optional(),
    character_id: z.union([z.object({ id: z.string().nullable() }), z.null()]).optional(),
    slug: z.string().optional(),
    bundle_catalog: z.array(z.string()).optional(),
    is_deleted: z.boolean().optional(),
});

export type ICatalog = z.infer<typeof catalogSchema>;

export type ICatalogWithRelations = ICatalog & {
    brand: IBrand | null;
    character: (ICharacter & {
        series: ISeries | null;
    }) | null;
};

export const createDefaultCatalog = (): ICatalog => {
    return {
        id: undefined,
        name: "",
        description: "",
        catalog_type: "costume",
        gender: "unisex",
        size: "",
        max_size: "",
        min_lingkar_dada: null,
        max_lingkar_dada: null,
        min_lingkar_pinggang: null,
        max_lingkar_pinggang: null,
        price: 0,
        additional_day_price: 0,
        status: "",
        weight: 0,
        height: 0,
        width: 0,
        length: 0,
        important_info: "",
        is_weekday: false,
        images: [],
        brand_id: null,
        character_id: null,
        slug: "",
        bundle_catalog: [],
        is_deleted: false,
    } as ICatalog;
};

// Default catalog
export const defaultCatalog = createDefaultCatalog();
