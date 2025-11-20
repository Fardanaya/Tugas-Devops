"use client";

import {
  MdDiscount,
  MdOutlinePersonalVideo,
  MdOutlinePersonPin,
} from "react-icons/md";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EmblaOptionsType } from "embla-carousel";
import {
  DateValue,
  Divider,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tab,
  Tabs,
  useDisclosure,
} from "@heroui/react";
import {
  AvailabilityCalendar,
  CatalogCalendar,
} from "@/components/ui/Calendar";
import { FaCalendar, FaClock, FaRegClock } from "react-icons/fa6";
import { Button, Chip, Modal, Skeleton } from "@/components/ui/heroui";
import { FaHeart, FaInfoCircle } from "react-icons/fa";
import { BsChatFill } from "react-icons/bs";
import { FaCartShopping } from "react-icons/fa6";
import { useAddToCart } from "@/hooks/react-query/cart";
import { TbArrowBigDownFilled, TbArrowBigUpFilled } from "react-icons/tb";
import { Section, SectionTitle } from "@/components/ui/Section";
import { metadataConfig } from "@/app/config";
import { ICatalog } from "@/lib/types/schemas/catalog";
import { UserCatalogCard } from "@/components/ui/Card/Catalog";
import { useSession } from "@/components/providers/SessionProvider";
import { useCatalogBySlug, useCatalog } from "@/hooks/react-query/catalog";
import Link from "next/link";
import EmblaCarousel from "@/components/ui/Carousel";
import Image from "next/image";

const OPTIONS: EmblaOptionsType = { loop: true };

const Page = () => {
  const { slug } = useParams();
  const [loadPage, setLoadPage] = useState(true);
  const { data: model, isLoading: loading } = useCatalogBySlug(slug as string);
  const { data: allCatalogs } = useCatalog();
  const [catalogBundle, setCatalogBundle] = useState<ICatalog[]>([]);

  const router = useRouter();
  const { user } = useSession();
  const { isOpen, onOpenChange, onClose } = useDisclosure();
  const addToCartMutation = useAddToCart();

  const [bookedDates, setBookedDates] = useState<Date[]>([
    new Date("2025-10-03"),
    new Date("2025-10-12"),
    new Date("2025-10-20"),
  ]);

  useEffect(() => {
    setLoadPage(false);
  }, []);

  useEffect(() => {
    if (
      model?.bundle_catalog &&
      Array.isArray(model?.bundle_catalog) &&
      model.bundle_catalog.length > 0 &&
      allCatalogs
    ) {
      const catalogMap = new Map(
        allCatalogs.map((catalog: any) => [catalog.id, catalog])
      );

      const populatedBundle = model?.bundle_catalog
        .map((id: string) => catalogMap.get(id))
        .filter(Boolean);

      setCatalogBundle(populatedBundle);
    }
  }, [model, allCatalogs]);

  const bundlePrice = () => {
    return catalogBundle.reduce((total, item) => total + (item.price ?? 0), 0);
  };

  const isDateUnavailable = (date: DateValue) => {
    const dateString = date.toString().split("T")[0];
    return bookedDates.some(
      (bookedDate) => bookedDate.toISOString().split("T")[0] === dateString
    );
  };

  const handleAddToCart = () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (model?.id) {
      addToCartMutation.mutate({
        item_type: "catalog",
        item_id: model.id,
      });
    }
  };

  if (!loading && model === null) {
    return (
      <div className="py-4 align-middle flex items-center justify-center h-screen">
        <div className="flex text-center flex-col">
          <Image
            src="/anya.png"
            alt="404"
            width={200}
            height={200}
            className="self-center"
          />
          <h1 className="text-xl font-semibold">Kostumnya gak ketemu 😱</h1>
          <p className="text-default-600">
            Mungkin udah dihapus atau emang gak ada
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:gap-8 py-4">
      <div className="relative flex flex-col md:flex-row gap-4">
        <div className="static md:sticky md:top-4 h-fit w-full md:w-[30%] flex flex-col gap-4">
          {loadPage || loading ? (
            <div className="flex flex-col gap-2 w-full">
              <div className="w-full aspect-square">
                <Skeleton className="w-full h-full rounded-lg" />
              </div>
              <div className="hidden md:flex gap-2">
                <Skeleton className="size-16 rounded-lg" />
                <Skeleton className="size-16 rounded-lg" />
                <Skeleton className="size-16 rounded-lg" />
                <Skeleton className="size-16 rounded-lg" />
                <Skeleton className="size-16 rounded-lg" />
                <Skeleton className="size-16 rounded-lg" />
              </div>
            </div>
          ) : (
            <EmblaCarousel slides={model?.images || []} options={OPTIONS} />
          )}
        </div>
        <div className="flex flex-col gap-3 md:gap-5 w-full md:w-[42.5%]">
          <div className="flex flex-col gap-0.5 md:gap-1 w-full">
            {loadPage || loading ? (
              <Skeleton className="w-full h-7 md:h-9" />
            ) : (
              <h1 className="text-xl md:text-2xl font-semibold">
                {model?.name}
              </h1>
            )}
            {loadPage || loading ? (
              <Skeleton className="w-[80%] h-6" />
            ) : model?.bundle_catalog && model.bundle_catalog.length > 0 ? (
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2 text-primary">
                  <p className="text-primary font-semibold leading-none">
                    Rp {(model?.price ?? 0).toLocaleString("id-ID")} / 3 Hari
                  </p>
                  <div className="flex items-center gap-2">
                    {(model?.price ?? 0) < bundlePrice() ? (
                      <TbArrowBigDownFilled className="text-success" />
                    ) : (
                      <TbArrowBigUpFilled className="text-danger" />
                    )}
                    <p className="text-default-600 font-medium line-through  leading-none">
                      Rp {bundlePrice().toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
                <p className="text-default-800 text-[0.75rem] leading-none">
                  {(model?.price ?? 0) < bundlePrice()
                    ? `Hemat`
                    : `Lebih Mahal`}{" "}
                  Rp {Math.abs(bundlePrice() - (model?.price ?? 0))}
                </p>
              </div>
            ) : (
              <div className="flex flex-row items-end gap-1">
                <p className="text-primary text-xl md:text-3xl font-semibold leading-none">
                  Rp {(model?.price ?? 0).toLocaleString("id-ID")}
                </p>
                <p className="text-default-900 text-sm md:text-md leading-none">
                  / 3 hari
                </p>
              </div>
            )}
          </div>
          <Divider className="opacity-20" />
          <div className="text-sm flex flex-col gap-1">
            <div className="flex flex-row gap-4 items-start">
              <div className="w-[35%] flex flex-row gap-1 items-center">
                <MdOutlinePersonPin />
                <p>Character</p>
              </div>
              <div className="w-[65%]">
                {loadPage || loading ? (
                  <Skeleton className="w-full h-4" />
                ) : model?.bundle_catalog &&
                  model.bundle_catalog.length > 0 &&
                  catalogBundle.length > 0 ? (
                  (() => {
                    const names = Array.from(
                      new Set(
                        catalogBundle.map(
                          (catalog: any) => catalog?.character?.name
                        )
                      )
                    ).filter(Boolean);

                    if (names.length === 0) return model?.character?.name;
                    if (names.length === 1) return names[0];
                    if (names.length === 2) return names.join(" & ");
                    return `${names.slice(0, -1).join(", ")} & ${
                      names[names.length - 1]
                    }`;
                  })()
                ) : (
                  <p>{model?.character?.name}</p>
                )}
              </div>
            </div>
            <div className="flex flex-row gap-4 items-start">
              <div className="flex w-[35%] flex-row gap-1 items-center">
                <MdOutlinePersonalVideo />
                <p>Series</p>
              </div>
              <div className="w-[65%]">
                {loadPage || loading ? (
                  <Skeleton className="w-full h-4" />
                ) : model?.bundle_catalog &&
                  model.bundle_catalog.length > 0 &&
                  catalogBundle.length > 0 ? (
                  (() => {
                    const names = Array.from(
                      new Set(
                        catalogBundle.map(
                          (catalog: any) => catalog?.character?.series?.name
                        )
                      )
                    ).filter(Boolean);

                    if (names.length === 0)
                      return model?.character?.series?.name;
                    if (names.length === 1) return names[0];
                    if (names.length === 2) return names.join(" & ");
                    return `${names.slice(0, -1).join(", ")} & ${
                      names[names.length - 1]
                    }`;
                  })()
                ) : (
                  <p>{model?.character?.series?.name}</p>
                )}
              </div>
            </div>
            {!loading &&
              !(model?.bundle_catalog && model.bundle_catalog.length > 0) && (
                <div className="flex gap-4 items-start">
                  <div className="w-[35%] flex flex-row gap-1 items-center">
                    <MdDiscount />
                    <p>Brand</p>
                  </div>
                  <div className="w-[65%]">
                    {loadPage || loading ? (
                      <Skeleton className="w-full h-4" />
                    ) : (
                      <p>{model?.brand?.name}</p>
                    )}
                  </div>
                </div>
              )}
          </div>

          <div className="flex gap-2">
            {loadPage || loading ? (
              <>
                <Skeleton className="w-16 h-6" />
                <Skeleton className="w-16 h-6" />
              </>
            ) : (
              <>
                {!(
                  model?.bundle_catalog && model.bundle_catalog.length > 0
                ) && (
                  <>
                    <Chip variant="bordered" size="sm" type="size">
                      {model?.size ?? "?"}
                      {model?.max_size && ` - ${model?.max_size}`}
                    </Chip>
                    {model?.gender !== "unisex" && (
                      <Chip
                        variant="bordered"
                        size="sm"
                        gender={
                          model?.gender as
                            | "female"
                            | "male"
                            | "unisex"
                            | undefined
                        }
                      >
                        {model?.gender
                          ? model?.gender.charAt(0).toUpperCase() +
                            model?.gender.slice(1)
                          : ""}
                      </Chip>
                    )}
                  </>
                )}
                {model?.bundle_catalog && model.bundle_catalog.length > 0 && (
                  <Chip variant="bordered" size="sm" bundle="yes">
                    Bundle
                  </Chip>
                )}
              </>
            )}
          </div>
          <Divider className="opacity-20" />
          <Tabs
            classNames={{
              tabList: "rounded-[8px]",
              cursor: "rounded-[8px]",
              tabContent:
                "group-data-[selected=true]:text-white text-default-600 font-medium",
              panel: "px-0 py-0",
            }}
            color="primary"
            aria-label="Options"
          >
            <Tab key="description" title="Deskripsi">
              {loading || loadPage ? (
                <>
                  <div className="flex flex-col gap-2">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <Skeleton key={idx} className="w-full h-4" />
                    ))}
                    <Skeleton className="w-[80%] h-4" />
                  </div>
                </>
              ) : (
                <div
                  className="text-sm"
                  dangerouslySetInnerHTML={{ __html: model?.description || "" }}
                ></div>
              )}
            </Tab>
            <Tab key="details" title="Details">
              <div className="grid grid-cols-2 gap-2 bg-default-100 rounded-lg p-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs">Berat</span>
                  <span className="font-medium text-sm">
                    {model?.weight ?? 0} <span className="text-xs">Kg</span>
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs">Tinggi</span>
                  <span className="font-medium text-sm">
                    {model?.height ?? 0} <span className="text-xs">Cm</span>
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs">Lebar</span>
                  <span className="font-medium text-sm">
                    {model?.width ?? 0} <span className="text-xs">Cm</span>
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs">Panjang</span>
                  <span className="font-medium text-sm">
                    {model?.length ?? 0} <span className="text-xs">Cm</span>
                  </span>
                </div>
              </div>
            </Tab>
            {model?.important_info && (
              <Tab key="info" title="Info Penting">
                <div
                  className="text-sm"
                  dangerouslySetInnerHTML={{
                    __html: model?.important_info || "",
                  }}
                ></div>
              </Tab>
            )}
          </Tabs>
          {model?.bundle_catalog &&
            model.bundle_catalog.length > 0 &&
            catalogBundle.length > 0 && (
              <div className="flex flex-col gap-2">
                <Divider className="opacity-20" />
                <SectionTitle
                  title="Includes"
                  description="Termasuk dalam bundle ini"
                />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                  {catalogBundle.map((item: any, index: number) => (
                    <div key={item?.id} className="flex flex-col gap-1 h-full">
                      <div className="flex justify-center items-center">
                        <p className="text-primary text-sm font-semibold uppercase">
                          Catalog {index + 1}
                        </p>
                      </div>
                      <div className="flex flex-col justify-center gap-2 h-full">
                        <UserCatalogCard catalog={item} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          <Divider className="opacity-20 block md:hidden" />
        </div>
        <div className="static md:sticky md:top-4 h-fit flex flex-col items-start w-full md:w-[25%] gap-2">
          <div className="flex flex-col mb-2 w-full">
            <p className="font-medium md:text-lg text-primary">Jadwal Sewa</p>
            <p className="text-[0.7rem] text-default-600">
              Berikut merupakan jadwal ketersediaan kostum
            </p>
          </div>
          <AvailabilityCalendar isDateUnavailable={isDateUnavailable} />
          <Section className="w-[100%] flex flex-col gap-2 px-3 py-2">
            <div className="flex flex-row items-end gap-1 py-0.5">
              <p className="text-primary text-xl font-semibold leading-none">
                Rp {(model?.price ?? 0).toLocaleString("id-ID")}
              </p>
              <p className="text-default-900 text-sm leading-none">
                per 3 hari
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <FaRegClock className="text-primary" />
              <p className="text-default-800">Estimasi Pengiriman 1 - 3 Hari</p>
            </div>
            <Divider className="opacity-20 my-2" />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <Button
                  fullWidth
                  color="primary"
                  startContent={<BsChatFill />}
                  as={Link}
                  target="_blank"
                  href={`https://wa.me/${metadataConfig.contact.whatsapp}?text=Halo kak ${metadataConfig.name}, Mau nanya nih soal kostum ${model?.name}... `}
                >
                  Hubungi Kami
                </Button>
                <Button
                  color="success"
                  variant="flat"
                  isIconOnly
                  onPress={handleAddToCart}
                  isLoading={addToCartMutation.isPending}
                >
                  <FaCartShopping />
                </Button>
              </div>
              <Button
                fullWidth
                color="primary"
                startContent={<FaCalendar />}
                as={Link}
                href={`/catalog/${model?.slug}/rent`}
              >
                Pilih Tanggal Sewa
              </Button>
            </div>
            <p className="text-[0.7rem] text-default-800 leading-[1.1]">
              * Deposit dan ongkir akan dihitung setelah pengajuan sewa
            </p>
          </Section>
        </div>
      </div>

      <Modal size="xl" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Syarat dan Ketentuan</ModalHeader>
              <ModalBody>
                <div className="text-sm">
                  <p className="mb-4">
                    Dengan menggunakan layanan kami, Anda menyetujui syarat dan
                    ketentuan berikut:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      Penyewa bertanggung jawab penuh atas kondisi kostum selama
                      masa sewa
                    </li>
                    <li>
                      Kostum harus dikembalikan dalam kondisi bersih dan tidak
                      rusak
                    </li>
                    <li>
                      Denda akan dikenakan untuk keterlambatan pengembalian
                    </li>
                    <li>
                      Biaya perbaikan akan ditanggung penyewa jika terjadi
                      kerusakan
                    </li>
                    <li>
                      Pembatalan sewa harus dilakukan minimal 24 jam sebelum
                      tanggal sewa
                    </li>
                  </ul>
                </div>
                <div className="flex items-center gap-2">
                  <FaInfoCircle />
                  <p className="text-xs">
                    {model?.status === "soon"
                      ? "Dengan melakukan pre order, Anda menyetujui syarat dan ketentuan sewa di situs kami."
                      : "Dengan melakukan sewa, Anda menyetujui syarat dan ketentuan sewa di situs kami."}
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button onPress={onClose}>Tutup</Button>
                <Button
                  color="success"
                  onPress={() => {
                    if (!user) {
                      router.push("/auth/login");
                      return;
                    }
                    if (model?.status === "soon") {
                      router.push(`/catalog/${model?.id}/po`);
                    } else {
                      router.push(`/catalog/${model?.id}/rent`);
                    }
                  }}
                >
                  Setuju
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Page;
