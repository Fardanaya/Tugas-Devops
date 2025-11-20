import { LuUsersRound, LuShoppingCart, LuSettings, LuSwords, LuWarehouse, LuServerCog } from "react-icons/lu";
import { BsBoxSeam } from "react-icons/bs";
import { TbLayoutDashboard } from "react-icons/tb";
import { TbShirt } from "react-icons/tb";
import { FiVideo } from "react-icons/fi";
import { MdOutlineAddToPhotos } from "react-icons/md";
import { RiCoupon2Line, RiTShirtAirLine } from "react-icons/ri";

export interface SidebarItem {
    label: string;
    href?: string;
    icon: React.ComponentType;
    tooltip?: string;
    submenu?: SidebarItem[]
}


export const sidebarData: SidebarItem[] = [
    {
        label: "Dashboard",
        href: "/admin",
        icon: TbLayoutDashboard,
        tooltip: "Dashboard"
    },
    {
        label: "Order",
        href: "/admin/order",
        icon: BsBoxSeam,
        tooltip: "Order"
    },
    {
        label: "Catalog",
        icon: LuShoppingCart,
        tooltip: "Costume",
        submenu: [
            {
                label: "Single Catalog",
                href: "/admin/catalog",
                icon: TbShirt,
                tooltip: "Single Catalog"
            },
            {
                label: "Bundle Catalog",
                href: "/admin/catalog/bundle",
                icon: RiTShirtAirLine,
                tooltip: "Bundle Catalog"
            },
            {
                label: "Accessory",
                href: "/admin/accessories",
                icon: MdOutlineAddToPhotos,
                tooltip: "Accessory"
            },
        ]
    },
    {
        label: "Warehouse",
        icon: LuWarehouse,
        tooltip: "Warehouse",
        submenu: [
            {
                label: "Addon",
                href: "/admin/warehouse/addon",
                icon: MdOutlineAddToPhotos,
                tooltip: "Addon"
            },
        ]
    },
    {
        label: "Master Data",
        icon: LuServerCog,
        tooltip: "Master Data",
        submenu: [
            {
                label: "Voucher",
                href: "/admin/master/voucher",
                icon: RiCoupon2Line,
                tooltip: "Voucher"
            },
            {
                label: "Series",
                href: "/admin/master/series",
                icon: FiVideo,
                tooltip: "Series"
            },
            {
                label: "Character",
                href: "/admin/master/character",
                icon: LuSwords,
                tooltip: "Character"
            },
            {
                label: "Brand",
                href: "/admin/master/brand",
                icon: TbShirt,
                tooltip: "Brand"
            }
        ]
    },
    {
        label: "User",
        href: "/admin/user",
        icon: LuUsersRound,
        tooltip: "User"
    },
    {
        label: "Settings",
        href: "/admin/settings",
        icon: LuSettings,
        tooltip: "Settings"
    }
];