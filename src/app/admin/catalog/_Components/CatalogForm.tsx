"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Switch,
  cn,
} from "@heroui/react";
import {
  costumeGender,
  costumeSize,
  costumeStatus,
} from "@/lib/constant/catalog";
import {
  useCatalogById,
  useAllCatalogs,
  useCreateOrUpdateCatalog,
  useDeleteCatalog,
} from "@/hooks/react-query/catalog";
import { useAllSeries } from "@/hooks/react-query/series";
import { useAllBrands } from "@/hooks/react-query/brand";
import { useAllCharacters } from "@/hooks/react-query/character";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  catalogSchema,
  ICatalog,
  createDefaultCatalog,
} from "@/lib/types/schemas/catalog";
import {
  Input,
  Button,
  NumberInput,
  Select,
  Autocomplete,
  Chip,
  Modal,
  formatWithPeriodGrouping,
} from "@/components/ui/heroui";
import { Section } from "@/components/ui/Section";
import { InputLabel } from "@/components/ui/Input";
import {
  AutocompleteItem,
  Checkbox,
  Divider,
  Progress,
  SelectItem,
} from "@heroui/react";
import Image from "next/image";
import { MdDiscount, MdOutlinePersonPin } from "react-icons/md";
import { FaPen, FaPlus, FaTrash } from "react-icons/fa6";
import TextEditor from "@/components/ui/TextEditor";
import {
  LuImagePlus,
  LuImageUp,
  LuClipboardCheck,
  LuShirt,
  LuPencilRuler,
  LuImages,
  LuBox,
} from "react-icons/lu";
import {
  displayToast,
  flattenIdProperties,
  validateFileSize,
  validateImageType,
} from "@/lib/utils";
import { CatalogCard } from "@/components/ui/Card/Catalog";
import {
  createOrUpdate,
  deleteCatalog,
  getCatalogWithBundleItems,
} from "@/lib/actions/catalog";
import { Categories } from "@/lib/constant/series";
import { CgDetailsMore } from "react-icons/cg";

interface CatalogFormProps {
  mode: "create" | "edit";
  catalogId?: string;
  catalogType?: "costume" | "bundle";
}

const CatalogForm = ({
  mode,
  catalogId,
  catalogType = "costume",
}: CatalogFormProps) => {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [uploading, setUploading] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesMarkedForDeletion, setImagesMarkedForDeletion] = useState<
    Set<string>
  >(new Set());
  const [previewImages, setPreviewImages] = useState<
    { url: string; file: File; uploading?: boolean; progress?: number }[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCatalogIndex, setSelectedCatalogIndex] = useState<
    number | null
  >(null);
  const [isAddingNewCatalog, setIsAddingNewCatalog] = useState(false);
  const [bundleCatalogs, setBundleCatalogs] = useState<string[]>([]);

  // Use React Query hooks
  const { data: catalogs = [], isLoading: catalogsLoading } = useAllCatalogs();
  const { data: seriesList = [], isLoading: seriesLoading } = useAllSeries();
  const { data: brandList = [], isLoading: brandLoading } = useAllBrands();
  const { data: characterList = [], isLoading: characterLoading } =
    useAllCharacters();

  const { data: catalogData, isLoading: catalogLoading } = useCatalogById(
    mode === "edit" ? catalogId : undefined
  );

  // Use mutation hooks
  const createOrUpdateMutation = useCreateOrUpdateCatalog();
  const deleteMutation = useDeleteCatalog();

  useEffect(() => {
    console.log(catalogData);
  }, [catalogData]);

  // React Hook Form with Zod validation
  const {
    handleSubmit: handleFormSubmit,
    formState: { errors, isSubmitting },
    control,
    setValue,
    getValues,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(catalogSchema),
    defaultValues: createDefaultCatalog(),
  });

  // Type-safe error access for discriminated union - show errors immediately
  const getFieldError = (fieldName: string) => {
    const error = (errors as any)[fieldName];
    return error?.message;
  };

  const getArrayFieldError = (fieldName: string, index: number) => {
    const error = (errors as any)[fieldName]?.[index];
    return error?.message;
  };

  const isBundle = watch("catalog_type") === "bundle";
  const bundleCatalogValues = watch("bundle_catalog");

  // Sync bundle catalogs with form state
  useEffect(() => {
    const currentCatalogs = getValues("bundle_catalog") || [];
    setBundleCatalogs(currentCatalogs);
  }, [bundleCatalogValues]);

  // Set catalog type based on prop when creating new catalog
  useEffect(() => {
    if (mode === "create") {
      setValue("catalog_type", catalogType === "bundle" ? "bundle" : "costume");
    }
  }, [mode, catalogType, setValue]);

  // Populate form with catalog data when in edit mode
  useEffect(() => {
    if (mode === "edit" && catalogData && !catalogLoading) {
      // Handle the actual data structure from API which has brand and character objects
      const catalogDataAny = catalogData as any;
      const formData = {
        ...catalogDataAny,
        id: catalogDataAny.id,
        brand_id: catalogDataAny.brand
          ? { id: catalogDataAny.brand.id }
          : { id: "" },
        character_id: catalogDataAny.character
          ? { id: catalogDataAny.character.id }
          : { id: "" },
      };
      console.log("Catalog data:", formData);
      reset(formData);
      setExistingImages(catalogDataAny.images || []);
      setBundleCatalogs(catalogDataAny.bundle_catalog || []);
    }
  }, [catalogData, catalogLoading, mode, reset]);

  const handleImageUploadWithProgress = async (
    file: File,
    id: string,
    index: number
  ): Promise<string | null> => {
    if (!validateImageType(file)) return null;
    if (!validateFileSize(file, 2)) return null;

    try {
      // Set uploading state for this image
      setPreviewImages((prev) =>
        prev.map((img, i) =>
          i === index ? { ...img, uploading: true, progress: 0 } : img
        )
      );

      const formData = new FormData();
      formData.append("files", file);
      formData.append("type", "catalog");
      formData.append("id", id);

      // Use XMLHttpRequest to track upload progress
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            setPreviewImages((prev) =>
              prev.map((img, i) => (i === index ? { ...img, progress } : img))
            );
          }
        });

        xhr.addEventListener("load", () => {
          try {
            const uploadData = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
              if (uploadData.success) {
                resolve(uploadData.results[0].url);
              } else {
                reject(new Error(uploadData.error || "Image upload failed"));
              }
            } else {
              reject(new Error(uploadData.error || "Image upload failed"));
            }
          } catch (error) {
            reject(new Error("Failed to parse upload response"));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Image upload failed"));
        });

        xhr.open("POST", "/api/tools/image");
        xhr.withCredentials = true;
        xhr.send(formData);
      });
    } catch (error) {
      console.error("Upload error:", error);
      displayToast({
        type: "danger",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Image upload failed",
      });
      return null;
    }
  };

  const handleExistingImageDelete = async (url: string) => {
    try {
      const publicId = url.split("/").pop()?.split(".")[0];
      if (!publicId) return;

      const response = await fetch("/api/tools/image", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicId,
          type: "catalog",
          id: getValues()?.id || "",
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete image: ${response.statusText}`);
      } else {
        setExistingImages((prev) => prev.filter((img) => img !== url));
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          console.error("Image deletion timed out");
        } else {
          console.error("Error deleting image:", error.message);
        }
      } else {
        console.error("Unknown error occurred during image deletion");
      }
    }
  };

  const handlePreviewImageDelete = (index: number) => {
    const previewImage = previewImages[index];
    if (previewImage) {
      URL.revokeObjectURL(previewImage.url);
      setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const onSubmit = async (formData: any) => {
    try {
      console.log("🎉 onSubmit called! Form data:", formData);
      console.log("Current errors:", errors);
      console.log("Is bundle:", isBundle);
      console.log("Bundle catalogs:", bundleCatalogs);
      console.log("Form values:", getValues());

      // Submit with existing images, excluding those marked for deletion
      const filteredImages = existingImages.filter(
        (img) => !imagesMarkedForDeletion.has(img)
      );
      const dataToSubmit = {
        ...formData,
        images: filteredImages,
      };

      // Create/update the catalog using mutation
      const result = await createOrUpdateMutation.mutateAsync(dataToSubmit);

      console.log("Catalog created/updated:", result);

      // Upload preview images with progress tracking
      if (previewImages.length > 0) {
        console.log("Uploading images for catalog...");
        displayToast({
          type: "warning",
          title: "Uploading images",
          description: `Uploading ${previewImages.length} image${
            previewImages.length > 1 ? "s" : ""
          }...`,
        });
        const uploadPromises = previewImages.map((preview, index) =>
          handleImageUploadWithProgress(preview.file, result.id, index)
        );

        // Wait for all uploads to complete
        const uploadedResults = await Promise.allSettled(uploadPromises);

        const uploadedImageUrls: string[] = [];
        let failedCount = 0;

        uploadedResults.forEach((result, index) => {
          if (result.status === "fulfilled" && result.value) {
            uploadedImageUrls.push(result.value);
          } else {
            console.error(
              `Failed to upload image ${index + 1}:`,
              (result as PromiseRejectedResult).reason
            );
            failedCount++;
          }
        });

        if (failedCount > 0) {
          displayToast({
            type: "danger",
            title: "Error",
            description: `Failed to upload ${failedCount} image${
              failedCount > 1 ? "s" : ""
            }.`,
          });
        } else if (uploadedImageUrls.length > 0) {
          displayToast({
            type: "success",
            title: "Success",
            description: `Successfully uploaded ${
              uploadedImageUrls.length
            } image${uploadedImageUrls.length > 1 ? "s" : ""}!`,
          });
        }
        // Update the catalog with all images (existing + new)
        if (uploadedImageUrls.length > 0) {
          const updatedImages = [...existingImages, ...uploadedImageUrls];

          // Update local state immediately for instant UI feedback
          setExistingImages(updatedImages);

          const updatedCatalog = await createOrUpdate({
            ...dataToSubmit,
            id: result.id,
            images: updatedImages,
          });

          console.log("Catalog updated with images:", updatedCatalog);
        }
      }

      // Clear preview images and cleanup blob URLs after successful submission
      previewImages.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });
      setPreviewImages([]);

      // Update form with new ID for future edits (only for new catalogs)
      if (mode === "create") {
        setValue("id", result.id);
      }
    } catch (error) {
      console.error(
        `Error ${mode === "create" ? "creating" : "updating"} Catalog:`,
        error
      );
      displayToast({
        type: "danger",
        title: "Error",
        description: `Failed to ${
          mode === "create" ? "create" : "update"
        } catalog`,
      });
    }
  };

  const handleDelete = async () => {
    try {
      // TODO: Implement delete using server actions
      // await remove(getValues()?.id || "");
    } catch (error) {
      console.error("Error delete Catalog:", error);
    }
  };

  if (catalogLoading || (mode === "edit" && catalogLoading)) {
    return (
      <div className="h-full w-full flex justify-center items-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        console.log("Form submitted, calling handleSubmit");
        handleFormSubmit(onSubmit)(e);
      }}
      className="grid grid-cols-1 md:grid-cols-5 space-y-4 md:space-x-4"
    >
      <div className="col-span-3 flex flex-col gap-4">
        <Section className="px-4 py-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <CgDetailsMore />
            <h3 className="font-semibold">General Information</h3>
          </div>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                label="Costume Name"
                placeholder="Enter catalog name"
                variant="bordered"
                value={field.value}
                isInvalid={!!errors.name}
                errorMessage={errors.name?.message}
                onValueChange={field.onChange}
              />
            )}
          />
          <div className="flex flex-col gap-1">
            <p className="text-sm text-primary">Description</p>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextEditor
                  value={field.value || ""}
                  onValueChange={field.onChange}
                />
              )}
            />
            {errors.description && (
              <p className="text-danger text-sm">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-primary">Important Information</p>
            <Controller
              name="important_info"
              control={control}
              render={({ field }) => (
                <TextEditor
                  height={250}
                  value={field.value || ""}
                  onValueChange={field.onChange}
                />
              )}
            />
            {errors.important_info && (
              <p className="text-danger text-sm">
                {errors.important_info.message}
              </p>
            )}
          </div>
        </Section>

        <Section className="px-4 py-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <LuImages />
            <h3 className="font-semibold">Costume Media</h3>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-primary">Image</p>
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap gap-2">
                {existingImages?.map((img: string, index: number) => {
                  const isMarkedForDeletion = imagesMarkedForDeletion.has(img);
                  return (
                    <div key={index} className="relative aspect-square size-60">
                      <Image
                        src={img}
                        alt={`Existing ${index}`}
                        fill
                        className={`object-cover rounded-md ${
                          isMarkedForDeletion ? "opacity-50" : ""
                        }`}
                      />
                      {!isMarkedForDeletion ? (
                        <Button
                          isIconOnly
                          size="sm"
                          variant="faded"
                          onPress={() => {
                            setImagesMarkedForDeletion(
                              (prev) => new Set([...prev, img])
                            );
                          }}
                          className="absolute top-1 right-1"
                        >
                          <FaTrash className="text-primary" />
                        </Button>
                      ) : (
                        <div className="absolute top-1 right-1 flex gap-1">
                          <Button
                            isIconOnly
                            size="sm"
                            color="danger"
                            variant="flat"
                            onPress={() => {
                              handleExistingImageDelete(img);
                            }}
                          >
                            Delete Now
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            color="secondary"
                            variant="flat"
                            onPress={() => {
                              setImagesMarkedForDeletion((prev) => {
                                const newSet = new Set(prev);
                                newSet.delete(img);
                                return newSet;
                              });
                            }}
                          >
                            Undo
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {previewImages?.map((preview, index: number) => (
                  <div
                    key={`preview-${index}`}
                    className="relative aspect-square size-60"
                  >
                    <Image
                      src={preview.url}
                      alt={`Preview ${index}`}
                      fill
                      className="object-cover rounded-md"
                    />
                    {!preview.uploading && (
                      <Button
                        isIconOnly
                        size="sm"
                        variant="faded"
                        onPress={() => {
                          handlePreviewImageDelete(index);
                        }}
                        className="absolute top-1 right-1"
                      >
                        <FaTrash className="text-primary" />
                      </Button>
                    )}
                    {preview.uploading && preview.progress !== undefined && (
                      <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2 w-full px-4">
                          <Progress
                            color="primary"
                            size="sm"
                            value={preview.progress}
                            className="w-full"
                          />
                          <p className="text-xs text-white font-semibold">
                            {Math.round(preview.progress)}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div className="relative flex justify-center items-center size-60 rounded-lg bg-default-200 hover:bg-primary/10 transition border-dashed border-2 border-primary">
                  <div className="absolute flex flex-col justify-center items-center gap-2 w-full h-full top-0 left-0">
                    {uploading ? (
                      <div className="flex flex-col justify-center items-center gap-2 w-1/2">
                        <LuImageUp className="text-primary" size={43} />
                        <Progress
                          color="primary"
                          radius="sm"
                          size="sm"
                          isIndeterminate
                        />
                      </div>
                    ) : (
                      <LuImagePlus className="text-primary" size={43} />
                    )}
                  </div>
                  <input
                    type="file"
                    name="images"
                    accept="image/*"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (
                        file &&
                        validateImageType(file) &&
                        validateFileSize(file, 2)
                      ) {
                        // Create preview URL immediately
                        const previewUrl = URL.createObjectURL(file);

                        setPreviewImages((prev) => [
                          ...prev,
                          {
                            url: previewUrl,
                            file,
                          },
                        ]);

                        e.target.value = "";

                        displayToast({
                          type: "success",
                          title: "Image added",
                          description:
                            "Image will be uploaded when you save the catalog.",
                        });
                      }
                    }}
                    className={`h-full w-full opacity-0 cursor-pointer ${
                      uploading ? "cursor-not-allowed" : ""
                    }`}
                  />
                </div>
              </div>
              {errors.images && (
                <p className="text-danger text-xs">{errors.images.message}</p>
              )}
            </div>
          </div>
        </Section>
      </div>

      <div className="col-span-2 flex flex-col gap-4">
        <Section className="px-4 py-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <LuClipboardCheck />
            <h3 className="font-semibold">Status</h3>
          </div>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                selectedKeys={field.value ? [field.value] : []}
                isInvalid={!!errors.status}
                errorMessage={errors.status?.message}
                onChange={(e) => field.onChange(e.target.value)}
              >
                {costumeStatus.map((item) => (
                  <SelectItem key={item.key}>{item.label}</SelectItem>
                ))}
              </Select>
            )}
          />
          <Controller
            name="is_weekday"
            control={control}
            render={({ field }) => (
              <Switch
                isSelected={field.value}
                onValueChange={field.onChange}
                classNames={{
                  base: cn(
                    "inline-flex flex-row-reverse w-full max-w-full bg-content1 hover:bg-content2 items-center",
                    "justify-between cursor-pointer rounded-lg gap-4 px-4 py-3 border-2 border-transparent",
                    "data-[selected=true]:border-primary"
                  ),
                  wrapper: "p-0 h-4 overflow-visible",
                  label: "ms-0",
                  thumb: cn(
                    "w-6 h-6 border-2 shadow-lg",
                    "group-data-[hover=true]:border-primary",
                    //selected
                    "group-data-[selected=true]:ms-6",
                    // pressed
                    "group-data-[pressed=true]:w-7",
                    "group-data-pressed:group-data-selected:ms-4"
                  ),
                }}
              >
                <div className="flex flex-col">
                  <p className="text-medium">Allow Weekdays</p>
                  <p className="text-tiny text-default-600">
                    Customer can rent this costume on weekdays
                  </p>
                </div>
              </Switch>
            )}
          />

          <div className="flex items-center gap-2">
            <LuShirt />
            <h3 className="font-semibold">Detail Costume</h3>
          </div>
          {isBundle ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {bundleCatalogs.map((catalogId: string, index: number) => (
                  <div key={index} className="flex flex-col gap-1 h-full">
                    <div className="flex justify-center items-center">
                      <p className="text-primary text-sm font-semibold uppercase">
                        Catalog {index + 1}
                      </p>
                    </div>
                    <Controller
                      name={`bundle_catalog.${index}`}
                      control={control}
                      render={({ field }) => (
                        <div className="flex flex-col justify-center gap-2 h-full">
                          {field.value ? (
                            <div className="flex flex-col justify-between gap-2 h-full">
                              <CatalogCard
                                catalog={catalogs.find(
                                  (c: any) => c.id === field.value
                                )}
                              />
                              <Button
                                fullWidth
                                startContent={<FaPen />}
                                onPress={() => {
                                  setSelectedCatalogIndex(index);
                                  onOpenChange();
                                }}
                              >
                                Ubah
                              </Button>
                            </div>
                          ) : (
                            <Button
                              fullWidth
                              color="primary"
                              variant="bordered"
                              onPress={() => {
                                setSelectedCatalogIndex(index);
                                onOpenChange();
                              }}
                            >
                              Select Catalog
                            </Button>
                          )}
                          {getArrayFieldError("bundle_catalog", index) && (
                            <p className="text-danger text-sm">
                              {getArrayFieldError("bundle_catalog", index)}
                            </p>
                          )}
                        </div>
                      )}
                    />
                    <Button
                      fullWidth
                      color="primary"
                      startContent={<FaTrash />}
                      onPress={() => {
                        const updatedCatalogs = bundleCatalogs.filter(
                          (_: string, i: number) => i !== index
                        );
                        setValue("bundle_catalog", updatedCatalogs);
                        setBundleCatalogs(updatedCatalogs);
                      }}
                    >
                      Hapus
                    </Button>
                  </div>
                ))}
                <div className="flex flex-col justify-center gap-1 h-full">
                  <Button
                    fullWidth
                    color="primary"
                    startContent={<FaPlus />}
                    onPress={() => {
                      setIsAddingNewCatalog(true);
                      onOpenChange();
                    }}
                  >
                    Add Catalog
                  </Button>
                </div>
              </div>
              {getFieldError("bundle_catalog") && (
                <p className="text-danger text-sm">
                  {getFieldError("bundle_catalog")}
                </p>
              )}
            </div>
          ) : (
            <>
              <Controller
                name="brand_id.id"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    label="Brand"
                    variant="bordered"
                    color="primary"
                    selectedKey={field.value}
                    isInvalid={!!getFieldError("brand")}
                    errorMessage={getFieldError("brand")}
                    onSelectionChange={field.onChange}
                  >
                    {brandList?.map((brand: any) => (
                      <AutocompleteItem key={brand.id}>
                        {brand.name}
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>
                )}
              />

              <Controller
                name="character_id.id"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    label="Character"
                    variant="bordered"
                    color="primary"
                    selectedKey={field.value}
                    isInvalid={!!getFieldError("character")}
                    errorMessage={getFieldError("character")}
                    onSelectionChange={field.onChange}
                  >
                    {characterList?.map((char: any) => (
                      <AutocompleteItem key={char.id}>
                        {char.name}
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>
                )}
              />

              {getValues("character_id.id") && (
                <div className="flex flex-col gap-4">
                  <Autocomplete
                    isReadOnly
                    label="Series"
                    variant="bordered"
                    color="primary"
                    selectedKey={
                      characterList?.find(
                        (char: any) => char.id === getValues("character_id.id")
                      )?.series_id || ""
                    }
                  >
                    {seriesList?.map((series: any) => (
                      <AutocompleteItem key={series.id}>
                        {series.name}
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>
                  <Autocomplete
                    isReadOnly
                    label="Category"
                    variant="bordered"
                    color="primary"
                    selectedKey={
                      (
                        characterList?.find(
                          (char: any) =>
                            char.id === getValues("character_id.id")
                        ) as any
                      )?.series?.category || ""
                    }
                  >
                    {Categories?.map((category: any) => (
                      <AutocompleteItem key={category.key}>
                        {category.label}
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>
                </div>
              )}
            </>
          )}
        </Section>

        <Section className="px-4 py-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <LuPencilRuler />
            <h3 className="font-semibold">Costume Measurement</h3>
          </div>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select
                label="Gender"
                variant="bordered"
                selectedKeys={field.value ? [field.value] : []}
                isInvalid={!!getFieldError("gender")}
                errorMessage={getFieldError("gender")}
                onChange={(e) => field.onChange(e.target.value)}
              >
                {costumeGender?.map((gender) => (
                  <SelectItem key={gender.key}>{gender.label}</SelectItem>
                ))}
              </Select>
            )}
          />

          <div className="flex flex-col gap-1">
            <p className="text-sm text-primary">Size</p>
            <div className="grid grid-cols-2 gap-2">
              <Controller
                name="size"
                control={control}
                render={({ field }) => (
                  <Select
                    isCenterValue
                    startContent={
                      <span className="text-sm font-semibold text-default-700">
                        MIN
                      </span>
                    }
                    selectedKeys={field.value ? [field.value] : []}
                    isInvalid={!!getFieldError("size")}
                    errorMessage={getFieldError("size")}
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    {costumeSize?.map((size) => (
                      <SelectItem key={size.key}>{size.label}</SelectItem>
                    ))}
                  </Select>
                )}
              />
              <Controller
                name="max_size"
                control={control}
                render={({ field }) => (
                  <Select
                    isCenterValue
                    startContent={
                      <span className="text-sm font-semibold text-default-700">
                        MAX
                      </span>
                    }
                    selectedKeys={field.value ? [field.value] : []}
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    {costumeSize?.map((size) => (
                      <SelectItem key={size.key}>{size.label}</SelectItem>
                    ))}
                  </Select>
                )}
              />
            </div>
            {getFieldError("size") && (
              <p className="text-danger text-xs">{getFieldError("size")}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-sm text-primary">Chest Measurement</p>
            <div className="grid grid-cols-2 gap-2">
              <Controller
                name="min_lingkar_dada"
                control={control}
                render={({ field }) => (
                  <NumberInput
                    hideStepper
                    isCenterValue
                    variant="bordered"
                    startContent={
                      <span className="text-sm font-semibold text-default-700">
                        MIN
                      </span>
                    }
                    value={field.value || ""}
                    onValueChange={(value) => field.onChange(value || null)}
                    endContent={<p className="text-xs opacity-50">cm</p>}
                  />
                )}
              />
              <Controller
                name="max_lingkar_dada"
                control={control}
                render={({ field }) => (
                  <NumberInput
                    hideStepper
                    isCenterValue
                    variant="bordered"
                    startContent={
                      <span className="text-sm font-semibold text-default-700">
                        MAX
                      </span>
                    }
                    value={field.value || ""}
                    onValueChange={(value) => field.onChange(value || null)}
                    endContent={<p className="text-xs opacity-50">cm</p>}
                  />
                )}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-sm text-primary">Waist Measurement</p>
            <div className="grid grid-cols-2 gap-2">
              <Controller
                name="min_lingkar_pinggang"
                control={control}
                render={({ field }) => (
                  <NumberInput
                    hideStepper
                    isCenterValue
                    variant="bordered"
                    startContent={
                      <span className="text-sm font-semibold text-default-700">
                        MIN
                      </span>
                    }
                    value={field.value || ""}
                    onValueChange={(value) => field.onChange(value || null)}
                    endContent={<p className="text-xs opacity-50">cm</p>}
                  />
                )}
              />
              <Controller
                name="max_lingkar_pinggang"
                control={control}
                render={({ field }) => (
                  <NumberInput
                    hideStepper
                    isCenterValue
                    variant="bordered"
                    startContent={
                      <span className="text-sm font-semibold text-default-700">
                        MAX
                      </span>
                    }
                    value={field.value || ""}
                    onValueChange={(value) => field.onChange(value || null)}
                    endContent={<p className="text-xs opacity-50">cm</p>}
                  />
                )}
              />
            </div>
          </div>
        </Section>

        {!isBundle && (
          <Section className="px-4 py-3 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <LuBox />
              <h3 className="font-semibold">Packaging</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Controller
                name="weight"
                control={control}
                render={({ field }) => (
                  <NumberInput
                    label={"Weight"}
                    hideStepper
                    variant="bordered"
                    value={field.value}
                    isInvalid={!!errors.weight}
                    errorMessage={errors.weight?.message}
                    endContent={<p className="text-xs opacity-50">kg</p>}
                    onValueChange={(value) => field.onChange(value)}
                  />
                )}
              />
              <Controller
                name="length"
                control={control}
                render={({ field }) => (
                  <NumberInput
                    hideStepper
                    label={"Length"}
                    variant="bordered"
                    value={field.value}
                    isInvalid={!!errors.length}
                    errorMessage={errors.length?.message}
                    endContent={<p className="text-xs opacity-50">cm</p>}
                    onValueChange={(value) => field.onChange(value)}
                  />
                )}
              />
              <Controller
                name="height"
                control={control}
                render={({ field }) => (
                  <NumberInput
                    hideStepper
                    label={"Height"}
                    variant="bordered"
                    value={field.value}
                    isInvalid={!!errors.height}
                    errorMessage={errors.height?.message}
                    endContent={<p className="text-xs opacity-50">cm</p>}
                    onValueChange={(value) => field.onChange(value)}
                  />
                )}
              />
              <Controller
                name="width"
                control={control}
                render={({ field }) => (
                  <NumberInput
                    hideStepper
                    label={"Width"}
                    variant="bordered"
                    value={field.value}
                    isInvalid={!!errors.width}
                    errorMessage={errors.width?.message}
                    endContent={<p className="text-xs opacity-50">cm</p>}
                    onValueChange={(value) => field.onChange(value)}
                  />
                )}
              />
            </div>
          </Section>
        )}

        <Section className="px-4 py-3 flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2">
              <div className="w-full md:w-[30%]">
                <InputLabel label="Price" desc="Rent price" />
              </div>
              <div className="w-full md:w-[70%]">
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      hideStepper
                      variant="bordered"
                      value={field.value}
                      isInvalid={!!errors.price}
                      errorMessage={errors.price?.message}
                      onValueChange={(value) => field.onChange(Number(value))}
                      endContent={
                        <span className="text-gray-500 text-xs w-[100px]">
                          / 3 Day
                        </span>
                      }
                      formatOptions={{
                        style: "currency",
                        currency: "IDR",
                        currencyDisplay: "narrowSymbol",
                        currencySign: "accounting",
                      }}
                    />
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2">
              <div className="w-full md:w-[30%]">
                <InputLabel label="Additional Day Price" desc="Extra price per additional day" />
              </div>
              <div className="w-full md:w-[70%]">
                <Controller
                  name="additional_day_price"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      hideStepper
                      variant="bordered"
                      value={field.value}
                      isInvalid={!!getFieldError("additional_day_price")}
                      errorMessage={getFieldError("additional_day_price")}
                      onValueChange={(value) => field.onChange(Number(value))}
                      min={0}
                      endContent={
                        <span className="text-gray-500 text-xs w-[100px]">
                          / Day
                        </span>
                      }
                      formatOptions={{
                        style: "currency",
                        currency: "IDR",
                        currencyDisplay: "narrowSymbol",
                        currencySign: "accounting",
                      }}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-3">
            <div>
              <Button
                color="danger"
                onPress={() => {
                  const catalogId = getValues()?.id;
                  if (catalogId) {
                    deleteMutation.mutate(catalogId);
                  }
                }}
                isLoading={deleteMutation.isPending}
              >
                Delete
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                onPress={async () => {
                  // Cleanup blob URLs from preview images
                  previewImages.forEach((preview) => {
                    URL.revokeObjectURL(preview.url);
                  });
                  setPreviewImages([]);
                  if (mode === "edit") {
                    router.push("/admin/catalog");
                  } else {
                    setExistingImages([]);
                    reset(createDefaultCatalog());
                  }
                }}
              >
                {mode === "edit" ? "Cancel" : "Reset"}
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={isSubmitting || createOrUpdateMutation.isPending}
                onPress={() => console.log("🔥 Save button pressed")}
              >
                Save
              </Button>
            </div>
          </div>
        </Section>
      </div>

      {/* Catalog Selection Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="5xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Select Catalog
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <Input
                    placeholder="Search catalogs..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {catalogs
                      .filter((catalog: any) => {
                        // Filter out already selected catalogs (except the current one being edited)
                        const currentCatalogs =
                          getValues("bundle_catalog") || [];
                        const isAlreadySelected = currentCatalogs.includes(
                          catalog.id
                        );
                        const isCurrentEditing =
                          selectedCatalogIndex !== null &&
                          currentCatalogs[selectedCatalogIndex] === catalog.id;

                        // Show catalog if it matches search and either not selected or is the current one being edited
                        const matchesSearch =
                          catalog.name
                            ?.toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          catalog.character?.name
                            ?.toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          catalog.brand?.name
                            ?.toLowerCase()
                            .includes(searchQuery.toLowerCase());

                        return (
                          matchesSearch &&
                          (!isAlreadySelected || isCurrentEditing)
                        );
                      })
                      .map((catalog: any) => (
                        <div
                          key={catalog.id}
                          className="flex flex-row items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-default-100 transition-colors"
                          onClick={() => {
                            if (isAddingNewCatalog) {
                              // Adding a new catalog to the bundle
                              const currentCatalogs =
                                getValues("bundle_catalog") || [];
                              const updatedCatalogs = [
                                ...currentCatalogs,
                                catalog.id,
                              ];
                              setValue("bundle_catalog", updatedCatalogs);
                              setBundleCatalogs(updatedCatalogs);
                              setIsAddingNewCatalog(false);
                            } else if (selectedCatalogIndex !== null) {
                              // Editing an existing catalog in the bundle
                              const currentCatalogs =
                                getValues("bundle_catalog") || [];
                              const updatedCatalogs = [...currentCatalogs];
                              updatedCatalogs[selectedCatalogIndex] =
                                catalog.id;
                              setValue("bundle_catalog", updatedCatalogs);
                            }
                            onOpenChange();
                            setSelectedCatalogIndex(null);
                            setSearchQuery("");
                          }}
                        >
                          <div className="relative size-16 md:size-20">
                            <Image
                              src={catalog.images?.[0] || "/fucek.jpg"}
                              alt={catalog.name}
                              fill
                              className="rounded-lg aspect-square object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">
                              {catalog.name}
                            </p>
                            <div className="flex flex-col gap-1 text-xs text-default-600">
                              <p className="flex items-center gap-1">
                                <MdOutlinePersonPin />
                                {catalog.character?.name || "Unknown character"}
                              </p>
                              <p className="flex items-center gap-1">
                                <MdDiscount />
                                {catalog.brand?.name || "Unknown brand"}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              <Chip variant="bordered" size="xss">
                                {catalog.size || "Unknown size"}
                              </Chip>
                              <Chip variant="bordered" size="xss">
                                {catalog.gender || "Unknown"}
                              </Chip>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {catalogs.filter((catalog: any) => {
                    const currentCatalogs = getValues("bundle_catalog") || [];
                    const isAlreadySelected = currentCatalogs.includes(
                      catalog.id
                    );
                    const isCurrentEditing =
                      selectedCatalogIndex !== null &&
                      currentCatalogs[selectedCatalogIndex] === catalog.id;

                    const matchesSearch =
                      catalog.name
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      catalog.character?.name
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      catalog.brand?.name
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase());

                    return (
                      matchesSearch && (!isAlreadySelected || isCurrentEditing)
                    );
                  }).length === 0 && (
                    <div className="text-center py-8 text-default-500">
                      No catalogs found matching your search
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </form>
  );
};

export default CatalogForm;
