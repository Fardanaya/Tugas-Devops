"use client";

import { Suspense, useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "@/components/ui/Catalogue/Filter";
import { Button, Drawer, Input } from "@/components/ui/heroui";
import { Section } from "@/components/ui/Section";
import {
  Alert,
  DrawerBody,
  DrawerContent,
  Spinner,
  useDisclosure,
} from "@heroui/react";
import { FaSearch } from "react-icons/fa";
import { IoFilter } from "react-icons/io5";
import { useCatalog } from "@/hooks/react-query/catalog";
import { UserCatalogCard } from "@/components/ui/Card/Catalog";
import SkeletonCatalogCard from "@/components/ui/Card/Catalog/Skeleton";

const RentContent = () => {
  const searchParams = useSearchParams();
  const searchQueryFromParams = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(searchQueryFromParams);
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const [activeFilters, setActiveFilters] = useState({});

  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Use React Query hook with filters
  const { data, isLoading, error } = useCatalog({
    ...activeFilters,
    ...(debouncedSearchQuery ? { search: debouncedSearchQuery } : {}),
  });

  useEffect(() => {
    const newSearchQuery = debouncedSearchQuery.trim();
    const url = newSearchQuery ? `/catalog?q=${newSearchQuery}` : "/catalog";
    if (url !== window.location.pathname + window.location.search) {
      router.replace(url);
    }
  }, [debouncedSearchQuery]);

  const handleFilterChange = (filters: any) => {
    if (searchQuery) {
      setSearchQuery("");
    }
    setActiveFilters(filters);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {Array.from({ length: 8 }).map((_, idx) => (
            <SkeletonCatalogCard key={idx} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center gap-2">
          <p>Error loading data</p>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="flex flex-col items-center gap-2">
          <p>Tidak ada data</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {data.map((item: any) => (
          <UserCatalogCard key={item.id} catalog={item} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row md:justify-center gap-4 py-4">
      <Section className="hidden md:block px-4 py-3 gap-4 w-[25%] h-fit">
        <Filter onFilterChange={handleFilterChange} />
      </Section>

      <div className="flex flex-col gap-4 w-full md:w-[75%]">
        <div className="flex flex-col gap-2">
          <Input
            isClearable
            value={searchQuery}
            name="search"
            color="primary"
            placeholder="Cari Kostum..."
            aria-label="Search costumes"
            startContent={<FaSearch className="text-primary" />}
            onValueChange={handleSearchChange}
          />
          <Button
            color="primary"
            onPress={onOpen}
            className="md:hidden"
            aria-label="Open filter menu"
            startContent={<IoFilter />}
          >
            Filter
          </Button>
        </div>

        {renderContent()}
      </div>

      <Drawer
        isOpen={isOpen}
        size="xs"
        placement="left"
        onOpenChange={onOpenChange}
        aria-label="Filter menu"
      >
        <DrawerContent>
          {(onClose) => (
            <DrawerBody className="py-4 overflow-y-auto">
              <Filter
                onHideDrawer={onClose}
                onFilterChange={handleFilterChange}
              />
            </DrawerBody>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
};

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center">
          <Spinner color="primary" variant="simple"></Spinner>
          <h1 className="md:font-semibold">
            Sabar yaa, permintaan kamu lagi diproses...
          </h1>
        </div>
      }
    >
      <RentContent />
    </Suspense>
  );
};

export default Page;
