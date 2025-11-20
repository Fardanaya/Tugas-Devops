"use client";

import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUserById } from "@/hooks/react-query/user";
import { useAddress } from "@/hooks/react-query/address";
import {
  Accordion,
  AccordionItem,
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { Button, Chip, Modal } from "@/components/ui/heroui";
import { FaLocationDot, FaWhatsapp } from "react-icons/fa6";
import { IoCall } from "react-icons/io5";
import Link from "next/link";
import { FaCheckCircle, FaFileAlt } from "react-icons/fa";
import InstagramCard from "@/components/ui/Card/Instagram";
import { fetchInstagram } from "@/lib/fetch";

const UserDetailPage = () => {
  const { id } = useParams();
  const [instagram, setInstagram] = useState();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { data: userData, isLoading: userLoading } = useUserById(id as string);
  const { data: addressData, isLoading: addressLoading } = useAddress({
    user: id as string,
  });

  useEffect(() => {
    if (userData?.instagram) {
      fetchInstagram(userData?.instagram).then((res) => {
        setInstagram(res.data);
      });
    }
  }, [userData]);

  return (
    <div className="flex flex-col md:flex-row">
      <Section className="flex flex-col w-full md:max-w-[40%] gap-3 md:gap-4">
        <div className="flex flex-col">
          <div className="relative">
            <div className="relative w-full min-h-[120px] md:min-h-[160px] rounded-lg overflow-hidden">
              <Image
                src="/404-bg.jpg"
                alt="..."
                fill
                className={`object-cover`}
              />
            </div>
            <div className="absolute bottom-[-20px] md:bottom-[-25px] left-[5%] z-2">
              <Avatar
                src={userData?.selfie_pict || "/placeholder.jpeg"}
                alt="user"
                className="size-[80px] md:size-[100px] shadow-2xl"
                classNames={{ img: "" }}
              />
            </div>
            <div className="absolute right-0 bottom-0 z-10 p-2">
              {userData?.is_admin && (
                <Chip
                  color="primary"
                  radius="full"
                  classNames={{
                    content:
                      "text-white font-semibold uppercase shadow-xl px-1.5",
                  }}
                >
                  Admin
                </Chip>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 p-4">
          <div className="flex flex-col">
            <p className="font-semibold">
              {userData?.full_name ?? "Nama Lengkap"}
            </p>
            <div className="flex items-center gap-2 text-xs">
              <Link href={`mailto:${userData?.email}`} className="text-primary">
                {userData?.email}
              </Link>
              <p>•</p>
              <p>{userData?.name}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-2">
            <div className="md:col-span-2 flex items-center">
              <InstagramCard instagram={instagram} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-1">
              <Dropdown showArrow>
                <DropdownTrigger>
                  <Button
                    size="sm"
                    startContent={<FaWhatsapp className="font-medium" />}
                    className="justify-start font-medium"
                  >
                    Contact
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Static Actions">
                  <DropdownItem
                    key="whatsapp"
                    startContent={<FaWhatsapp />}
                    href={
                      userData?.phone_whatsapp
                        ? `https://wa.me/${userData?.phone_whatsapp}`
                        : "#"
                    }
                  >
                    Whatsapp
                  </DropdownItem>
                  <DropdownItem
                    key="phone"
                    startContent={<IoCall />}
                    href={
                      userData?.phone_whatsapp
                        ? `tel:${userData?.phone_whatsapp}`
                        : "#"
                    }
                  >
                    Phone
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <Dropdown showArrow>
                <DropdownTrigger>
                  <Button
                    size="sm"
                    startContent={<FaWhatsapp className="font-medium" />}
                    className="justify-start font-medium"
                  >
                    Emergency
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Static Actions">
                  <DropdownItem
                    key="whatsapp"
                    startContent={<FaWhatsapp />}
                    href={
                      userData?.emergency_contact
                        ? `https://wa.me/${userData?.emergency_contact}`
                        : "#"
                    }
                  >
                    Whatsapp
                  </DropdownItem>
                  <DropdownItem
                    key="phone"
                    startContent={<IoCall />}
                    href={
                      userData?.emergency_contact
                        ? `tel:${userData?.emergency_contact}`
                        : "#"
                    }
                  >
                    Phone
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1 text-xs">
              <FaLocationDot />
              <p className="font-semibold">Alamat</p>
            </div>
            {addressData?.length === 0 ? (
              <p>Tidak ada alamat</p>
            ) : (
              <Accordion
                variant="bordered"
                className="border-1 border-default-400 rounded-lg px-0 overflow-hidden"
                showDivider={false}
              >
                {(addressData || []).map((item: any, index: number) => (
                  <AccordionItem
                    key={index}
                    startContent={<div>{item.label}</div>}
                    classNames={{
                      trigger:
                        "py-2 px-4 text-sm cursor-pointer hover:bg-white/10 transition-all",
                      content: "pt-0 px-4 text-xs",
                    }}
                  >
                    <p>{item.full_address}</p>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1 text-xs">
              <FaFileAlt />
              <p className="font-semibold">Berkas</p>
            </div>
            <div className="flex justify-between items-center gap-2">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <FaCheckCircle />
                  <p>Foto KTP</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <FaCheckCircle />
                  <p>Foto Selfie Dengan KTP</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <FaCheckCircle />
                  <p>Bukti Pernah Sewa</p>
                </div>
              </div>
              <Button
                color="primary"
                startContent={<FaFileAlt />}
                onPress={onOpenChange}
              >
                Lihat Berkas
              </Button>
              <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">
                        Modal Title
                      </ModalHeader>
                      <ModalBody>
                        <p>
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Nullam pulvinar risus non risus hendrerit
                          venenatis. Pellentesque sit amet hendrerit risus, sed
                          porttitor quam.
                        </p>
                      </ModalBody>
                      <ModalFooter>
                        <Button
                          color="danger"
                          variant="light"
                          onPress={onClose}
                        >
                          Close
                        </Button>
                        <Button color="primary" onPress={onClose}>
                          Action
                        </Button>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default UserDetailPage;
