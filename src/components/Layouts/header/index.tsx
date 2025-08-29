"use client";

import { SearchIcon } from "@/assets/icons";
import Image from "next/image";
import Link from "next/link";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { MenuIcon } from "./icons";
import { Notification } from "./notification";
import { ThemeToggleSwitch } from "./theme-toggle";
import { UserInfo } from "./user-info";
import { usePathname } from "next/navigation";

export function Header() {
  const { toggleSidebar, isMobile, isCollapsed, toggleCollapsed } = useSidebarContext();
  const pathname = usePathname();

  const getPageTitle = () => {
  switch (pathname) {
    case '/':
      return 'Dashboard';
    case '/user':
      return 'User Management';
    case '/product':
      return 'Product Management';
    case '/order':
      return 'Order Management';
    case '/customer':
      return 'Customer Management';
    case '/income':
      return 'Income Management';
    case '/expense':
      return 'Expense Management';
    case '/platform':
      return 'Platform Management';
    case '/profile':
      return 'Profile Management';
    case '/auth/sign-in':
      return 'Sign In';
    case '/auth/sign-up':
      return 'Sign Up ';
    case '/auth/forgot-password':
      return 'Forgot Password ';
    case '/auth/reset-password':
      return 'Reset Password';
    default:
      return 'Dashboard';
  }
}

  const handleSidebarToggle = () => {
    if (isMobile) {
      toggleSidebar();
    } else {
      toggleCollapsed();
    }
  };

  
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stroke bg-white px-3 py-3 shadow-sm dark:border-stroke-dark dark:bg-gray-dark sm:px-4 sm:py-4 md:px-5 md:py-5 2xl:px-10">
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        <button
          onClick={handleSidebarToggle}
          className="rounded-lg border p-1.5 dark:border-stroke-dark dark:bg-[#020D1A] hover:dark:bg-[#FFFFFF1A] sm:px-2 sm:py-1.5"
        >
          <MenuIcon />
          <span className="sr-only">Toggle Sidebar</span>
        </button>
        <div className="block min-w-0 flex-1">
          <h1 className="mb-0.5 text-sm font-bold text-dark dark:text-white sm:text-base md:text-lg lg:text-heading-5 truncate">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2 md:gap-3 lg:gap-4">
        {/* <div className="relative w-full max-w-[300px]">
          <input
            type="search"
            placeholder="Search"
            className="flex w-full items-center gap-3.5 rounded-full border bg-gray-2 py-3 pl-[53px] pr-5 outline-none transition-colors focus-visible:border-primary dark:border-dark-3 dark:bg-dark-2 dark:hover:border-dark-4 dark:hover:bg-dark-3 dark:hover:text-dark-6 dark:focus-visible:border-primary"
          />

          <SearchIcon className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 max-[1015px]:size-5" />
        </div> */}

        {/* <ThemeToggleSwitch /> */}

        {/* <Notification /> */}

        <div className="shrink-0">
          <UserInfo />
        </div>
      </div>
    </header>
  );
}
