import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Customer",
        icon: Icons.User,
        url: "/customer/customer-list",
      },
      {
        title: "Order",
        icon: Icons.Table,
        url: "/order/order-list",
      },
      {
        title: "Product",
        icon: Icons.FourCircle,
        url: "/product/product-list",
      },
      {
        title: "Supplier",
        icon: Icons.HomeIcon,
        url: "/supplier/supplier-list",
      },
      {
        title: "Order Management",
        icon: Icons.OrderManagement,
        url: "/order-management",
      },
      {
        title: "Income",
        icon: Icons.PieChart,
        url: "/income",
      },
      {
        title: "Sign In",
        icon: Icons.Authentication,
        url: "/auth/sign-in",
      },
    ],
  },
];
