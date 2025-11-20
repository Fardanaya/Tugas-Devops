"use client";

import {
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  AutocompleteItem,
  SelectItem,
  Spinner,
  AutocompleteSection,
} from "@heroui/react";
import {
  Input,
  Modal,
  Table,
  Button,
  Autocomplete,
  Select,
  Pagination,
} from "@/components/ui/heroui";
import { FaPlus, FaSearch } from "react-icons/fa";
import { Section } from "@/components/ui/Section";
import {
  useCreateOrUpdateCharacters,
  useDeleteCharacter,
} from "@/hooks/react-query/character";
import { useAllSeries } from "@/hooks/react-query/series";
import { usePagination } from "@/hooks/pagination";
import { presetPagination } from "@/lib/types/pagination";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ICharacter,
  characterSchema,
  defaultCharacter,
} from "@/lib/types/schemas/character";
import { Categories } from "@/lib/constant/series";
import { flattenIdProperties } from "@/lib/utils";
import TableTitle from "@/components/ui/Table/Title";
import TableAction from "@/components/ui/Table/Action";
import { usePaginatedCharacters } from "@/hooks";

const Page = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    pageSize,
    setPageSize,
    debouncedSearch,
  } = usePagination();

  // Use the paginated characters hook
  const { data: charactersData, isLoading } = usePaginatedCharacters({
    page,
    pageSize,
    searchTerm: debouncedSearch || undefined,
  });

  // Use the mutation hooks
  const createOrUpdateMutation = useCreateOrUpdateCharacters();
  const deleteMutation = useDeleteCharacter();

  // Use the series hook for the autocomplete
  const { data: listSeries } = useAllSeries();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ICharacter>({
    resolver: zodResolver(characterSchema),
    defaultValues: defaultCharacter,
  });

  const formValues = watch();

  const onSubmit = async (data: ICharacter) => {
    try {
      await createOrUpdateMutation.mutateAsync(data);
      reset();
      onOpenChange();
    } catch (error) {
      console.error("Failed to create/update character:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete character:", error);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange();
  };

  return (
    <div className="flex flex-col gap-4">
      <Section className="px-4 py-3 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
          <TableTitle
            title="Character"
            description="Kelola karakter untuk katalog kostum anda"
          />
          <div className="flex flex-row items-center gap-2">
            <Input
              isClearable
              type="text"
              aria-label="Search"
              placeholder="Search"
              startContent={<FaSearch className="text-primary" />}
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <Button
              onPress={() => {
                reset();
                onOpen();
              }}
              color="primary"
              startContent={<FaPlus />}
            >
              Add
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row justify-between items-center">
            <p className="text-xs">
              Total&nbsp;
              <span className="font-semibold">
                {charactersData?.pagination?.totalRecords || 0}
              </span>
              &nbsp;Character
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs">Showing</span>
              <Select
                disallowEmptySelection
                size={"xs" as any}
                aria-label="Page Size"
                variant="bordered"
                classNames={{ trigger: "bg-default-50" }}
                className="w-20"
                selectedKeys={[pageSize.toString()]}
                onSelectionChange={(keys) => {
                  const size = Number(Array.from(keys)[0]);
                  setPageSize(size);
                  setPage(1);
                }}
                items={presetPagination}
              >
                {(item: any) => (
                  <SelectItem key={item.key}>{item.label}</SelectItem>
                )}
              </Select>
            </div>
          </div>
          <Table aria-label="Character table" color="primary">
            <TableHeader>
              <TableColumn>Character</TableColumn>
              <TableColumn>Series</TableColumn>
              <TableColumn className="flex justify-center items-center">
                Action
              </TableColumn>
            </TableHeader>
            <TableBody
              isLoading={isLoading}
              loadingContent={<Spinner label="Loading..." />}
              items={charactersData?.data ?? []}
              emptyContent={"Tidak ada data yang dapat ditampilkan."}
            >
              {(item: ICharacter | any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.series?.name || "-"}</TableCell>
                  <TableCell className="flex flex-row justify-center items-center gap-2">
                    <TableAction
                      onUpdate={() => {
                        reset(flattenIdProperties(item));
                        onOpen();
                      }}
                      onDelete={() => handleDelete(item.id || "")}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end gap-2">
          {charactersData?.pagination &&
            charactersData.pagination.totalPages > 1 && (
              <Pagination
                loop
                showControls
                initialPage={1}
                page={page}
                total={charactersData.pagination.totalPages}
                onChange={setPage}
              />
            )}
        </div>
      </Section>

      <Modal isOpen={isOpen} onOpenChange={handleClose}>
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit(onSubmit)}>
              <ModalHeader>Add Character</ModalHeader>
              <ModalBody>
                <Input
                  label="Character"
                  type="text"
                  {...register("name")}
                  isInvalid={!!errors.name}
                  errorMessage={errors.name?.message}
                />
                <Autocomplete
                  label="Series"
                  variant="bordered"
                  selectedKey={formValues.series_id as string}
                  onSelectionChange={(key) => {
                    const selectedSeries = listSeries?.find(
                      (s: any) => s.id === key
                    );
                    setValue(
                      "series_id",
                      selectedSeries?.id || (key as string)
                    );
                  }}
                >
                  {
                    Categories.map((item) => (
                      <AutocompleteSection
                        key={item.key}
                        classNames={{
                          heading:
                            "flex w-full sticky top-1 z-20 py-1.5 px-2 font-medium text-background bg-primary-300 shadow-small rounded-small",
                          group: "px-4",
                        }}
                        title={item.label}
                      >
                        {(listSeries || [])
                          ?.filter((s: any) => s.category === item.key)
                          .map((s: any) => (
                            <AutocompleteItem key={s.id}>
                              {s.name}
                            </AutocompleteItem>
                          ))}
                      </AutocompleteSection>
                    )) as any
                  }
                </Autocomplete>
              </ModalBody>
              <ModalFooter>
                <Button type="button" onPress={onClose}>
                  Close
                </Button>
                <Button type="submit" color="primary" isLoading={isLoading}>
                  {formValues.id ? "Update" : "Create"}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Page;
