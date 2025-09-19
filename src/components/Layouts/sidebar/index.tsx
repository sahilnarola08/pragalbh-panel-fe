"use client";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { NAV_DATA } from "./data";
import { ArrowLeftIcon } from "./icons";
import { MenuItem } from "./menu-item";
import { useSidebarContext } from "./sidebar-context";
import { Skeleton } from "@/components/ui/skeleton";
import * as Icons from "./icons";

// Skeleton components for sidebar loading
function SidebarMenuSkeleton({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "flex items-center gap-3 rounded-lg p-3",
            isCollapsed ? "justify-center" : ""
          )}
        >
          <Skeleton className="h-6 w-6 shrink-0" />
          {!isCollapsed && <Skeleton className="h-4 w-20" />}
        </div>
      ))}
    </div>
  );
}

function SidebarSkeleton({ isCollapsed, isMobile }: { isCollapsed: boolean; isMobile: boolean }) {
  return (
    <div className="flex h-full flex-col py-10 pl-[14px] pr-[7px]">
      {/* Logo skeleton */}
      <div className="relative pr-4.5">
        {isCollapsed && !isMobile ? (
          <div className="flex items-center justify-center">
            <Skeleton className="h-10 w-10" />
          </div>
        ) : (
          <Skeleton className="h-15 w-55" />
        )}
      </div>

      {/* Navigation skeleton */}
      <div className="custom-scrollbar mt-6 flex-1 overflow-y-auto pr-3 min-[850px]:mt-10">
        <div className="mb-6">
          {!isCollapsed && (
            <Skeleton className="mb-5 h-4 w-24" />
          )}
          <SidebarMenuSkeleton isCollapsed={isCollapsed} />
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { setIsOpen, isOpen, isMobile, toggleSidebar, isCollapsed } = useSidebarContext();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Simulate initial loading for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const toggleExpanded = useCallback((title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? [] : [title]));
  }, []);

  useEffect(() => {
    // Keep collapsible open, when it's subpage is active
    NAV_DATA.some((section) => {
      return section.items.some((item) => {
        if (item.url === pathname) {
          return true;
        }
      });
    });
  }, [pathname, toggleExpanded]);

  // Show skeleton during loading
  const showSkeleton = isInitialLoading;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "overflow-hidden border-r border-gray-200 bg-white shadow-lg transition-all duration-200 ease-linear dark:border-gray-800 dark:bg-gray-dark dark:shadow-gray-900/20",
          isMobile 
            ? "fixed bottom-0 top-0 z-50" 
            : "sticky top-0 h-screen",
          isMobile 
            ? isOpen ? "w-full max-w-[290px]" : "w-0" 
            : isCollapsed ? "w-[80px]" : "w-[290px]"
        )}
        aria-label="Main navigation"
        aria-hidden={isMobile && !isOpen}
        inert={isMobile && !isOpen}
      >
        {showSkeleton ? (
          <SidebarSkeleton isCollapsed={isCollapsed} isMobile={isMobile} />
        ) : (
          <div className="flex h-full flex-col py-10 pl-[14px] pr-[7px]">
            <div className="relative pr-4.5">
              <Link
                href={"/"}
                onClick={() => isMobile && toggleSidebar()}
                className="px-0 py-2.5 min-[850px]:py-0"
              >
                {isCollapsed && !isMobile ? (
                  <div className="flex items-center justify-center">
                    <Image
                      src="/images/logo/logo-icon.svg"
                      alt="Small Logo" 
                      width={40} 
                      height={40}
                      className="w-10 h-10"
                    />
                  </div>
                ) : (
                  <Logo width={220} height={60} />
                )}
              </Link>

              {isMobile && (
                <button
                  onClick={toggleSidebar}
                  className="absolute left-3/4 right-4.5 top-1/2 -translate-y-1/2 text-right"
                >
                  <span className="sr-only">Close Menu</span>
                  <ArrowLeftIcon className="ml-[40px] size-7" />
                </button>
              )}
            </div>

            {/* Navigation */}
            <div className="custom-scrollbar mt-6 flex-1 overflow-y-auto pr-3 min-[850px]:mt-10">
              {NAV_DATA.map((section) => (
                <div key={section.label} className="mb-6">
                  {!isCollapsed && (
                    <h2 className="mb-5 text-sm font-medium text-dark-4 dark:text-dark-6">
                      {section.label}
                    </h2>
                  )}

                  <nav role="navigation" aria-label={section.label}>
                    <ul className="space-y-2">
                      {section.items.map((item) => (
                        <li key={item.title}>
                          {/* Handle regular menu items (no sub-items) */}
                          {isCollapsed ? (
                            <Link
                              href={item.url || ""}
                              onClick={() => isMobile && toggleSidebar()}
                              className={cn(
                                "flex items-center justify-center rounded-lg p-3 transition-all duration-200",
                                pathname === item.url
                                  ? "bg-[rgba(87,80,241,0.07)] text-primary dark:bg-[#FFFFFF1A] dark:text-white"
                                  : "text-dark-4 hover:bg-gray-100 hover:text-dark dark:text-dark-6 hover:dark:bg-[#FFFFFF1A] hover:dark:text-white"
                              )}
                              title={item.title}
                            >
                              <item.icon
                                className="size-6 shrink-0"
                                aria-hidden="true"
                              />
                            </Link>
                          ) : (
                            <MenuItem
                              className="flex items-center gap-3 py-3"
                              as="link"
                              href={item.url || ""}
                              isActive={pathname === item.url}
                            >
                              <item.icon
                                className="size-6 shrink-0"
                                aria-hidden="true"
                              />
                              <span>{item.title}</span>
                            </MenuItem>
                          )}
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
