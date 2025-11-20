"use client";

import {
  Autocomplete,
  Button,
  NumberInput,
  Select,
} from "@/components/ui/heroui";
import { AutocompleteItem, SelectItem } from "@heroui/react";
import { Divider } from "@heroui/react";
import { RangeCalendar } from "../Calendar";
import { SectionTitle } from "../Section";
import { useBrand } from "@/hooks/react-query/brand";
import { useCharacter } from "@/hooks/react-query/character";
import { useSeries } from "@/hooks/react-query/series";
import { Categories } from "@/lib/constant/series";
import { useState } from "react";
import { z } from "zod";
import { InputError } from "../Input";
import { costumeGender, costumeSize } from "@/lib/constant/catalog";
import { ICostumeAttribute } from "@/lib/types/catalog";

const filterSchema = z
  .object({
    name: z.string().optional(),
    size: z.enum(["xs", "s", "m", "l", "xl", "xxl"]).optional(),
    gender: z.enum(["male", "female", "unisex"]).optional(),
    brand: z.string().optional(),
    character: z.string().optional(),
    series: z.string().optional(),
    category: z.string().optional(),
    status: z.enum(["ready", "soon"]).optional(),
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
  })
  .refine(
    (data) => {
      if (data.minPrice && data.maxPrice) {
        return data.maxPrice > data.minPrice;
      }
      return true;
    },
    {
      message: "Max price must be greater than min price",
      path: ["maxPrice"],
    }
  );

export const Filter = ({
  onFilterChange,
  onHideDrawer,
}: {
  onFilterChange: (filters: any) => void;
  onHideDrawer?: () => void;
}) => {
  const { data: brands = [] } = useBrand();
  const { data: characters = [] } = useCharacter();
  const { data: series = [] } = useSeries();
  const [filters, setFilters] = useState<z.infer<typeof filterSchema>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <aside className="flex flex-col gap-4">
      <SectionTitle title="Filter" description="Filter the catalogue" />
      <Divider className="bg-primary opacity-50" />
      <div className="rounded-medium gap-2 flex flex-col">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium">Ketersediaan</p>
          <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-3 gap-2">
            <Button
              size="sm"
              color={filters.status === "ready" ? "primary" : "default"}
              onPress={() =>
                setFilters((prev) => ({
                  ...prev,
                  status: prev.status === "ready" ? undefined : "ready",
                }))
              }
            >
              Available
            </Button>
            <Button
              size="sm"
              color={filters.status === "soon" ? "primary" : "default"}
              onPress={() =>
                setFilters((prev) => ({
                  ...prev,
                  status: prev.status === "soon" ? undefined : "soon",
                }))
              }
            >
              Soon
            </Button>
            <Button
              size="sm"
              color={!filters.status ? "primary" : "default"}
              onPress={() =>
                setFilters((prev) => ({
                  ...prev,
                  status: undefined,
                }))
              }
            >
              All
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium">Tanggal Sewa</p>
          <RangeCalendar max={3} />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium">Batas Harga</p>
          <div className="flex flex-row items-center gap-2">
            <NumberInput
              hideStepper
              placeholder="Min"
              isInvalid={!!errors.maxPrice}
              value={filters.minPrice ?? 0}
              onValueChange={(value) => {
                setFilters((prev) => ({
                  ...prev,
                  minPrice: isNaN(value) ? 0 : value,
                }));
              }}
              startContent={
                <span className="text-default-600 text-xs font-medium">Rp</span>
              }
            />
            <p className="text-default-400">-</p>
            <NumberInput
              hideStepper
              placeholder="Max"
              isInvalid={!!errors.maxPrice}
              value={filters.maxPrice ?? 0}
              onValueChange={(value) => {
                setFilters((prev) => ({
                  ...prev,
                  maxPrice: isNaN(value) ? 0 : value,
                }));
              }}
              startContent={
                <span className="text-default-600 text-xs font-medium">Rp</span>
              }
            />
          </div>
          {(errors.minPrice || errors.maxPrice) && (
            <InputError message={errors.minPrice || errors.maxPrice} />
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-lg">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium">Size</p>
            <Select
              aria-label="Costume size filter"
              color="primary"
              selectedKeys={filters.size ? new Set([filters.size]) : new Set()}
              onSelectionChange={(keys) => {
                const size = keys
                  ? ([...keys][0] as "xs" | "s" | "m" | "l" | "xl" | "xxl")
                  : undefined;
                setFilters((prev) => ({
                  ...prev,
                  size,
                }));
              }}
            >
              {costumeSize.map((size: ICostumeAttribute) => (
                <SelectItem key={size.key}>{size.label}</SelectItem>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium">Gender</p>
            <Select
              aria-label="Costume gender filter"
              color="primary"
              selectedKeys={
                filters.gender ? new Set([filters.gender]) : new Set()
              }
              onSelectionChange={(keys) => {
                const gender = keys
                  ? ([...keys][0] as "male" | "female" | "unisex")
                  : undefined;
                setFilters((prev) => ({
                  ...prev,
                  gender,
                }));
              }}
            >
              {costumeGender.map((gender: ICostumeAttribute) => (
                <SelectItem key={gender.key}>{gender.label}</SelectItem>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium">Category</p>
          <Select
            aria-label="Costume category filter"
            color="primary"
            selectedKeys={
              filters.category ? new Set([filters.category]) : new Set()
            }
            onSelectionChange={(keys) => {
              const selected = keys === "all" ? undefined : [...keys][0];
              setFilters((prev) => ({
                ...prev,
                category: selected ? String(selected) : undefined,
                series: undefined,
              }));
            }}
          >
            {Categories.map((cat) => (
              <SelectItem key={cat.key}>{cat.label}</SelectItem>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium">Series</p>
          <Autocomplete
            aria-label="Series filter"
            color="primary"
            selectedKey={filters.series || ""}
            onSelectionChange={(key) =>
              setFilters((prev) => ({
                ...prev,
                series: key ? String(key) : undefined,
                character: undefined,
              }))
            }
          >
            {series
              .filter(
                (seriesItem) =>
                  !filters.category || seriesItem.category === filters.category
              )
              .map((seriesItem) => (
                <AutocompleteItem key={seriesItem.id}>
                  {seriesItem.name}
                </AutocompleteItem>
              ))}
          </Autocomplete>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium">Character</p>
          <Autocomplete
            aria-label="Character filter"
            color="primary"
            selectedKey={filters.character || ""}
            onSelectionChange={(key) => {
              const charId = key ? String(key) : undefined;
              setFilters((prev) => ({
                ...prev,
                character: charId,
              }));
            }}
          >
            {characters?.length ? (
              characters
                .filter((character: any) => {
                  if (!filters.series && !filters.category) return true;

                  const charSeriesId = character.series_id;

                  const charSeries = series.find(
                    (s: any) => s.id === charSeriesId
                  );

                  const matchesSeries =
                    !filters.series || charSeriesId === filters.series;

                  const matchesCategory =
                    !filters.category ||
                    (charSeries && charSeries.category === filters.category);

                  return matchesSeries && matchesCategory;
                })
                .map((character) => (
                  <AutocompleteItem key={character.id}>
                    {character.name}
                  </AutocompleteItem>
                ))
            ) : (
              <AutocompleteItem isReadOnly key="no-results">
                No characters found
              </AutocompleteItem>
            )}
          </Autocomplete>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium">Brand</p>
          <Autocomplete
            aria-label="Brand filter"
            color="primary"
            selectedKey={filters.brand || ""}
            onSelectionChange={(key) =>
              setFilters((prev) => ({
                ...prev,
                brand: key ? String(key) : undefined,
              }))
            }
          >
            {brands.map((brand) => (
              <AutocompleteItem key={brand.id}>{brand.name}</AutocompleteItem>
            ))}
          </Autocomplete>
        </div>
      </div>
      <Divider className="bg-primary opacity-50" />
      <div className="grid grid-cols-2 gap-2">
        <Button
          size="sm"
          variant="bordered"
          color="primary"
          onPress={() => {
            setFilters({
              name: undefined,
              size: undefined,
              gender: undefined,
              brand: undefined,
              character: undefined,
              series: undefined,
              category: undefined,
              status: undefined,
              minPrice: 0,
              maxPrice: 0,
            });
            onFilterChange({});
          }}
        >
          Reset
        </Button>
        <Button
          size="sm"
          color="primary"
          onPress={async () => {
            try {
              const validated = await filterSchema.parseAsync(filters);
              setErrors({});
              onFilterChange(validated);
              if (onHideDrawer) onHideDrawer();
            } catch (err) {
              if (err instanceof z.ZodError) {
                const newErrors: Record<string, string> = {};
                err.issues.forEach((issue) => {
                  if (issue.path[0] && typeof issue.path[0] === "string") {
                    newErrors[issue.path[0]] = issue.message;
                  }
                });
                setErrors(newErrors);
              }
            }
          }}
        >
          Apply
        </Button>
      </div>
    </aside>
  );
};
