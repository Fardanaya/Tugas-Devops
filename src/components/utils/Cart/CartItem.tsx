"use client";

import React from "react";
import { Card, CardBody, Image, Button } from "@heroui/react";
import { IoMdClose } from "react-icons/io";
import { ICartItem } from "@/lib/types/schemas/cart";
import { useRemoveFromCart } from "@/hooks/react-query/cart";

interface CartItemProps {
  item: ICartItem;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const removeFromCart = useRemoveFromCart();

  // Get item data from catalog or accessory
  const itemData = item.catalog || item.accessory;
  const itemName = itemData?.name || "";
  const itemPrice = itemData?.price || 0;
  const additionalPrice = itemData?.additional_day_price || 0;
  const itemImage = itemData?.images?.[0] || "/placeholder.jpeg";

  // Calculate pricing
  const basePrice = itemPrice * (item.rental_days + item.additional_days);
  const additionalCharge = additionalPrice * item.additional_days;
  const totalPrice = basePrice + additionalCharge;

  const handleRemove = () => {
    removeFromCart.mutate(item.id!);
  };

  return (
    <Card className="w-full">
      <CardBody className="p-4">
        <div className="flex gap-4">
          {/* Item Image */}
          <div className="flex-shrink-0">
            <Image
              src={itemImage}
              alt={itemName}
              className="w-16 h-16 object-cover rounded-lg"
              fallbackSrc="/placeholder.jpeg"
            />
          </div>

          {/* Item Details */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium text-sm truncate">{itemName}</h3>
                <p className="text-xs text-default-500 capitalize">
                  {item.item_type}
                </p>
              </div>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={handleRemove}
                className="text-default-500 hover:text-danger"
              >
                <IoMdClose size={16} />
              </Button>
            </div>

            {/* Rental Details */}
            <div className="flex flex-col gap-1 mb-3">
              <div className="flex justify-between items-center text-xs">
                <span>
                  {item.rental_days} rental day
                  {item.rental_days !== 1 ? "s" : ""}
                </span>
                <span>
                  Rp {(itemPrice * item.rental_days).toLocaleString("id-ID")}
                </span>
              </div>
              {item.additional_days > 0 && (
                <div className="flex justify-between items-center text-xs">
                  <span>
                    +{item.additional_days} additional day
                    {item.additional_days !== 1 ? "s" : ""}
                  </span>
                  <span>
                    Rp{" "}
                    {(additionalPrice * item.additional_days).toLocaleString(
                      "id-ID"
                    )}
                  </span>
                </div>
              )}
              {item.selected_size && (
                <div className="text-xs text-default-500">
                  Size: {item.selected_size}
                </div>
              )}
            </div>

            {/* Total Price */}
            <div className="flex justify-end">
              <div className="font-semibold text-primary">
                Rp {totalPrice.toLocaleString("id-ID")}
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default CartItem;
