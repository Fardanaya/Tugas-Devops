import Image from "next/image";
import { Section } from "../Section";
import { Divider, User } from "@heroui/react";
import { FaInstagram } from "react-icons/fa6";
import { Chip } from "../heroui";

const OrderCard = () => {
  return (
    <Section className="flex flex-col gap-2 px-3 py-2">
      <div className="flex flex-row items-center gap-4">
        <p className="text-lg text-primary font-bold">#0001</p>
        <Divider orientation="vertical" className="h-5 bg-primary" />
        <User
          name={"Davin Tistama B.S"}
          description={
            <div className="flex flex-row items-center gap-1">
              <FaInstagram />
              d.avux
            </div>
          }
          avatarProps={{
            src: "https://placehold.co/50x50",
            size: "sm",
            classNames: {
              base: "aspect-square",
            },
          }}
          classNames={{
            name: "text-[0.7rem] font-medium",
            description: "text-[0.65rem] font-semibold tracking-wide",
          }}
        />
      </div>
      <div className="flex flex-row gap-2">
        <div className="relative size-[60px] aspect-square">
          <Image
            alt="..."
            className="object-cover rounded aspect-square"
            src="/placeholder.jpeg"
            fill
          />
        </div>
        <div className="flex flex-col justify-between w-full">
          <p className="text-sm line-clamp-2 leading-4">
            Costume Name Lorem ipsum dolor sit amet consectetur adipisicing
            elit. Quod esse dolorem rem illo, quam harum deserunt nam ipsa
            corporis qui, atque saepe explicabo omnis, non beatae illum sapiente
            deleniti libero!
          </p>
          <div className="flex flex-row justify-between items-center w-full">
            <p className="flex flex-row gap-1 items-center text-lg font-semibold text-primary">
              <span className="text-xs">Rp</span>
              <span>200.000</span>
            </p>
            <Chip size="xs" payment="unpaid">
              Unpaid
            </Chip>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default OrderCard;
