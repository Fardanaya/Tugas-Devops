import { Card } from "@heroui/react";
import Image from "next/image";
import { Button } from "../heroui";

const CardHistory = () => {
  return (
    <div className="border border-primary rounded-xl p-4">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <Card radius="sm">
            <Image
              alt="Woman listing to music"
              className="object-cover"
              src="/placeholder.jpeg"
              width={100}
              height={100}
            />
          </Card>
        </div>
        <div className="flex flex-col justify-between w-full">
          <div className="space-y-2">
            <div className="flex flex-row justify-between">
              <p className="font-medium">Rental Costume Furina Maid</p>
              <p>Tanggal : 27 Februari 2025</p>
            </div>
            <div className="flex flex-col gap-1 text-sm">
              <p>Total Item : 1</p>
              <p>Total Harga : Rp. 100.000</p>
              <p>Tanggal : 27 Februari 2025</p>
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <Button>Hubungi Penjual</Button>
            <Button>Order Lagi</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardHistory;
