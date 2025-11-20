import { Section } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/heroui";

const SkeletonOrderCard = () => {
  return (
    <Section className="flex flex-col gap-2 px-3 py-2">
      <div className="flex flex-row gap-4 items-start">
        {/* Gambar Produk */}
        <div className="relative w-20 h-20 md:w-24 md:h-24 aspect-square">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>

        <div className="flex flex-col w-full gap-2">
          {/* Nama Produk dan Status */}
          <div className="flex justify-between items-start">
            <Skeleton className="h-4 w-1/3 rounded" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>

          {/* Tanggal */}
          <Skeleton className="h-3 w-1/4" />

          {/* Avatar dan Nama User */}
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-3 w-1/4" />
          </div>

          {/* Lokasi */}
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-3 w-1/2" />
          </div>

          {/* Harga dan Tanggal Sewa */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-end">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      </div>
    </Section>
  );
};

export default SkeletonOrderCard;
