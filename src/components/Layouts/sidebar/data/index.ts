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
            url: "/customer/add-customer",
            icon: Icons.User,
          },
          {
            title: "Customer List",
            url: "/customer/customer-list",
            icon: Icons.User,
          },
        ],
      },
      {
        title: "Order",
        icon: Icons.Table,
        url: "/order",
        items: [
          {
            title: "Add Order",
            url: "/order/add-order",
            icon: Icons.Table,
          },
          {
            title: "Order List",
            url: "/order/order-list",
            icon: Icons.Table,
          },
        ],
      },
      {
        title: "Product",
        icon: Icons.FourCircle,
        url: "/product",
        items: [
          {
            title: "Add Product",
            url: "/product/add-product",
            icon: Icons.FourCircle,
          },
          {
            title: "Product List",
            url: "/product/product-list",
            icon: Icons.FourCircle,
          },
        ],
      },
      {
        title: "Supplier",
        icon: Icons.HomeIcon,
        url: "/supplier",
        items: [
          {
            title: "Add Supplier",
            url: "/supplier/add-supplier",
            icon: Icons.HomeIcon,
          },
          {
            title: "Supplier List",
            url: "/supplier/supplier-list",
            icon: Icons.HomeIcon,
          },
        ],
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
