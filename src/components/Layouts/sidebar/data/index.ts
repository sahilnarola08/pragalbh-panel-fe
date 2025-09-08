import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Customer",
        icon: Icons.User,
        items: [
          {
            title: "Add Customer",
            url: "/customer/addCustomer",
            icon: Icons.User,
          },
          {
            title: "Customer List",
            url: "/customer",
            icon: Icons.User,
          },
        ],
      },
      {
        title: "Order",
        icon: Icons.Table,
        url: "/order",
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
        title: "Product",
        icon: Icons.FourCircle,
        url: "/product",
      },
      {
        title: "Supplier",
        icon: Icons.HomeIcon,
        url: "/supplier",
      },
      {
        title: "Sign In",
        icon: Icons.Authentication,
        url: "/auth/sign-in",
      },
    ],
  },
];
