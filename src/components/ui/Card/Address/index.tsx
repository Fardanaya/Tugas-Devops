import { FaPen, FaTrash } from "react-icons/fa6";
import { Button } from "../../heroui";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { IAddress } from "@/lib/types/schemas/address";

const AddressCard = ({
  data,
  onUpdate,
  onDelete,
}: {
  data: IAddress;
  onUpdate: (data: IAddress) => void;
  onDelete: (id: string) => void;
}) => {
  return (
    <div className="border-primary space-y-4 border rounded-lg p-4">
      <div className="flex justify-between">
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">{data.label || "Label"}</h3>
          <div className="flex flex-col">
            <p className="text-sm font-medium">
              {data.full_address || "Address"}
            </p>
            <p className="text-sm">{data.address_details || "Details"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button isIconOnly onPress={() => onUpdate(data)}>
            <FaPen />
          </Button>
          <Popover placement="right">
            <PopoverTrigger>
              <Button isIconOnly>
                <FaTrash />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="px-1 py-1 flex flex-row items-center gap-4">
                <div className="flex flex-col w-full">
                  <p className="text-sm font-bold">Apakah Anda yakin ?</p>
                  <p className="text-xs">Data akan dihapus secara permanen</p>
                </div>
                <div>
                  <Button
                    startContent={<FaTrash />}
                    color="danger"
                    size="sm"
                    onPress={() => onDelete(data.id || "")}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default AddressCard;
