"use client";

import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  Card,
  CardBody,
  Chip,
  ScrollShadow,
} from "@heroui/react";
import { IoMdClose } from "react-icons/io";
import { FaShoppingCart } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useUserCart } from "@/hooks/react-query/cart";
import CartItem from "./CartItem";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { data: cartItems, isLoading } = useUserCart();
  const router = useRouter();

  const totalItems = cartItems?.length || 0;
  const totalPrice =
    cartItems?.reduce((total, item) => {
      const price = item.catalog?.price || item.accessory?.price || 0;
      const additionalPrice =
        (item.catalog?.additional_day_price ||
          item.accessory?.additional_day_price ||
          0) * item.additional_days;
      const rentalPrice =
        (item.rental_days + item.additional_days) * price + additionalPrice;
      return total + rentalPrice;
    }, 0) || 0;

  const handleCheckout = () => {
    onClose();
    router.push("/checkout"); // This would be implemented later
  };

  const handleViewCart = () => {
    onClose();
    router.push("/cart"); // This would be implemented later
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="md">
      <DrawerContent>
        <DrawerHeader className="flex flex-col gap-1">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <FaShoppingCart className="text-2xl text-primary" />
              <h3 className="text-lg font-semibold">Shopping Cart</h3>
              <Chip size="sm" variant="flat">
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </Chip>
            </div>
            <Button isIconOnly variant="light" size="sm" onPress={onClose}>
              <IoMdClose className="text-xl" />
            </Button>
          </div>
        </DrawerHeader>

        <DrawerBody>
          {!cartItems || cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FaShoppingCart className="text-4xl text-default-400 mb-4" />
              <p className="text-default-500 mb-2">Your cart is empty</p>
              <p className="text-small text-default-400">
                Add some items to get started!
              </p>
            </div>
          ) : (
            <ScrollShadow className="space-y-3 max-h-[60vh]">
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </ScrollShadow>
          )}
        </DrawerBody>

        {cartItems && cartItems.length > 0 && (
          <DrawerFooter className="flex-col gap-3">
            <Card className="w-full">
              <CardBody className="py-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="text-lg font-bold text-primary">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
              </CardBody>
            </Card>

            <div className="flex gap-2 w-full">
              <Button
                variant="bordered"
                color="primary"
                onPress={handleViewCart}
                className="flex-1"
              >
                View Cart
              </Button>
              <Button
                color="primary"
                onPress={handleCheckout}
                className="flex-1"
              >
                Checkout
              </Button>
            </div>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default CartDrawer;
