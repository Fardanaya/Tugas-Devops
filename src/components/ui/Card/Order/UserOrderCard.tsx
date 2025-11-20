import { Avatar, Badge } from "@heroui/react";
import { FaShippingFast, FaMoneyBill, FaClock } from "react-icons/fa";
import { Section } from "@/components/ui/Section";
import { useCallback, useEffect, useState } from "react";
import { fetchInstagram } from "@/lib/fetch";
import Image from "next/image";
import { Button, Chip } from "../../heroui";
import { useRouter } from "next/navigation";

const UserOrderCard = ({ item }: { item: any }) => {
  const router = useRouter()
  return (
    <Section className="flex flex-col gap-2 px-3 py-2">
      <div className="flex flex-row gap-4 items-start">
        <div className="relative w-20 h-20 md:w-24 md:h-24 aspect-square">
          <Image
            src={item?.catalog?.images[0] || "/placeholder.jpeg"}
            alt={item?.catalog?.name || "-"}
            fill={true}
            className="object-cover rounded-lg"
          />
        </div>

        <div className="flex flex-col w-full gap-2">
          <div className="flex justify-between items-start">
            <h3 className="text-base md:text-lg font-bold text-primary hover:text-primary-600">
              {item?.catalog?.name || "-"}
            </h3>
            <div className="flex gap-2 items-center">
              <p className="text-xs text-default-700 hidden md:block">
                {item?.xata?.createdAt
                  ? new Date(item.xata.createdAt).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                  : "-"}
              </p>
              <Chip variant="flat" radius="full" color="primary">
                {item?.status}
              </Chip>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-default-800">
            <FaClock size={12} />
            <span>
              {item?.start_rent
                ? new Date(item.start_rent).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "-"}{" "}
              -{" "}
              {item?.end_rent
                ? new Date(item.end_rent).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "-"}
            </span>
          </div>

          <div className="flex flex-row justify-between md:items-end">
            <div className="flex items-center gap-2">
              <p className="text-lg md:text-xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                Rp {item?.total_price?.toLocaleString() || "0"}
              </p>
            </div>

            <div className="flex items-center gap-1 text-xs text-default-800">
              {item.status==="done" ?
              <Button color="primary" onPress={() => router.push(`/catalog/${item.catalog?.id}`)}>
                Pesan Lagi
              </Button>:<></>
              }
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default UserOrderCard;
