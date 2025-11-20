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
  SelectItem,
  Spinner,
  AutocompleteItem,
} from "@heroui/react";
import {
  Input,
  Modal,
  Table,
  Button,
  Select,
  Pagination,
  Autocomplete,
} from "@/components/ui/heroui";
import { FaPlus, FaSearch } from "react-icons/fa";
import { Section } from "@/components/ui/Section";
import {
  usePaginatedSeries,
  useCreateOrUpdateSeries,
  useDeleteSeries,
} from "@/hooks/react-query/series";
import { usePagination } from "@/hooks/pagination";
import { presetPagination } from "@/lib/types/pagination";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  seriesSchema,
  ISeries,
  defaultSeries,
} from "@/lib/types/schemas/series";
import { Categories } from "@/lib/constant/series";
import TableTitle from "@/components/ui/Table/Title";
import TableAction from "@/components/ui/Table/Action";

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

  // Use the paginated series hook
  const { data: seriesData, isLoading } = usePaginatedSeries({
    page,
    pageSize,
    searchTerm: debouncedSearch || undefined,
  });

  // Use the mutation hooks
  const createOrUpdateMutation = useCreateOrUpdateSeries();
  const deleteMutation = useDeleteSeries();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ISeries>({
    resolver: zodResolver(seriesSchema),
    defaultValues: defaultSeries,
  });

  const formValues = watch();

  const handleClose = () => {
    reset(defaultSeries);
    onOpenChange();
  };

  const handleCreateOrUpdate = (item?: ISeries) => {
    reset(item ?? defaultSeries);
    onOpen();
  };

  const onSubmit = async (data: ISeries) => {
    try {
      await createOrUpdateMutation.mutateAsync(data);
      handleClose();
    } catch (error) {
      console.error("Failed to create/update series:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete series:", error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Section className="px-4 py-3 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
          <TableTitle
            title="Series"
            description="Kelola series untuk katalog kostum anda"
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
              onPress={() => handleCreateOrUpdate()}
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
                {seriesData?.pagination?.totalRecords || 0}
              </span>
              &nbsp;Series
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
          <Table aria-label="Series table" color="primary">
            <TableHeader>
              <TableColumn>Series</TableColumn>
              <TableColumn>Categories</TableColumn>
              <TableColumn className="flex justify-center items-center">
                Action
              </TableColumn>
            </TableHeader>
            <TableBody
              isLoading={isLoading}
              loadingContent={<Spinner label="Loading..." />}
              items={seriesData?.data ?? []}
              emptyContent={"Tidak ada data yang dapat ditampilkan."}
            >
              {(item: ISeries) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    {Categories.find((c) => c.key === item.category)?.label}
                  </TableCell>
                  <TableCell className="flex flex-row justify-center items-center gap-2">
                    <TableAction
                      onUpdate={() => handleCreateOrUpdate(item)}
                      onDelete={() => handleDelete(item.id || "")}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end gap-2">
          {seriesData?.pagination && seriesData.pagination.totalPages > 1 && (
            <Pagination
              loop
              showControls
              initialPage={1}
              page={page}
              total={seriesData.pagination.totalPages}
              onChange={setPage}
            />
          )}
        </div>
      </Section>

      <Modal isOpen={isOpen} onOpenChange={handleClose}>
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit(onSubmit)}>
              <ModalHeader>
                {formValues.id ? "Edit Series" : "Add Series"}
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Series"
                  type="text"
                  {...register("name")}
                  isInvalid={!!errors.name}
                  errorMessage={errors.name?.message}
                />
                <Autocomplete
                  label="Category"
                  variant="bordered"
                  selectedKey={formValues.category}
                  onSelectionChange={(key: any) => {
                    setValue("category", key);
                  }}
                  defaultItems={Categories || []}
                >
                  {(Categories: any) => (
                    <AutocompleteItem key={Categories.key}>
                      {Categories.label}
                    </AutocompleteItem>
                  )}
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
