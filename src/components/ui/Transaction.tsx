// "use client";

// import { CatalogCalendar } from "@/components/ui/Calendar";
// import { fromDate } from "@internationalized/date";
// import {
//   Button,
//   Chip,
//   Input,
//   Modal,
//   NumberInput,
//   Skeleton,
// } from "@/components/ui/heroui";
// import { Section } from "@/components/ui/Section";
// import {
//   depositExtendedTransactionStatus,
//   getStatusIndex,
//   transactionStatus,
//   useTransaction,
// } from "@/stores/useTransaction";
// import {
//   Accordion,
//   AccordionItem,
//   Alert,
//   cn,
//   Divider,
//   ModalBody,
//   ModalContent,
//   ModalFooter,
//   ModalHeader,
//   Radio,
//   RadioGroup,
//   ScrollShadow,
//   Select,
//   SelectItem,
//   Tab,
//   Tabs,
//   Textarea,
//   Tooltip,
//   useDisclosure,
// } from "@heroui/react";
// import Image from "next/image";
// import { useParams, useRouter } from "next/navigation";
// import { use, useCallback, useEffect, useState } from "react";
// import { FaCalendarAlt, FaInstagram, FaMapMarkerAlt } from "react-icons/fa";
// import {
//   FaAngleRight,
//   FaBox,
//   FaCalendar,
//   FaCalendarPlus,
//   FaCalendarXmark,
//   FaCheck,
//   FaCopy,
//   FaMinus,
//   FaMoneyBillWave,
//   FaPlus,
//   FaShirt,
//   FaTrash,
//   FaUser,
// } from "react-icons/fa6";
// import {
//   MdDiscount,
//   MdOutlinePersonalVideo,
//   MdOutlinePersonPin,
// } from "react-icons/md";
// import { useShipping } from "@/stores/useShipping";
// import { useTransactionAddon } from "@/stores/useTransaction_addon";
// import { usePayment } from "@/stores/usePayment";
// import { useExpedition } from "@/stores/useExpedition";
// import { Stepper } from "./Stepper";
// import { ShippingStepper } from "@/components/ui/ShippingStepper";
// import TextEditor from "./TextEditor/TextEditor";
// import { set } from "date-fns";
// import { usePaymentAccounts } from "@/stores/usePaymentAccounts";
// import { fetchInstagram } from "@/lib/fetch";
// import { TbBrandWhatsappFilled } from "react-icons/tb";
// import { RiInstagramFill } from "react-icons/ri";
// import { restoreAddOnStock } from "@/lib/addonStock";
// import SkeletonRentUser from "./Skeleton/RentUser/SkeletonRentUser";
// import { useSession } from "@/components/providers/SessionProvider";
// import { toast } from "react-toastify";
// import { useNotification } from "@/stores/useNotification";
// import { formatToLocale } from "@/lib/utils";
// import { get } from "http";
// import { HiSpeakerphone } from "react-icons/hi";
// import { metadataConfig } from "@/app/config";
// import { useAddress } from "@/stores/useAddress";
// import { useAddOn } from "@/stores/useAddOn";
// import moment from "moment";
// import AddonCard from "./Card/AddOn";
// interface ITempShipping {
//   expedition: any;
//   resi: string;
//   price: number;
// }

// interface Addons {
//   id: string;
//   name: string;
//   price: number;
//   quantity: number;
// }

// export const AddressRadio = (props: any) => {
//   const { children, ...otherProps } = props;

//   return (
//     <Radio
//       {...otherProps}
//       classNames={{
//         base: cn(
//           "inline-flex max-w-full m-0 bg-content1 hover:bg-content2 items-center justify-between",
//           "cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent",
//           "data-[selected=true]:border-primary"
//         ),
//         labelWrapper: "w-full",
//         label: "font-semibold text-sm md:text-medium",
//       }}
//     >
//       {children}
//     </Radio>
//   );
// };

// const Transaction = ({ type }: { type: "admin" | "user" }) => {
//   const { id } = useParams();
//   const router = useRouter();
//   const [loadPage, setLoadPage] = useState(true);
//   const { user: session } = useSession();
//   const {
//     loading: loadingTransaction,
//     model,
//     setModel: setModelTransaction,
//     getById: getById,
//     create: createTransaction,
//     getAll: getAllTransaction,
//     list,
//   } = useTransaction();
//   const {
//     loading: loadingShipping,
//     model: modelShipping,
//     setModel: setModelShipping,
//     create: createShipping,
//     getById: getByIdShipping,
//   } = useShipping();
//   const {
//     loading: loadingPayment,
//     create: createPayment,
//     setModel: setModelPayment,
//     model: modelPayment,
//     getById: getByIdPayment,
//   } = usePayment();
//   const {
//     loading: loadingAddons,
//     getByTransactionId,
//     list: listAddon,
//     getById: getByIdAddon,
//   } = useTransactionAddon();
//   const {
//     loading: loadingExpedition,
//     list: listExpedition,
//     getAll: getAllExpedition,
//     model: modelExpedition,
//     getById: getByIdExpedition,
//   } = useExpedition();

//   const {
//     loading: loadingPaymentAccounts,
//     list: listPaymentAccounts,
//     getAll: getAllPaymentAccounts,
//   } = usePaymentAccounts();

//   const {
//     loading: loadingAddress,
//     list: listAddress,
//     getAll: getAllAddress,
//     setModel: setModelAddress,
//     model: modelAddress,
//     setUser: setUserAddress,
//     create: createAddress,
//   } = useAddress();

//   const {
//     isOpen: isOpenReject,
//     onOpen: onOpenReject,
//     onOpenChange: onOpenChangeReject,
//   } = useDisclosure();

//   // Cancel modal
//   const {
//     isOpen: isOpenCancel,
//     onOpen: onOpenCancel,
//     onOpenChange: onOpenChangeCancel,
//   } = useDisclosure();

//   const {
//     isOpen: isOpenDataUser,
//     onOpen: onOpenDataUser,
//     onOpenChange: onOpenChangeDataUser,
//   } = useDisclosure();

//   const { sendNotif } = useNotification();

//   const [rTempShipping, setRTempShipping] = useState<ITempShipping>({
//     expedition: null,
//     resi: "",
//     price: 0,
//   });

//   const [sTempShipping, setSTempShipping] = useState<ITempShipping>({
//     expedition: null,
//     resi: "",
//     price: 0,
//   });

//   const [paymentType, setPaymentType] = useState<"full" | "dp" | any>("full");

//   const [uploadingImage, setUploadingImage] = useState(false);
//   const [isCopied, setIsCopied] = useState(false);

//   const [DPAmount, setDPAmount] = useState(0);
//   const [settlementAmount, setSettlementAmount] = useState(0);
//   const [rejectReason, setRejectReason] = useState("");
//   const [cancelReason, setCancelReason] = useState("");

//   const [selectedAddress, setSelectedAddress] = useState<string>("");
//   const [rentDate, setRentDate] = useState<{
//     start: any;
//     end: any;
//   }>({
//     start: null,
//     end: null,
//   });

//   const [sendingSteps, setSendingSteps] = useState<any[]>([]);
//   const [returningSteps, setReturningSteps] = useState<any[]>([]);

//   const [instagramData, setInstagramData] = useState<any>();

//   const fetchInstagramData = useCallback(async (username: string) => {
//     const data = await fetchInstagram(username, setInstagramData);
//     setInstagramData(data);
//   }, []);

//   const {
//     loading: loadingAddonsDepo,
//     list: listAddons,
//     getAll: getAllAddons,
//   } = useAddOn();
//   const [addonsSelected, setAddonsSelected] = useState<Addons[]>([]);
//   const {
//     isOpen: isOpenAddons,
//     onOpen: onOpenAddons,
//     onOpenChange: onOpenChangeAddons,
//   } = useDisclosure();

//   useEffect(() => {
//     setLoadPage(false);
//     getAllExpedition();
//     getAllPaymentAccounts();
//   }, []);

//   useEffect(() => {
//     if (session?.user.id) {
//       setUserAddress(session?.user.id as string);
//       getAllAddress();
//     }
//   }, [session?.user.id]);

//   useEffect(() => {
//     if (id) {
//       getById(id.toString());
//       getByTransactionId(id.toString());
//       getByIdPayment(id.toString());
//     }
//   }, [id]);

//   useEffect(() => {
//     if (listAddress) {
//       const defaultAddress = listAddress[0] || {};
//       setModelTransaction({ address: defaultAddress?.id || "" });
//       setModelAddress(defaultAddress);
//     }
//   }, [listAddress]);

//   // validasi cuma user tersebut dan admin yang bisa akses
//   useEffect(() => {
//     if (
//       !loadingTransaction &&
//       !loadPage &&
//       model.id &&
//       model?.user?.id !== session?.user?.id &&
//       type === "user"
//     ) {
//       // diback sama dikasih toast
//       router.back();
//       toast.error("Bukan punya kamu woii!");
//       return;
//     }
//   }, [model, id, type]);

//   useEffect(() => {
//     if (model.user?.instagram) fetchInstagramData(model.user?.instagram);
//   }, [model]);

//   useEffect(() => {
//     if (model.dp_payment) {
//       setPaymentType("full");
//     }
//   }, [model.dp_payment]);

//   useEffect(() => {
//     if (model.sett_payment && model.sett_payment.nominal >= 0)
//       setSettlementAmount(model.sett_payment?.nominal);
//   }, [model.sett_payment]);

//   const handleCopy = async (textToCopy: string) => {
//     try {
//       await navigator.clipboard.writeText(textToCopy);
//       setIsCopied(true);
//       setTimeout(() => setIsCopied(false), 2000);
//     } catch (err) {
//       console.error("Failed to copy: ", err);
//     }
//   };

//   const getSubtotalCostume = () => Number(model?.catalog?.price) || 0;

//   const getSubtotalAdditionalDay = () =>
//     (Number(model?.additional_day) || 0) * 50000;

//   const getSubtotalAddons = () =>
//     model.status === "priority"
//       ? addonsSelected.reduce(
//           (sum, addon) =>
//             sum + (Number(addon.price) || 0) * (Number(addon.quantity) || 1),
//           0
//         )
//       : listAddon?.reduce(
//           (sum, item) =>
//             sum + (Number(item?.price) || 0) * (Number(item?.qty) || 1),
//           0
//         ) || 0;

//   const getSubtotalShipping = () => Number(model?.s_shipping?.price) || 0;

//   const getSubtotalDiscount = () => Number(model?.discount?.amount) || 0;

//   const getTotal = () =>
//     getSubtotalCostume() +
//     getSubtotalAdditionalDay() +
//     getSubtotalAddons() +
//     getSubtotalShipping() -
//     getSubtotalDiscount();

//   const handleSubmitShipping = async (type: "send" | "return") => {
//     try {
//       const shippingId =
//         type === "send" ? model.s_shipping?.id : model.r_shipping?.id;
//       if (!shippingId) return;

//       const tempShipping = type === "send" ? sTempShipping : rTempShipping;

//       setModelShipping({
//         id: shippingId,
//         expedition: tempShipping.expedition,
//         resi: tempShipping.resi,
//         price: tempShipping.price,
//       });

//       const status = type === "send" ? "sending" : "returning";

//       await createShipping();
//       setModelTransaction({ status });
//       await createTransaction();
//       toast.success(
//         `Berhasil Mengirim Resi ${
//           type === "send" ? "Pengiriman" : "Pengembalian"
//         }!`
//       );

//       sendNotif({
//         data: {
//           status: status,
//           payload: model,
//         },
//       });
//     } catch (error) {
//       console.error("Failed to update sending:", error);
//     }
//   };

//   const handleAcceptOrder = async () => {
//     try {
//       // Create sending for sending
//       const sendShipping: any = await new Promise((resolve, reject) => {
//         const data = createShipping();
//         if (data) {
//           resolve(data);
//         } else {
//           reject(new Error("Failed to create sending sending"));
//         }
//       });

//       // Create sending for returning
//       const returnShipping: any = await new Promise((resolve, reject) => {
//         const data = createShipping();
//         if (data) {
//           resolve(data);
//         } else {
//           reject(new Error("Failed to create return sending"));
//         }
//       });

//       setModelTransaction({
//         id: model.id,
//         final_price: model.final_price + sendShipping.price,
//         s_shipping: sendShipping.id,
//         r_shipping: returnShipping.id,
//         status: "waiting",
//       });

//       createTransaction();
//       toast.success("Berhasil Menerima Pesanan! Tunggu pembayaran dari user.");

//       sendNotif({
//         data: {
//           status: "waiting",
//           payload: model,
//         },
//       });
//     } catch (error) {
//       console.error("Failed to process transaction:", error);
//     }
//   };

//   const handleSubmitPayment = async () => {
//     try {
//       const payment: any = await new Promise((resolve, reject) => {
//         const data = createPayment();
//         if (data) {
//           resolve(data);
//         } else {
//           reject(new Error("Failed to create payment"));
//         }
//       });

//       switch (paymentType) {
//         case "full":
//           setModelTransaction({
//             id: model.id,
//             payment: payment.id,
//             status: "paid",
//           });
//           setModelPayment({
//             id: payment.id,
//             nominal:
//               model?.final_price -
//               (Number(model?.deposit?.nominal ?? 0) +
//                 Number(model?.dp_payment?.nominal ?? 0)),
//           });
//           createPayment();
//           toast.success("Berhasil Melakukan Pembayaran Lunas!");
//           break;
//         case "dp":
//           setModelTransaction({
//             id: model.id,
//             dp_payment: payment.id,
//             status: "dp",
//           });
//           toast.success("Berhasil Melakukan Pembayaran DP!");
//           break;
//       }

//       createTransaction();
//       sendNotif({
//         data: {
//           status: `${paymentType === "full" ? "paid" : "dp"}`,
//           payload: paymentType === "full" ? model : payment,
//         },
//       });
//     } catch (error) {
//       console.error("Failed to process transaction:", error);
//     }
//   };

//   const handleImageUpload = async (file: File) => {
//     setUploadingImage(true);
//     try {
//       const formData = new FormData();
//       formData.append("files", file);
//       formData.append("type", "transaction");
//       formData.append("id", model?.id || "");

//       const uploadResponse = await fetch("/api/tools/image", {
//         method: "POST",
//         body: formData,
//       });

//       const uploadData = await uploadResponse.json();

//       if (!uploadResponse.ok) {
//         throw new Error(uploadData.error || "Image upload failed");
//       }

//       if (uploadData.success) {
//         setModelPayment({
//           proof: uploadData.results[0].url,
//         });
//         toast.success("Image uploaded successfully");
//       }
//     } catch (error) {
//       console.error("Upload error:", error);
//       toast.error(
//         error instanceof Error ? error.message : "Image upload failed"
//       );
//     } finally {
//       setUploadingImage(false);
//     }
//   };

//   const getStepsFromTracking = async (expedition?: string, resi?: string) => {
//     if (!expedition || !resi) return { steps: [], completed: false };

//     try {
//       const res = await fetch(
//         `/api/expedition/track?expedition=${expedition}&trackingNumber=${resi}`
//       );
//       const result = await res.json();

//       if (!res.ok || !result?.history?.length)
//         return { steps: [], completed: false };

//       return {
//         steps: result.history,
//         completed: result.status === "DELIVERED",
//       };
//     } catch (error) {
//       console.error("Gagal fetch tracking:", error);
//       return { steps: [], completed: false };
//     }
//   };

//   // Helper functions untuk versi editable
//   const handleDecrementAddon = (id: string) => {
//     setAddonsSelected((prev) => {
//       const idx = prev.findIndex((addon) => addon.id === id);
//       if (idx === -1) return prev;
//       const newQuantity = prev[idx].quantity - 1;
//       if (newQuantity <= 0) {
//         return prev.filter((addon) => addon.id !== id);
//       }
//       const updated = [...prev];
//       updated[idx] = { ...updated[idx], quantity: newQuantity };
//       return updated;
//     });
//   };

//   const handleIncrementAddon = (id: string) => {
//     const addon = listAddons?.find((a) => a.id === id);
//     if (!addon) return;

//     setAddonsSelected((prev) => {
//       const idx = prev.findIndex((addon) => addon.id === id);
//       if (idx === -1) return prev;
//       const newQuantity = prev[idx].quantity + 1;
//       if (newQuantity > addon.stock) return prev;
//       const updated = [...prev];
//       updated[idx] = { ...updated[idx], quantity: newQuantity };
//       return updated;
//     });
//   };

//   const handleChangeAddonQuantity = (id: string, value: string) => {
//     const addon = listAddons?.find((a) => a.id === id);
//     if (!addon) return;

//     const numValue = parseInt(value) || 0;
//     if (numValue > addon.stock) return;

//     setAddonsSelected((prev) => {
//       const idx = prev.findIndex((addon) => addon.id === id);
//       if (idx === -1) return prev;
//       if (numValue <= 0) {
//         return prev.filter((addon) => addon.id !== id);
//       }
//       const updated = [...prev];
//       updated[idx] = { ...updated[idx], quantity: numValue };
//       return updated;
//     });
//   };

//   const handleRemoveAddon = (id: string) => {
//     setAddonsSelected((prev) => prev.filter((addon) => addon.id !== id));
//   };

//   const handleAddAddon = (item: any) => {
//     setAddonsSelected((prev) => [
//       ...prev,
//       {
//         id: item.id || "",
//         name: item.name || "",
//         price: item.price || 0,
//         quantity: 1,
//       },
//     ]);
//   };

//   const isAddonSelected = (id: string) => {
//     return addonsSelected.some((selected) => selected.id === id);
//   };

//   const isAddonStockFull = (id: string, quantity: number) => {
//     const addon = listAddons?.find((a) => a.id === id);
//     return (addon?.stock || 0) <= quantity;
//   };

//   useEffect(() => {
//     const fetchTracking = async () => {
//       const sending = {
//         expedition:
//           model.s_shipping?.expedition?.code || model.s_shipping?.expedition,
//         resi: model.s_shipping?.resi,
//       };

//       const returning = {
//         expedition:
//           model.r_shipping?.expedition?.code || model.r_shipping?.expedition,
//         resi: model.r_shipping?.resi,
//       };

//       const shippingResult = await getStepsFromTracking(
//         sending.expedition,
//         sending.resi
//       );
//       setSendingSteps(shippingResult.steps);

//       const rResult = await getStepsFromTracking(
//         returning.expedition,
//         returning.resi
//       );
//       setReturningSteps(rResult.steps);
//     };

//     fetchTracking();
//   }, [model.s_shipping, model.r_shipping]);

//   console.log("model", model);

//   // Tambahkan di atas komponen Transaction
//   const handleSubmitPriorityOrder = async ({
//     model,
//     modelAddress,
//     addonsSelected,
//     setModelTransaction,
//     createTransaction,
//     useTransactionAddon,
//     toast,
//     getTotal,
//     getById,
//     getByTransactionId,
//     listAddon,
//   }: any) => {
//     // Update transaction fields
//     setModelTransaction({
//       id: model.id,
//       address: modelAddress?.id || model.address?.id || model.address,
//       start_rent: model.start_rent,
//       end_rent: model.end_rent,
//       additional_day: model.additional_day,
//       final_price: getTotal(),
//       status: "pending",
//     });
//     await createTransaction();

//     // Tambahkan addon baru
//     for (const addon of addonsSelected) {
//       await useTransactionAddon.getState().setModel({
//         transaction: model.id,
//         add_on: addon.id,
//         qty: addon.quantity,
//         price: addon.price,
//       });
//       await useTransactionAddon.getState().create();
//     }
//     toast.success("Berhasil submit order!");
//     // Refresh data
//     getById(model.id);
//     getByTransactionId(model.id);
//   };

//   return (
//     <div className="py-4 flex flex-col gap-4">
//       {loadingTransaction || loadPage ? (
//         <div>
//           <SkeletonRentUser type="order" />
//         </div>
//       ) : (
//         <>
//           <Section className="py-4 relative overflow-x-auto md:overflow-hidden">
//             {model?.cancel_reason || model?.reject_reason ? (
//               <div className="flex items-center gap-4 px-4 ">
//                 <div className="bg-danger px-4 py-1 rounded-lg">
//                   {model.cancel_reason && "Canceled"}
//                   {model.reject_reason && "Rejected"}
//                 </div>
//                 <div>{model.cancel_reason || model.reject_reason}</div>
//               </div>
//             ) : (
//               <Stepper
//                 steps={
//                   model?.deposit
//                     ? depositExtendedTransactionStatus
//                     : transactionStatus
//                 }
//                 activeStep={getStatusIndex(
//                   model.status || "pending",
//                   model?.deposit
//                     ? depositExtendedTransactionStatus
//                     : transactionStatus
//                 )}
//                 completed={model.status === "done"}
//               />
//             )}
//           </Section>

//           {getStatusIndex(model.status) >= 4 && type === "user" && (
//             <Alert color="warning" icon={<HiSpeakerphone />} isClosable={true}>
//               <p>
//                 Jangan lupa ngirim bukti unboxing ketika kostum sudah sampai dan
//                 ketika pengembalian 👉👈
//               </p>
//             </Alert>
//           )}

//           <Section className="px-4 py-3 flex flex-col gap-4">
//             <div className="flex flex-col gap-2">
//               <div className="flex flex-row justify-between gap-2">
//                 <div className="flex items-center gap-2 text-sm md:text-medium font-medium">
//                   <FaUser className="text-primary" />
//                   <p>Penyewa / Penerima</p>
//                 </div>

//                 {type === "user" && (
//                   <Button
//                     color="primary"
//                     // startContent={<BsChatFill />}
//                     onPress={() => {
//                       const message = encodeURIComponent(
//                         `halo kak , aku mau ngirim bukti unboxing kostum ${model?.catalog?.name}`
//                       );
//                       window.open(
//                         `https://wa.me/${metadataConfig.contact.whatsapp}?text=${message}`
//                       );
//                     }}
//                   >
//                     Hubungi Admin
//                   </Button>
//                 )}

//                 {type === "admin" && (
//                   <Button color="primary" onPress={onOpenDataUser}>
//                     Lihat data penyewa
//                   </Button>
//                 )}

//                 <Modal
//                   isOpen={isOpenDataUser}
//                   onOpenChange={onOpenChangeDataUser}
//                   size="full"
//                 >
//                   <ModalContent>
//                     <ModalBody>
//                       <div className="flex flex-col w-full h-full max-h-[100vh] overflow-y-auto gap-2 pt-4">
//                         <Tabs aria-label="Foto" className="w-full">
//                           <Tab key="identity" title="Identitas">
//                             <div className="flex flex-col md:flex-row gap-4 w-full">
//                               <div className="w-full md:w-1/2 flex flex-col gap-2">
//                                 <p className="text-sm font-medium text-primary text-center">
//                                   Foto Selfie
//                                 </p>
//                                 <div className="relative w-full aspect-[4/3] min-h-[150px] border rounded-lg overflow-hidden">
//                                   <Image
//                                     alt="Selfie"
//                                     className="object-cover"
//                                     src={
//                                       model?.user?.selfie_pict ||
//                                       "/placeholder.jpeg"
//                                     }
//                                     fill
//                                   />
//                                 </div>
//                               </div>

//                               <div className="w-full md:w-1/2 flex flex-col gap-2">
//                                 <p className="text-sm font-medium text-primary text-center">
//                                   Foto Identitas
//                                 </p>
//                                 <div className="relative w-full aspect-[4/3] min-h-[150px] border rounded-lg overflow-hidden">
//                                   <Image
//                                     alt="Identity"
//                                     className="object-cover"
//                                     src={
//                                       model?.user?.identity_pict ||
//                                       "/placeholder.jpeg"
//                                     }
//                                     fill
//                                   />
//                                 </div>
//                               </div>
//                             </div>
//                           </Tab>
//                           <Tab key="rent_proof" title="Bukti Sewa">
//                             <div className="w-full flex flex-col gap-2">
//                               <div className="grid grid-cols-1  md:grid-cols-2 gap-3">
//                                 {model?.user?.rent_proof?.map(
//                                   (proof: string, index: number) => (
//                                     <div
//                                       key={index}
//                                       className="flex flex-col gap-2"
//                                     >
//                                       <p className="text-sm font-medium text-primary text-center">
//                                         Bukti Sewa {index + 1}
//                                       </p>
//                                       <div className="relative w-full aspect-[4/3] min-h-[150px] border rounded-lg overflow-hidden">
//                                         <Image
//                                           alt={`Rent Proof ${index + 1}`}
//                                           className="object-cover"
//                                           src={proof || "/placeholder.jpeg"}
//                                           fill
//                                         />
//                                       </div>
//                                     </div>
//                                   )
//                                 )}
//                               </div>
//                             </div>
//                           </Tab>
//                         </Tabs>
//                       </div>
//                     </ModalBody>
//                   </ModalContent>
//                 </Modal>
//               </div>

//               <div className="flex flex-col md:flex-row gap-4">
//                 <div className="flex flex-col text-xs md:text-sm">
//                   <p className="font-semibold flex gap-2 items-center">
//                     <FaUser className="text-primary" />
//                     {model.user?.full_name || "-"}
//                   </p>
//                   <div className="flex flex-row gap-3 items-center">
//                     <p className="font-medium flex gap-2 items-center">
//                       <RiInstagramFill className="text-primary" />@
//                       {instagramData?.username || "-"}
//                     </p>
//                     <div className="flex flex-row gap-2 items-center">
//                       <p>
//                         <span className="font-semibold text-primary text-xs">
//                           {instagramData?.media_count || 0}
//                         </span>
//                         &nbsp;
//                         <span className="text-[0.6rem]">Post</span>
//                       </p>
//                       <p>
//                         <span className="font-semibold text-primary text-xs">
//                           {instagramData?.following_count || 0}
//                         </span>
//                         &nbsp;
//                         <span className="text-[0.6rem]">Following</span>
//                       </p>
//                       <p>
//                         <span className="font-semibold text-primary text-xs">
//                           {instagramData?.follower_count || 0}
//                         </span>
//                         &nbsp;
//                         <span className="text-[0.6rem]">Followers</span>
//                       </p>
//                     </div>
//                   </div>
//                   <p className="font-medium flex gap-2 items-center">
//                     <TbBrandWhatsappFilled className="text-primary" />
//                     {model.user?.phone_whatsapp || "-"}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {type === "user" && model.status === "priority" ? (
//               <div className="flex flex-col gap-2">
//                 <div className="flex items-center gap-2 text-sm md:text-medium font-medium">
//                   <FaMapMarkerAlt className="text-primary" />
//                   <p>Alamat</p>
//                 </div>
//                 {!listAddress ? (
//                   <Button
//                     isIconOnly
//                     onClick={() => router.push("/profile")}
//                     aria-label="Tambah Alamat"
//                     variant="flat"
//                     color="primary"
//                   >
//                     <FaPlus />
//                   </Button>
//                 ) : (
//                   <Accordion>
//                     <AccordionItem
//                       classNames={{ trigger: "py-0" }}
//                       key="address"
//                       aria-label="Address"
//                       indicator={<FaAngleRight className="text-primary" />}
//                       title={
//                         <p className="font-semibold text-sm md:text-medium">
//                           {modelAddress?.label || "-"}
//                         </p>
//                       }
//                       subtitle={
//                         <div className="text-[0.6rem] md:text-xs">
//                           <p className="font-semibold">
//                             {modelAddress?.full_address}
//                           </p>
//                           <p className="font-medium">
//                             {modelAddress?.address_details}
//                           </p>
//                         </div>
//                       }
//                     >
//                       <RadioGroup
//                         isRequired
//                         value={model?.address || ""}
//                         onValueChange={(value) => {
//                           setModelTransaction({ address: value });
//                           setModelAddress(
//                             listAddress?.find(
//                               (modelCatalog?: any) => modelCatalog?.id === value
//                             )
//                           );
//                         }}
//                       >
//                         {listAddress?.map((modelCatalog?: IAddress) => (
//                           <AddressRadio
//                             description={
//                               <div className="text-[0.6rem] md:text-xs">
//                                 <p className="font-semibold">
//                                   {modelCatalog?.full_address}
//                                 </p>
//                                 <p className="font-medium">
//                                   {modelCatalog?.address_details}
//                                 </p>
//                               </div>
//                             }
//                             value={modelCatalog?.id || ""}
//                             key={modelCatalog?.id || ""}
//                           >
//                             {modelCatalog?.label}
//                           </AddressRadio>
//                         ))}
//                       </RadioGroup>
//                     </AccordionItem>
//                   </Accordion>
//                 )}
//               </div>
//             ) : (
//               <div className="flex flex-col gap-2">
//                 <div className="flex items-center gap-2 text-sm md:text-medium font-medium">
//                   <FaMapMarkerAlt className="text-primary" />
//                   <p>Alamat</p>
//                 </div>

//                 <p className="font-semibold text-sm md:text-medium">
//                   {model.address?.label || "-"}
//                 </p>
//                 <div className="text-[0.6rem] md:text-xs">
//                   <p className="font-semibold">{model.address?.full_address}</p>
//                   <p className="font-medium">
//                     {model.address?.address_details}
//                   </p>
//                 </div>
//               </div>
//             )}
//           </Section>
//           {getStatusIndex(model.status || "pending") >= 3 && (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <Section className="px-4 py-3 flex flex-col gap-2">
//                 <div className="flex items-center gap-2 text-sm md:text-medium font-medium">
//                   <FaShirt className="text-primary" />
//                   <p>Pengiriman</p>
//                 </div>
//                 <div>
//                   {model.s_shipping?.expedition && model.s_shipping?.resi ? (
//                     <div className="flex flex-col gap-4">
//                       <div className="flex justify-end items-center gap-2">
//                         <Tooltip
//                           content={isCopied ? "Copied!" : "Copy to clipboard"}
//                         >
//                           <Button
//                             isIconOnly
//                             variant="light"
//                             size="sm"
//                             onPress={() => handleCopy(model.s_shipping?.resi)}
//                             aria-label={
//                               isCopied ? "Copied!" : "Copy to clipboard"
//                             }
//                             isDisabled={isCopied}
//                           >
//                             {isCopied ? <FaCheck /> : <FaCopy />}
//                           </Button>
//                         </Tooltip>
//                         <div className="flex flex-col items-end">
//                           <p className="text-md font-semibold leading-none">
//                             {model.s_shipping?.expedition?.name}
//                           </p>
//                           <div className="flex gap-2 items-center">
//                             <p className="text-xs font-semibold leading-none">
//                               {model.s_shipping?.resi}
//                             </p>
//                           </div>
//                         </div>
//                         <div>
//                           <Image
//                             src={
//                               model.s_shipping?.expedition?.icon ||
//                               "https://placehold.co/150"
//                             }
//                             alt={model.s_shipping?.expedition?.name}
//                             width={35}
//                             height={35}
//                             className="rounded-lg"
//                           />
//                         </div>
//                       </div>
//                       <ScrollShadow
//                         hideScrollBar
//                         className="flex flex-col gap-2 md:px-4 h-[300px]"
//                       >
//                         <ShippingStepper steps={sendingSteps} />
//                       </ScrollShadow>
//                     </div>
//                   ) : (
//                     type === "user" && (
//                       <div>
//                         <p>Admin belum melakukan pengiriman</p>
//                       </div>
//                     )
//                   )}
//                   <div>
//                     {type === "admin" &&
//                       (!model.s_shipping?.expedition ||
//                         !model.s_shipping?.resi) && (
//                         <div className="flex flex-col gap-2">
//                           <div className="flex flex-col md:flex-row gap-2">
//                             <Select
//                               fullWidth
//                               color="primary"
//                               label="Kurir"
//                               radius="sm"
//                               labelPlacement="outside"
//                               placeholder="Pilih kurir"
//                               className="md:max-w-[40%]"
//                               value={sTempShipping.expedition || ""}
//                               onChange={(value) => {
//                                 setSTempShipping({
//                                   ...sTempShipping,
//                                   expedition: value.target.value,
//                                 });
//                               }}
//                             >
//                               {listExpedition?.map((item: any) => (
//                                 <SelectItem key={item.id} textValue={item.name}>
//                                   {item.name}
//                                 </SelectItem>
//                               ))}
//                             </Select>
//                             <Input
//                               label="Resi"
//                               value={sTempShipping.resi}
//                               onChange={(e) =>
//                                 setSTempShipping({
//                                   ...sTempShipping,
//                                   resi: e.target.value,
//                                 })
//                               }
//                             />
//                           </div>
//                           <div className="flex justify-end">
//                             <Button
//                               onPress={() => {
//                                 handleSubmitShipping("send");
//                               }}
//                             >
//                               Simpan Resi
//                             </Button>
//                           </div>
//                         </div>
//                       )}
//                   </div>
//                 </div>
//               </Section>

//               <Section className="px-4 py-3 flex flex-col gap-2">
//                 <div className="flex items-center gap-2 text-sm md:text-medium font-medium">
//                   <FaShirt className="text-primary" />
//                   <p>Pengembalian</p>
//                 </div>
//                 <div>
//                   {model.r_shipping?.expedition && model.r_shipping?.resi ? (
//                     <div className="flex flex-col gap-4">
//                       <div className="flex justify-end items-center gap-2">
//                         <Tooltip
//                           content={isCopied ? "Copied!" : "Copy to clipboard"}
//                         >
//                           <Button
//                             isIconOnly
//                             variant="light"
//                             size="sm"
//                             onPress={() => handleCopy(model.r_shipping?.resi)}
//                             aria-label={
//                               isCopied ? "Copied!" : "Copy to clipboard"
//                             }
//                             isDisabled={isCopied}
//                           >
//                             {isCopied ? <FaCheck /> : <FaCopy />}
//                           </Button>
//                         </Tooltip>
//                         <div className="flex flex-col items-end">
//                           <p className="text-md font-semibold leading-none">
//                             {model.r_shipping?.expedition?.name || "N/A"}
//                           </p>
//                           <div className="flex gap-2 items-center">
//                             <p className="text-xs font-semibold leading-none">
//                               {model.r_shipping?.resi || "N/A"}
//                             </p>
//                           </div>
//                         </div>
//                         <div>
//                           <Image
//                             src={
//                               model.r_shipping?.expedition?.icon ||
//                               "https://placehold.co/150"
//                             }
//                             alt={model.r_shipping?.expedition?.name}
//                             width={35}
//                             height={35}
//                             className="rounded-lg"
//                           />
//                         </div>
//                       </div>
//                       <ScrollShadow
//                         hideScrollBar
//                         className="flex flex-col gap-2 md:px-4 h-[300px]"
//                       >
//                         <ShippingStepper steps={returningSteps} />
//                       </ScrollShadow>
//                     </div>
//                   ) : (
//                     type === "admin" && (
//                       <div>
//                         <p>User belum melakukan pengembalian</p>
//                       </div>
//                     )
//                   )}
//                   <div>
//                     {type === "user" &&
//                       (!model.r_shipping?.expedition ||
//                         !model.r_shipping?.resi) && (
//                         <div className="flex flex-col gap-2">
//                           <div className="flex flex-col md:flex-row gap-2">
//                             <Select
//                               fullWidth
//                               color="primary"
//                               label="Kurir"
//                               radius="sm"
//                               labelPlacement="outside"
//                               placeholder="Pilih kurir"
//                               className="md:max-w-[40%]"
//                               value={rTempShipping.expedition || ""}
//                               onChange={(value) => {
//                                 setRTempShipping({
//                                   ...rTempShipping,
//                                   expedition: value.target.value,
//                                 });
//                               }}
//                             >
//                               {listExpedition?.map((item: any) => (
//                                 <SelectItem key={item.id} textValue={item.name}>
//                                   {item.name}
//                                 </SelectItem>
//                               ))}
//                             </Select>
//                             <Input
//                               label="Resi"
//                               value={rTempShipping.resi}
//                               onChange={(e) =>
//                                 setRTempShipping({
//                                   ...rTempShipping,
//                                   resi: e.target.value,
//                                 })
//                               }
//                             />
//                           </div>
//                           <div className="flex justify-end">
//                             <Button
//                               onPress={() => {
//                                 handleSubmitShipping("return");
//                               }}
//                             >
//                               Simpan Resi
//                             </Button>
//                           </div>
//                         </div>
//                       )}
//                   </div>
//                 </div>
//               </Section>
//             </div>
//           )}

//           <Section className="px-4 py-3 flex flex-col gap-2">
//             <div className="flex items-center gap-2 text-sm md:text-medium font-medium">
//               <FaShirt className="text-primary" />
//               <p>Costume</p>
//             </div>
//             <div className="flex flex-col md:flex-row justify-between gap-2">
//               <div className="flex flex-row gap-2 md:gap-4">
//                 <div className="relative w-[100px] md:w-[150px] aspect-square">
//                   <Image
//                     src={model.catalog?.images?.[0] ?? "/placeholder.jpeg"}
//                     alt={model.catalog?.name || "-"}
//                     fill
//                     className="rounded-lg object-cover"
//                   />
//                 </div>
//                 <div className="flex flex-col justify-between">
//                   <div className="flex flex-col">
//                     <p className="text-xs md:text-medium font-medium line-clamp-1">
//                       {model.catalog?.name}
//                     </p>
//                     <div className="flex flex-col gap-1">
//                       <div className="flex flex-col gap-0.5">
//                         <div className="flex flex-row items-center gap-1">
//                           <MdOutlinePersonalVideo className="text-[0.65rem] md:text-xs" />
//                           <p className="text-[0.6rem] md:text-xs line-clamp-1 italic leading-tight pr-1">
//                             {model.catalog?.is_bundle &&
//                             model.catalog?.bundle_catalog &&
//                             model.catalog?.bundle_catalog.length > 0
//                               ? (() => {
//                                   const names = Array.from(
//                                     new Set(
//                                       model.catalog?.bundle_catalog.map(
//                                         (catalog: any) =>
//                                           catalog?.character?.series?.name
//                                       )
//                                     )
//                                   ).filter(Boolean);

//                                   if (names.length === 0)
//                                     return model.catalog?.character?.series
//                                       ?.name;
//                                   if (names.length === 1) return names[0];
//                                   if (names.length === 2)
//                                     return names.join(" & ");
//                                   return `${names.slice(0, -1).join(", ")} & ${
//                                     names[names.length - 1]
//                                   }`;
//                                 })()
//                               : model.catalog?.character?.series?.name ?? "-"}
//                           </p>
//                         </div>
//                         <div className="flex flex-row items-center gap-1">
//                           <MdOutlinePersonPin className="text-[0.65rem] md:text-xs" />
//                           <p className=" text-[0.6rem] md:text-xs line-clamp-1 italic leading-tight pr-1">
//                             {model.catalog?.is_bundle &&
//                             model.catalog?.bundle_catalog &&
//                             model.catalog?.bundle_catalog.length > 0
//                               ? (() => {
//                                   const names = Array.from(
//                                     new Set(
//                                       model.catalog?.bundle_catalog.map(
//                                         (catalog: any) =>
//                                           catalog?.character?.name
//                                       )
//                                     )
//                                   ).filter(Boolean);

//                                   if (names.length === 0)
//                                     return model.catalog?.character?.name;
//                                   if (names.length === 1) return names[0];
//                                   if (names.length === 2)
//                                     return names.join(" & ");
//                                   return `${names.slice(0, -1).join(", ")} & ${
//                                     names[names.length - 1]
//                                   }`;
//                                 })()
//                               : model.catalog?.character?.name ?? "-"}
//                           </p>
//                         </div>
//                         {!model.catalog?.is_bundle && (
//                           <div className="flex flex-row items-center gap-1">
//                             <MdDiscount className="text-[0.65rem] md:text-xs" />
//                             <p className=" text-[0.6rem] md:text-xs line-clamp-1 italic leading-tight pr-1">
//                               {model.catalog?.brand?.name ?? "-"}
//                             </p>
//                           </div>
//                         )}
//                       </div>
//                       <div className="flex flex-wrap gap-1 capitalize">
//                         {model.catalog?.is_bundle && (
//                           <Chip variant="bordered" size="xss" bundle="yes">
//                             Bundle
//                           </Chip>
//                         )}
//                         {!model.catalog?.is_bundle && (
//                           <>
//                             <div className="flex flex-row">
//                               <Chip variant="bordered" size="xss" type="size">
//                                 {model.catalog?.size ?? "?"}
//                                 {model.catalog?.max_size &&
//                                   ` - ${model.catalog?.max_size}`}
//                               </Chip>
//                             </div>
//                             <Chip
//                               variant="bordered"
//                               size="xss"
//                               gender={
//                                 (model.catalog?.gender || "unisex") as
//                                   | "male"
//                                   | "female"
//                                   | "unisex"
//                               }
//                             >
//                               {model.catalog?.gender}
//                             </Chip>
//                           </>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                   <div>
//                     <p className="flex items-center gap-1 font-semibold text-[0.7rem] md:text-sm leading-none text-primary">
//                       Rp{" "}
//                       {model.catalog?.price != null
//                         ? formatToLocale(model.catalog?.price)
//                         : "0"}{" "}
//                       / 3 hari
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </Section>

//           <div className="flex flex-col md:flex-row gap-4">
//             <Section className="px-4 py-3 flex flex-col gap-2 md:w-[40%]">
//               <div className="flex items-center gap-2 text-sm md:text-medium font-medium">
//                 <FaCalendar className="text-primary" />
//                 <p>Tanggal Pemakaian</p>
//               </div>

//               {model.status === "priority" ? (
//                 <div className="flex flex-col gap-4">
//                   <div className="mx-auto">
//                     <div className="flex flex-col items-center mb-2">
//                       <p className="font-semibold text-sm md:text-base text-primary">
//                         Ketersediaan Tanggal
//                       </p>
//                     </div>
//                     <CatalogCalendar
//                       isDateUnavailable={(date) => {
//                         const isUnavailable = list.some((transaction) => {
//                           if (
//                             transaction?.status === "reject" ||
//                             transaction?.status === "cancel"
//                           )
//                             return false;
//                           if (
//                             !transaction?.start_rent ||
//                             !transaction?.end_rent
//                           )
//                             return false;
//                           const start = fromDate(
//                             new Date(transaction?.start_rent),
//                             "Asia/Jakarta"
//                           );
//                           const end = fromDate(
//                             new Date(transaction?.end_rent),
//                             "Asia/Jakarta"
//                           );
//                           return (
//                             date.compare(start) >= 0 && date.compare(end) <= 0
//                           );
//                         });
//                         const today = fromDate(new Date(), "Asia/Jakarta");
//                         const isPast = date.compare(today) < 0;
//                         return isUnavailable || isPast;
//                       }}
//                       is_weekday={model.catalog?.is_weekday}
//                       max={5}
//                       min={2}
//                       date={
//                         model?.start_rent && model?.end_rent
//                           ? {
//                               start: fromDate(
//                                 new Date(model?.start_rent),
//                                 "Asia/Jakarta"
//                               ),
//                               end: fromDate(
//                                 new Date(model?.end_rent),
//                                 "Asia/Jakarta"
//                               ),
//                             }
//                           : undefined
//                       }
//                       onRangeChange={(range) => {
//                         if (range && range.start && range.end) {
//                           const startDate = range.start.toDate("Asia/Jakarta");
//                           const endDate = range.end.toDate("Asia/Jakarta");
//                           const diffDays =
//                             moment(endDate).diff(moment(startDate), "days") + 1;
//                           let additional_day = 0;
//                           if (diffDays > 3) {
//                             additional_day = diffDays - 3;
//                           }
//                           setModelTransaction({
//                             ...model,
//                             start_rent: startDate,
//                             end_rent: endDate,
//                             additional_day: additional_day || 0,
//                           });
//                         }
//                       }}
//                     />
//                     <div className="mt-2 text-xs text-default-600 text-center">
//                       <span className="line-through">1</span> = Tanggal dicoret
//                       berarti sudah disewa dan tidak tersedia.
//                     </div>
//                   </div>
//                   <div className="flex flex-col gap-1 md:gap-2 w-full">
//                     <div className="flex flex-row items-center gap-2">
//                       <div className="flex flex-row justify-between md:items-end text-xs md:text-sm w-full">
//                         <p className="font-semibold text-default-900">Start</p>
//                         <p className="font-medium text-default-900">
//                           {model?.start_rent
//                             ? new Date(model.start_rent).toDateString()
//                             : "-"}
//                         </p>
//                       </div>
//                       <FaCalendarAlt className="text-primary text-medium md:text-xl" />
//                     </div>
//                     <div className="flex flex-row items-center gap-2">
//                       <div className="flex flex-row justify-between md:items-end text-xs md:text-sm w-full">
//                         <p className="font-semibold text-default-900">End</p>
//                         <p className="font-medium text-default-900">
//                           {model?.end_rent
//                             ? new Date(model.end_rent).toDateString()
//                             : "-"}
//                         </p>
//                       </div>
//                       <FaCalendarXmark className="text-primary text-medium md:text-xl" />
//                     </div>
//                     <div className="flex flex-row justify-center items-center gap-2">
//                       <div className="flex flex-row justify-between items-center text-xs md:text-sm w-full">
//                         <p className="font-semibold text-default-900">
//                           Tambahan
//                         </p>
//                         <div className="flex flex-row w-full max-w-[50%]">
//                           <Button
//                             isIconOnly
//                             isDisabled={(model?.additional_day || 0) <= 0}
//                             size="sm"
//                             className="rounded-r-none"
//                             onPress={() => {
//                               const value =
//                                 Number(model?.additional_day || 0) - 1;
//                               if (value < 0) return;
//                               setModelTransaction({
//                                 ...model,
//                                 additional_day: value,
//                               });
//                             }}
//                           >
//                             <FaMinus />
//                           </Button>
//                           <Input
//                             type="number"
//                             size="sm"
//                             endContent={"Hari"}
//                             className="no-spinners"
//                             classNames={{
//                               inputWrapper: "rounded-none",
//                               input: "text-center",
//                             }}
//                             value={(model?.additional_day || 0).toString()}
//                             min={0}
//                             max={2}
//                             onValueChange={(value) =>
//                               setModelTransaction({
//                                 ...model,
//                                 additional_day: value,
//                               })
//                             }
//                           />
//                           <Button
//                             isDisabled={(model?.additional_day || 0) >= 2}
//                             isIconOnly
//                             size="sm"
//                             className="rounded-l-none"
//                             onPress={() => {
//                               const value =
//                                 Number(model?.additional_day || 0) + 1;
//                               if (value > 2) return;
//                               setModelTransaction({
//                                 ...model,
//                                 additional_day: value,
//                               });
//                             }}
//                           >
//                             <FaPlus />
//                           </Button>
//                         </div>
//                       </div>
//                       <FaCalendarPlus className="text-primary text-medium md:text-xl" />
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="flex flex-col gap-4">
//                   <div className="mx-auto pointer-events-none opacity-60">
//                     <CatalogCalendar
//                       date={{
//                         start: fromDate(
//                           new Date(model?.start_rent ?? new Date()),
//                           "Asia/Jakarta"
//                         ),
//                         end: fromDate(
//                           new Date(model?.end_rent ?? new Date()),
//                           "Asia/Jakarta"
//                         ),
//                       }}
//                       isReadOnly
//                     />
//                   </div>

//                   <div className="flex flex-col gap-1 md:gap-2 w-full">
//                     <div className="flex flex-row items-center gap-2">
//                       <div className="flex flex-row justify-between md:items-end text-xs md:text-sm w-full">
//                         <p className="font-semibold text-default-900">Start</p>
//                         <p className="font-medium text-default-900">
//                           {model?.start_rent
//                             ? new Date(model?.start_rent).toDateString()
//                             : "-"}
//                         </p>
//                       </div>
//                       <FaCalendarAlt className="text-primary text-medium md:text-xl" />
//                     </div>

//                     <div className="flex flex-row items-center gap-2">
//                       <div className="flex flex-row justify-between md:items-end text-xs md:text-sm w-full">
//                         <p className="font-semibold text-default-900">End</p>
//                         <p className="font-medium text-default-900">
//                           {model?.end_rent
//                             ? new Date(
//                                 new Date(model?.end_rent).setDate(
//                                   new Date(model?.end_rent).getDate()
//                                 )
//                               ).toDateString()
//                             : "-"}
//                         </p>
//                       </div>
//                       <FaCalendarXmark className="text-primary text-medium md:text-xl" />
//                     </div>

//                     {model?.additional_day > 0 && (
//                       <div className="flex flex-row justify-center items-center gap-2">
//                         <div className="flex flex-row justify-between items-center text-xs md:text-sm w-full">
//                           <p className="font-semibold text-default-900">
//                             Tambahan
//                           </p>
//                           <p className="font-medium text-default-900">
//                             {model.additional_day} Hari
//                           </p>
//                         </div>
//                         <FaCalendarPlus className="text-primary text-medium md:text-xl" />
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </Section>
//             <Section className="px-4 py-3 flex flex-col gap-2 md:w-[70%]">
//               <div className="flex items-center gap-2 text-sm md:text-medium font-medium">
//                 <FaBox className="text-primary" />
//                 <p>Tambahan</p>
//               </div>
//               {model.status === "priority" ? (
//                 <div className="grid grid-cols-1 gap-2">
//                   {addonsSelected.length > 0 ? (
//                     addonsSelected.map((item, idx) => (
//                       <div
//                         className="flex flex-col md:flex-row gap-2"
//                         key={idx}
//                       >
//                         <div className="w-full md:w-[70%]">
//                           <AddonCard
//                             isPressable={false}
//                             item={listAddons?.find(
//                               (addon) => addon.id === item.id
//                             )}
//                             hideStock
//                           />
//                         </div>
//                         <div className="flex flex-col justify-between gap-1 md:gap-0 w-full md:w-[30%]">
//                           <div className="flex flex-row w-full">
//                             <Button
//                               isIconOnly
//                               isDisabled={item.quantity <= 0}
//                               className="rounded-r-none"
//                               onPress={() => handleDecrementAddon(item.id)}
//                             >
//                               <FaMinus />
//                             </Button>
//                             <Input
//                               type="number"
//                               className="no-spinners"
//                               classNames={{
//                                 inputWrapper: "rounded-none",
//                                 input: "text-center",
//                               }}
//                               value={item.quantity.toString()}
//                               min={0}
//                               onValueChange={(value) =>
//                                 handleChangeAddonQuantity(item.id, value)
//                               }
//                             />
//                             <Button
//                               isIconOnly
//                               className="rounded-l-none"
//                               isDisabled={isAddonStockFull(
//                                 item.id,
//                                 item.quantity
//                               )}
//                               onPress={() => handleIncrementAddon(item.id)}
//                             >
//                               <FaPlus />
//                             </Button>
//                           </div>
//                           <Button
//                             fullWidth
//                             size="sm"
//                             color="danger"
//                             startContent={<FaTrash />}
//                             onPress={() => handleRemoveAddon(item.id)}
//                           >
//                             Hapus
//                           </Button>
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <div className="h-full flex items-center justify-center">
//                       <p>Tidak ada add-on</p>
//                     </div>
//                   )}
//                   <div className="flex justify-between items-center gap-2">
//                     <div>
//                       <p className="text-sm md:text-medium font-medium">
//                         Ada Tambahan?
//                       </p>
//                     </div>
//                     <Button onPress={onOpenAddons}>Tambah</Button>
//                   </div>
//                   <Modal
//                     isOpen={isOpenAddons}
//                     onOpenChange={onOpenChangeAddons}
//                     scrollBehavior="inside"
//                   >
//                     <ModalContent>
//                       <ModalHeader>Tambahan</ModalHeader>
//                       <ModalBody>
//                         <ScrollShadow className="grid grid-cols-1 gap-2">
//                           {listAddons
//                             ?.filter(
//                               (addon) =>
//                                 addon.id != null &&
//                                 !isAddonSelected(addon.id as string)
//                             )
//                             .map((item, idx) => (
//                               <div className="flex gap-2 mb-4" key={idx}>
//                                 <div className="w-full">
//                                   <AddonCard isPressable={false} item={item} />
//                                 </div>
//                                 <Button
//                                   isIconOnly
//                                   className="h-full"
//                                   onPress={() => {
//                                     handleAddAddon(item);
//                                     onOpenChangeAddons();
//                                   }}
//                                 >
//                                   <FaPlus />
//                                 </Button>
//                               </div>
//                             ))}
//                         </ScrollShadow>
//                       </ModalBody>
//                     </ModalContent>
//                   </Modal>
//                 </div>
//               ) : /* VERSI READ-ONLY */
//               listAddon?.length > 0 ? (
//                 <div className="grid grid-cols-1 gap-2">
//                   {listAddon?.map((item: any, index: number) => (
//                     <div key={index} className="flex items-center gap-2">
//                       <div className="relative size-[75px] md:size-[80px] aspect-square">
//                         <Image
//                           src={item?.add_on?.image || "/placeholder.jpeg"}
//                           alt={item?.add_on?.name || "-"}
//                           fill
//                           className="rounded-lg object-cover"
//                         />
//                       </div>
//                       <div className="flex flex-col p-2 md:px-3 w-full">
//                         <p className="text-medium md:text-lg font-semibold line-clamp-1">
//                           {item?.add_on?.name || "-"}
//                         </p>
//                         <p className="text-primary text-sm md:text-medium font-semibold line-clamp-1">
//                           Rp {item?.add_on?.price?.toLocaleString("id-ID") || 0}
//                         </p>
//                       </div>
//                       <div className="w-[20%] flex flex-col justify-center items-center p-2">
//                         <p className="text-2xl text-primary font-semibold">
//                           {item?.qty || "-"}
//                         </p>
//                         <p className="text-[0.6rem] uppercase">Quantity</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="h-full flex items-center justify-center">
//                   <p>Tidak ada add-on</p>
//                 </div>
//               )}
//             </Section>
//           </div>

//           {[1, 2].includes(getStatusIndex(model.status || "")) && (
//             <div className="flex flex-row gap-2 w-full">
//               {type === "user" && (
//                 <>
//                   <Section className="px-4 py-3 flex flex-col gap-2 w-full">
//                     {!model.dp_payment && (
//                       <RadioGroup
//                         orientation="horizontal"
//                         defaultValue="full"
//                         className="mb-2"
//                         name="paymentType"
//                         onChange={(e) => setPaymentType(e.target.value)}
//                       >
//                         <div className="flex flex-col">
//                           <Radio value="dp">
//                             Down Payment (Minimal 50% : Rp{" "}
//                             {(
//                               model?.final_price -
//                               Number(model?.deposit?.nominal ?? 0) -
//                               Math.round(
//                                 (model?.final_price -
//                                   Number(model?.deposit?.nominal ?? 0)) *
//                                   0.5
//                               )
//                             ).toLocaleString("id-ID")}
//                             )
//                           </Radio>
//                           <Radio value="full">Full Payment</Radio>
//                         </div>
//                       </RadioGroup>
//                     )}

//                     {type === "user" && model?.status === "waiting" && (
//                       <div className="flex flex-col gap-2">
//                         <p className="font-semibold text-sm mb-1">
//                           Nominal Down Payment
//                         </p>
//                         <NumberInput
//                           placeholder="Nominal DP"
//                           hideStepper
//                           value={model?.dp_payment?.nominal}
//                           onChange={(e) =>
//                             setModelPayment({
//                               ...modelPayment,
//                               nominal: Number(e) || 0,
//                             })
//                           }
//                           className="w-full"
//                         />
//                       </div>
//                     )}

//                     {getStatusIndex(model.status) === 2 && (
//                       <p>
//                         Harap Selesaikan Pelunasan H-7 Sebesar Rp{" "}
//                         {(
//                           model?.final_price -
//                           Number(model?.deposit?.nominal ?? 0) -
//                           Number(model?.dp_payment?.nominal ?? 0)
//                         ).toLocaleString("id-ID")}
//                       </p>
//                     )}

//                     <Accordion variant="splitted" className="divide-y-0 p-0">
//                       {listPaymentAccounts.map((method) => (
//                         <AccordionItem
//                           key={method.id}
//                           aria-label="pembayaran"
//                           onChange={() => {
//                             setModelPayment({
//                               payment_method: method.id,
//                             });
//                           }}
//                           indicator={<FaAngleRight className="text-primary" />}
//                           title={
//                             <div className="flex items-center gap-2">
//                               <span className="text-md">
//                                 {method.bank_name}
//                               </span>
//                             </div>
//                           }
//                         >
//                           <div className="flex flex-col gap-3 py-2">
//                             <div>
//                               <p className="font-semibold text-sm mb-1">
//                                 Nomor {method.bank_name}
//                               </p>
//                               <div className="flex items-center gap-2">
//                                 <span className="font-mono text-base select-all">
//                                   {method.account_number}
//                                 </span>
//                                 <span className="text-xs text-default-900">
//                                   a.n. {method?.account_name}
//                                 </span>
//                               </div>
//                             </div>
//                             <div>
//                               <Input
//                                 type="file"
//                                 name="images"
//                                 accept="image/*"
//                                 isRequired
//                                 onChange={(e) => {
//                                   const file = e.target.files?.[0];
//                                   if (file) {
//                                     handleImageUpload(file);
//                                   }
//                                 }}
//                                 isDisabled={uploadingImage}
//                               />
//                               <Button
//                                 size="sm"
//                                 className="w-fit mt-2"
//                                 onPress={async () => {
//                                   handleSubmitPayment();
//                                 }}
//                                 isDisabled={uploadingImage}
//                               >
//                                 {model.dp_payment
//                                   ? "Bayar Pelunasan"
//                                   : "Bayar Sekarang"}
//                               </Button>
//                             </div>
//                           </div>
//                         </AccordionItem>
//                       ))}
//                     </Accordion>
//                   </Section>
//                 </>
//               )}
//             </div>
//           )}

//           <div className="flex flex-col md:flex-row gap-4">
//             {getStatusIndex(model.status) >= 6 && (
//               <Section className="px-4 py-3 flex flex-col gap-2 md:w-full">
//                 <div className="flex items-center gap-2 text-sm md:text-medium font-medium">
//                   <FaBox className="text-primary" />
//                   <p>Settlement</p>
//                 </div>
//                 {type === "user" && (
//                   <div className="flex flex-col gap-2">
//                     {!model.settlement_reason && (
//                       <div className="flex flex-col gap-2 justify-center items-center">
//                         <p className="text-xs">
//                           {model.status !== "done"
//                             ? "Admin belum memberikan alasan settlement"
//                             : "Kostum kembali dengan aman tanpa kerusakan & keterlambatan"}
//                         </p>
//                       </div>
//                     )}

//                     {model.settlement_reason && (
//                       <div className="flex flex-col gap-1">
//                         <p className="font-medium text-xs">Alasan Settlement</p>
//                         <div
//                           dangerouslySetInnerHTML={{
//                             __html: model.settlement_reason,
//                           }}
//                         />
//                       </div>
//                     )}

//                     {model.sett_payment?.nominal > 0 && (
//                       <div className="flex flex-col gap-1">
//                         <p className="font-medium text-xs">Biaya Settlement</p>
//                         <p className="text-sm">
//                           Rp{" "}
//                           {Number(model.sett_payment?.nominal).toLocaleString(
//                             "id-ID"
//                           )}
//                         </p>
//                       </div>
//                     )}

//                     {/* FORM PAYMENT SETTLEMENT USER TARUH SINI */}
//                     {model?.sett_payment &&
//                       (model?.sett_payment?.proof ? (
//                         <div className="flex flex-col gap-2">
//                           <p className="font-semibold text-sm mb-1">
//                             Bukti Pembayaran
//                           </p>
//                           <div className="flex items-center gap-2">
//                             <Image
//                               src={
//                                 model.sett_payment.proof ||
//                                 "https://placehold.co/150"
//                               }
//                               alt={model.sett_payment.payment_method}
//                               width={250}
//                               height={250}
//                               className="rounded-lg"
//                             />
//                           </div>
//                         </div>
//                       ) : (
//                         <div>
//                           <Accordion
//                             variant="splitted"
//                             className="divide-y-0 p-0"
//                           >
//                             {listPaymentAccounts.map((method) => (
//                               <AccordionItem
//                                 key={method.id}
//                                 aria-label="pembayaran"
//                                 onChange={() => {
//                                   setModelPayment({
//                                     payment_method: method.id,
//                                   });
//                                 }}
//                                 indicator={
//                                   <FaAngleRight className="text-primary" />
//                                 }
//                                 title={
//                                   <div className="flex items-center gap-2">
//                                     <span className="text-md">
//                                       {method.bank_name}
//                                     </span>
//                                   </div>
//                                 }
//                               >
//                                 <div className="flex flex-col gap-3 py-2">
//                                   <div>
//                                     <p className="font-semibold text-sm mb-1">
//                                       Nomor {method.bank_name}
//                                     </p>
//                                     <div className="flex items-center gap-2">
//                                       <span className="font-mono text-base select-all">
//                                         {method.account_number}
//                                       </span>
//                                       <span className="text-xs text-default-900">
//                                         a.n. {method?.account_name}
//                                       </span>
//                                     </div>
//                                   </div>
//                                   <div>
//                                     <Input
//                                       type="file"
//                                       name="images"
//                                       accept="image/*"
//                                       isRequired
//                                       onChange={(e) => {
//                                         const file = e.target.files?.[0];
//                                         if (file) {
//                                           handleImageUpload(file);
//                                         }
//                                       }}
//                                       isDisabled={uploadingImage}
//                                     />
//                                     <Button
//                                       size="sm"
//                                       className="w-fit mt-2"
//                                       onPress={async () => {
//                                         setModelPayment({
//                                           id: model.sett_payment?.id,
//                                         });
//                                         createPayment();
//                                         toast.success(
//                                           "Berhasil Mengirimkan Bukti Pembayaran Settlement!"
//                                         );
//                                       }}
//                                       isDisabled={uploadingImage}
//                                     >
//                                       Bayar Settlement
//                                     </Button>
//                                   </div>
//                                 </div>
//                               </AccordionItem>
//                             ))}
//                           </Accordion>
//                         </div>
//                       ))}
//                   </div>
//                 )}
//                 {type === "admin" && (
//                   <>
//                     {model.status === "done" ? (
//                       // Case 1: No settlement required
//                       <div className="flex flex-col gap-2 justify-center items-center">
//                         <p className="text-xs">
//                           {!model.settlement_reason && !model.sett_payment?.id
//                             ? "Kostum kembali dengan aman tanpa kerusakan & keterlambatan"
//                             : "Tidak ada settlement yang diperlukan"}
//                         </p>
//                       </div>
//                     ) : !model.sett_payment?.id ? (
//                       // Case 2: Settlement required but not yet set
//                       <>
//                         <NumberInput
//                           hideStepper
//                           label="Biaya"
//                           value={settlementAmount}
//                           onValueChange={(e) => {
//                             setSettlementAmount(e);
//                           }}
//                           startContent={
//                             <div className="pointer-events-none flex gap-1 items-center text-primary">
//                               <FaMoneyBillWave />
//                               <span className="text-small">Rp</span>
//                             </div>
//                           }
//                         />
//                         <div className="flex flex-col gap-1">
//                           <p className="text-small text-primary">Alasan</p>
//                           <TextEditor
//                             height={300}
//                             readonly={false}
//                             value={model.settlement_reason ?? ""}
//                             onValueChange={(e) => {
//                               setModelTransaction({ settlement_reason: e });
//                             }}
//                           />
//                         </div>
//                         {getStatusIndex(model.status) >= 5 &&
//                           getStatusIndex(model.status) <= 6 && (
//                             <div className="flex justify-end gap-2">
//                               <Button
//                                 color="primary"
//                                 onPress={async () => {
//                                   const payment: any = await new Promise(
//                                     (resolve, reject) => {
//                                       setModelPayment({
//                                         nominal: settlementAmount,
//                                       });
//                                       const data = createPayment();
//                                       if (data) {
//                                         resolve(data);
//                                       } else {
//                                         reject(
//                                           new Error("Failed to create payment")
//                                         );
//                                       }
//                                     }
//                                   );
//                                   setModelTransaction({
//                                     sett_payment: payment.id,
//                                   });
//                                   createTransaction();
//                                   toast.success(
//                                     "Berhasil Mengirimkan Settlement!"
//                                   );
//                                 }}
//                               >
//                                 Submit
//                               </Button>
//                             </div>
//                           )}
//                       </>
//                     ) : (
//                       // Case 3: Settlement already set
//                       <div className="flex flex-col gap-2">
//                         {model.settlement_reason && (
//                           <div className="flex flex-col gap-1">
//                             <p className="font-medium text-xs">
//                               Alasan Settlement
//                             </p>
//                             <div
//                               dangerouslySetInnerHTML={{
//                                 __html: model.settlement_reason,
//                               }}
//                             />
//                           </div>
//                         )}
//                         {model.sett_payment?.nominal > 0 && (
//                           <div className="flex flex-col gap-1">
//                             <p className="font-medium text-xs">
//                               Biaya Settlement
//                             </p>
//                             <p className="text-sm">
//                               Rp{" "}
//                               {Number(
//                                 model.sett_payment?.nominal
//                               ).toLocaleString("id-ID")}
//                             </p>
//                           </div>
//                         )}
//                         <p className="font-semibold text-sm mb-1">
//                           Bukti Pembayaran
//                         </p>
//                         <div className="flex items-center gap-2">
//                           <Image
//                             src={model.sett_payment?.proof}
//                             alt={model.sett_payment?.payment_method}
//                             width={250}
//                             height={250}
//                             className="rounded-lg"
//                           />
//                         </div>
//                       </div>
//                     )}
//                   </>
//                 )}
//               </Section>
//             )}

//             <Section className="px-4 py-3 flex flex-col gap-2 w-full h-fit">
//               <div className="flex items-center gap-2 text-sm md:text-medium font-medium">
//                 <FaCalendar className="text-primary" />
//                 <p>Rincian Pembayaran</p>
//               </div>
//               <div className="flex flex-col gap-2">
//                 <div className="flex flex-col text-default-800">
//                   {getSubtotalCostume() > 0 && (
//                     <div className="flex flex-row justify-between text-sm md:text-medium">
//                       <p>Subtotal Kostum</p>
//                       <p>Rp {getSubtotalCostume().toLocaleString("id-ID")}</p>
//                     </div>
//                   )}

//                   {model?.additional_day > 0 && (
//                     <div className="flex flex-row justify-between text-sm md:text-medium">
//                       <p>
//                         Tambahan Hari ({" "}
//                         <span className="text-primary">
//                           {model.additional_day}
//                         </span>{" "}
//                         x Rp 50.000 )
//                       </p>
//                       <p>
//                         Rp {getSubtotalAdditionalDay().toLocaleString("id-ID")}
//                       </p>
//                     </div>
//                   )}

//                   {getSubtotalAddons() > 0 && (
//                     <div className="flex flex-row justify-between text-sm md:text-medium">
//                       <p>Subtotal Tambahan</p>
//                       <p>Rp {getSubtotalAddons().toLocaleString("id-ID")}</p>
//                     </div>
//                   )}

//                   <div className="flex flex-row justify-between text-sm md:text-medium">
//                     <p>Subtotal Pengiriman</p>
//                     {model.s_shipping ? (
//                       <p>Rp {getSubtotalShipping().toLocaleString("id-ID")}</p>
//                     ) : type === "admin" && model?.status === "pending" ? (
//                       <NumberInput
//                         placeholder="Biaya Pengiriman"
//                         hideStepper
//                         value={modelShipping.price}
//                         onChange={(e) =>
//                           setModelShipping({
//                             ...modelShipping,
//                             price: Number(e) || 0,
//                           })
//                         }
//                         className="w-fit"
//                       />
//                     ) : (
//                       <p>Tunggu Konfirmasi Admin</p>
//                     )}
//                   </div>

//                   {getSubtotalDiscount() > 0 && (
//                     <div className="flex flex-row justify-between text-sm md:text-medium">
//                       <p>Voucher Diskon Digunakan</p>
//                       <p>Rp -{getSubtotalDiscount().toLocaleString("id-ID")}</p>
//                     </div>
//                   )}

//                   {getTotal() > 0 && (
//                     <div className="flex justify-between text-medium md:text-lg text-foreground">
//                       <p>Total</p>
//                       <p className="font-semibold text-primary">
//                         Rp {getTotal().toLocaleString("id-ID")}
//                       </p>
//                     </div>
//                   )}

//                   {/* Breakdown Deposit, DP, Sisa Pembayaran di bawah total */}
//                   {(model.deposit?.nominal > 0 ||
//                     model.dp_payment?.nominal > 0) && (
//                     <>
//                       <Divider className="my-2 bg-default" />
//                       {model.deposit?.nominal > 0 && (
//                         <div className="flex flex-row justify-between text-sm md:text-medium">
//                           <p>Deposit</p>
//                           <p className="font-medium">
//                             Rp {model.deposit?.nominal?.toLocaleString("id-ID")}
//                           </p>
//                         </div>
//                       )}
//                       {model.dp_payment?.nominal > 0 && (
//                         <div className="flex flex-row justify-between text-sm md:text-medium">
//                           <p>Down Payment</p>
//                           <p className="font-medium">
//                             Rp{" "}
//                             {model.dp_payment?.nominal?.toLocaleString("id-ID")}
//                           </p>
//                         </div>
//                       )}
//                       <div className="flex flex-row justify-between text-sm md:text-medium">
//                         <p>Sisa Pembayaran</p>
//                         {(() => {
//                           const sisaPembayaran = Math.max(
//                             getTotal() -
//                               (Number(model.deposit?.nominal ?? 0) +
//                                 Number(model.dp_payment?.nominal ?? 0) +
//                                 Number(model.payment?.nominal ?? 0)),
//                             0
//                           );
//                           if (
//                             model.payment?.nominal > 0 ||
//                             sisaPembayaran <= 0
//                           ) {
//                             return (
//                               <span className="font-semibold text-green-600">
//                                 Lunas
//                               </span>
//                             );
//                           }
//                           return (
//                             <p className="font-medium">
//                               Rp {sisaPembayaran.toLocaleString("id-ID")}
//                             </p>
//                           );
//                         })()}
//                       </div>
//                     </>
//                   )}
//                 </div>

//                 {model.dp_payment?.nominal > 0 && (
//                   <div className="flex flex-col text-sm">
//                     <div className="flex flex-row justify-between">
//                       <p>Down Payment</p>
//                       <p className="font-medium">
//                         Rp {model.dp_payment?.nominal?.toLocaleString("id-ID")}
//                       </p>
//                     </div>
//                     <div className="flex flex-row justify-between">
//                       <p>
//                         {getStatusIndex(model.status) === 2
//                           ? "Kekurangan Pembayaran"
//                           : "Pelunasan Pembayaran"}
//                       </p>
//                       <p className="font-medium">
//                         Rp{" "}
//                         {(
//                           getTotal() - Number(model.dp_payment?.nominal ?? 0)
//                         ).toLocaleString("id-ID")}
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </Section>
//           </div>

//           <div>
//             {type === "user" && (
//               <>
//                 {model?.status === "pending" && (
//                   <Section className="px-4 py-3 flex flex-col gap-2">
//                     <div className="flex gap-2 justify-end">
//                       <Button color="danger" size="md" onPress={onOpenCancel}>
//                         Cancel
//                       </Button>
//                       <Modal
//                         isOpen={isOpenCancel}
//                         placement="top-center"
//                         onOpenChange={onOpenChangeCancel}
//                       >
//                         <ModalContent>
//                           {(onClose) => (
//                             <>
//                               <ModalHeader className="flex flex-col gap-1">
//                                 Cancel
//                               </ModalHeader>
//                               <ModalBody>
//                                 <Textarea
//                                   label="Alasan Pembatalan"
//                                   variant="bordered"
//                                   onValueChange={(e) => setCancelReason(e)}
//                                 />
//                               </ModalBody>
//                               <ModalFooter>
//                                 <Button
//                                   color="danger"
//                                   onPress={async () => {
//                                     if (listAddon && listAddon.length > 0) {
//                                       await restoreAddOnStock(
//                                         listAddon.map((item: any) => ({
//                                           id: item.add_on?.id || item.add_on,
//                                           quantity: item.qty || 0,
//                                         }))
//                                       );
//                                     }
//                                     setModelTransaction({
//                                       id: model.id,
//                                       status: "cancel",
//                                       cancel_reason: cancelReason,
//                                     });
//                                     createTransaction();
//                                     toast.success(
//                                       "Berhasil Membatalkan Pesanan!"
//                                     );
//                                     sendNotif({
//                                       data: {
//                                         status: "cancel",
//                                         payload: model,
//                                       },
//                                     });
//                                     onClose();
//                                   }}
//                                 >
//                                   Cancel
//                                 </Button>
//                               </ModalFooter>
//                             </>
//                           )}
//                         </ModalContent>
//                       </Modal>
//                     </div>
//                   </Section>
//                 )}
//                 {model?.status === "priority" && (
//                   <Button
//                     onPress={async () => {
//                       await handleSubmitPriorityOrder({
//                         model,
//                         modelAddress,
//                         addonsSelected,
//                         setModelTransaction,
//                         createTransaction,
//                         useTransactionAddon,
//                         toast,
//                         getTotal,
//                         getById,
//                         getByTransactionId,
//                         listAddon,
//                       });
//                     }}
//                   >
//                     Submit Order
//                   </Button>
//                 )}
//               </>
//             )}
//           </div>

//           <div>
//             {getStatusIndex(model.status) >= 2 && (
//               <Section className="px-4 py-3 flex flex-col gap-2">
//                 <div className="flex flex-row gap-2">
//                   <p className="text-xs md:text-sm text-default-700">
//                     Bukti pembayaran dari penyewa:
//                   </p>

//                   {model?.deposit?.proof && (
//                     <div className="flex flex-col gap-1">
//                       <p className="text-xs text-default-600">Bukti Deposit</p>
//                       <p>
//                         Tanggal Pembayaran:{" "}
//                         {model?.deposit?.xata?.createdAt
//                           ? new Date(
//                               model.deposit?.xata.createdAt
//                             ).toLocaleDateString("id-ID")
//                           : "-"}
//                       </p>
//                       <Image
//                         src={model?.deposit?.proof || "/placeholder.jpeg"}
//                         alt="Bukti Deposit"
//                         width={200}
//                         height={200}
//                         className="rounded-lg"
//                       />
//                     </div>
//                   )}
//                   {model?.dp_payment?.proof && (
//                     <div className="flex flex-col gap-1">
//                       <p className="text-xs text-default-600">Bukti DP</p>
//                       <p>
//                         Tanggal Pembayaran:{" "}
//                         {model?.dp_payment?.xata?.createdAt
//                           ? new Date(
//                               model.dp_payment?.xata.createdAt
//                             ).toLocaleDateString("id-ID")
//                           : "-"}
//                       </p>
//                       <Image
//                         src={model?.dp_payment?.proof || "/placeholder.jpeg"}
//                         alt="Bukti DP"
//                         width={200}
//                         height={200}
//                         className="rounded-lg"
//                       />
//                     </div>
//                   )}

//                   {model?.payment?.proof && (
//                     <div className="flex flex-col gap-1">
//                       <p className="text-xs text-default-600">
//                         Bukti Pelunasan
//                       </p>
//                       <p>
//                         Tanggal Pembayaran:{" "}
//                         {model?.payment?.xata?.createdAt
//                           ? new Date(
//                               model.payment?.xata.createdAt
//                             ).toLocaleDateString("id-ID")
//                           : "-"}
//                       </p>
//                       <Image
//                         src={model?.payment?.proof || "/placeholder.jpeg"}
//                         alt="Bukti Pelunasan"
//                         width={200}
//                         height={200}
//                         className="rounded-lg"
//                       />
//                     </div>
//                   )}
//                 </div>
//               </Section>
//             )}

//             {type === "admin" && (
//               <>
//                 {model.status === "pending" && (
//                   <Section className="px-4 py-3 flex flex-col gap-2">
//                     <div className="flex gap-2 justify-end">
//                       <Button color="danger" size="md" onPress={onOpenReject}>
//                         Tolak
//                       </Button>
//                       <Modal
//                         isOpen={isOpenReject}
//                         placement="top-center"
//                         onOpenChange={onOpenChangeReject}
//                       >
//                         <ModalContent>
//                           {(onClose) => (
//                             <>
//                               <ModalHeader className="flex flex-col gap-1">
//                                 Tolak
//                               </ModalHeader>
//                               <ModalBody>
//                                 <Textarea
//                                   label="Alasan Penolakan"
//                                   variant="bordered"
//                                   onValueChange={(e) => setRejectReason(e)}
//                                 />
//                               </ModalBody>
//                               <ModalFooter>
//                                 <Button
//                                   color="danger"
//                                   onPress={async () => {
//                                     if (listAddon && listAddon.length > 0) {
//                                       await restoreAddOnStock(
//                                         listAddon.map((item: any) => ({
//                                           id: item.add_on?.id || item.add_on,
//                                           quantity: item.qty || 0,
//                                         }))
//                                       );
//                                     }
//                                     setModelTransaction({
//                                       id: model.id,
//                                       status: "reject",
//                                       reject_reason: rejectReason,
//                                     });
//                                     createTransaction();
//                                     toast.success("Berhasil Menolak Pesanan!");
//                                     sendNotif({
//                                       data: {
//                                         status: "reject",
//                                         payload: {
//                                           ...model,
//                                           reject_reason: rejectReason,
//                                         },
//                                       },
//                                     });
//                                     onClose();
//                                   }}
//                                 >
//                                   Tolak
//                                 </Button>
//                               </ModalFooter>
//                             </>
//                           )}
//                         </ModalContent>
//                       </Modal>
//                       <Button
//                         color="primary"
//                         size="md"
//                         onPress={() => {
//                           handleAcceptOrder();
//                         }}
//                       >
//                         Terima
//                       </Button>
//                     </div>
//                   </Section>
//                 )}

//                 {getStatusIndex(model.status) >= 5 &&
//                   getStatusIndex(model.status) <= 6 && (
//                     <div className="flex justify-end flex-col md:flex-row gap-2 w-full md:w-auto py-2">
//                       {getStatusIndex(model.status) === 5 && (
//                         <Button
//                           color="danger"
//                           fullWidth
//                           onPress={() => {
//                             setModelTransaction({ status: "settlement" });
//                             createTransaction();
//                             toast.success("Transaksi Bermasalah!");
//                             sendNotif({
//                               data: {
//                                 status: "settlement",
//                                 payload: model,
//                               },
//                             });
//                           }}
//                         >
//                           Bermasalah
//                         </Button>
//                       )}
//                       <Button
//                         color="primary"
//                         fullWidth
//                         onPress={() => {
//                           setModelTransaction({ status: "done" });
//                           createTransaction();
//                           toast.success("Berhasil Menyelesaikan Transaksi!");
//                           sendNotif({
//                             data: {
//                               status: "done",
//                               payload: model,
//                             },
//                           });
//                         }}
//                       >
//                         Selesaikan
//                       </Button>
//                     </div>
//                   )}
//               </>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default Transaction;
