"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import CheckListModel from "@/components/atoms/CheckListModel";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface OrderItem {
  id: string;
  orderId: string;
  date: string;
  productName: string;
  image: string;
}

interface ColumnData {
  title: string;
  color: string;
  items: OrderItem[];
}

interface ColumnsData {
  [key: string]: ColumnData;
}

const initialData: ColumnsData = {
  "over-due": {
    title: "Over Due",
    color: "bg-red-50 border-red-200",
    items: [
      { id: "15", orderId: "ORD-10001", date: "2025-08-30", productName: "Diamond Engagement Ring", image: "/images/ring-image.png" },
      { id: "16", orderId: "ORD-10002", date: "2025-08-29", productName: "Gold Necklace Chain", image: "/images/ring-image.png" },
      { id: "17", orderId: "ORD-10003", date: "2025-08-28", productName: "Pearl Earrings Set", image: "/images/ring-image.png" },
    ],
  },
  "stock": {
    title: "Stock",
    color: "bg-green-50 border-green-200",
    items: [
      { id: "18", orderId: "ORD-10004", date: "2025-08-30", productName: "Diamond Engagement Ring", image: "/images/ring-image.png" },
      { id: "19", orderId: "ORD-10005", date: "2025-08-29", productName: "Gold Necklace Chain", image: "/images/ring-image.png" },
      { id: "20", orderId: "ORD-10006", date: "2025-08-28", productName: "Pearl Earrings Set", image: "/images/ring-image.png" },
    ],
  },
  "pending-order": {
    title: "Pending Order",
    color: " border-yellow-200",
    items: [
      { id: "", orderId: "ORD-1001", date: "2025-08-30", productName: "Diamond Engagement Ring", image: "/images/ring-image.png" },
      { id: "2", orderId: "ORD-1002", date: "2025-08-29", productName: "Gold Necklace Chain", image: "/images/ring-image.png" },
      { id: "3", orderId: "ORD-1003", date: "2025-08-28", productName: "Pearl Earrings Set", image: "/images/ring-image.png" },
    ],
  },
  "factory-process": {
    title: "Factory Process",
    color: "bg-blue-50 border-blue-200",
    items: [
      { id: "4", orderId: "ORD-1004", date: "2025-08-27", productName: "Sapphire Bracelet", image: "/images/ring-image.png" },
      { id: "5", orderId: "ORD-1005", date: "2025-08-26", productName: "Ruby Pendant", image: "/images/ring-image.png" },
    ],
  },
  "video-confirmation": { 
    title: "Video Confirmation", 
    color: "bg-purple-50 border-purple-200",
    items: [
      { id: "6", orderId: "ORD-1006", date: "2025-08-25", productName: "Emerald Ring", image: "/images/ring-image.png" },
    ] 
  },
  "dispatch": { 
    title: "Dispatch", 
    color: "bg-orange-50 border-orange-200",
    items: [
      { id: "7", orderId: "ORD-1007", date: "2025-08-24", productName: "Silver Anklet", image: "/images/ring-image.png" },
    ] 
  },
  "updated-tracking": { 
    title: "Updated Tracking ID", 
    color: "bg-indigo-50 border-indigo-200",
    items: [
      { id: "8", orderId: "ORD-1008", date: "2025-08-23", productName: "Platinum Wedding Band", image: "/images/ring-image.png" },
    ] 
  },
  "delivery-confirmation": { 
    title: "Delivery Confirmation", 
    color: "bg-green-50 border-green-200",
    items: [
      { id: "9", orderId: "ORD-1009", date: "2025-08-22", productName: "Diamond Tennis Bracelet", image: "/images/ring-image.png" },
    ] 
  },
  "review": { 
    title: "Review", 
    color: "bg-pink-50 border-pink-200",
    items: [
      { id: "10", orderId: "ORD-1010", date: "2025-08-21", productName: "Gold Bangle Set", image: "/images/ring-image.png" },
    ] 
  },
  "done": { 
    title: "Done", 
    color: "bg-gray-50 border-gray-200",
    items: [
      { id: "11", orderId: "ORD-1011", date: "2025-08-20", productName: "Pearl Necklace", image: "/images/ring-image.png" },
      { id: "12", orderId: "ORD-1012", date: "2025-08-19", productName: "Silver Ring", image: "/images/ring-image.png" },
    ] 
  },
};

// 🔹 Sortable Card Component - Enhanced with image, product name, and tooltip
function SortableItem({ id, orderId, date, productName, image }: OrderItem) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white border border-gray-200 p-2 rounded-xl shadow-sm mb-3 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 hover:border-blue-300 group relative"
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-800 mb-1 truncate">{orderId}</p>
          <p className="text-xs text-gray-600 mb-1">{date}</p>
          <p className="text-xs text-gray-600 truncate">{productName.slice(0, 20)}...</p>
        </div>
        <div className="flex-shrink-0">
          <Image 
            src={image} 
            alt={orderId} 
            width={40} 
            height={40} 
            className="w-10 h-10 rounded-lg object-cover" 
          />
        </div>
      </div>
      
      {/* Tooltip for full product name */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        {productName}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}

export default function OrderManagementPage() {
  const [columns, setColumns] = useState<ColumnsData>(initialData);
  const [isClient, setIsClient] = useState(false);
  const [isCheckListModalOpen, setIsCheckListModalOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const [activeCol, activeItem] = findColumn(active.id);
    const [overCol] = findColumn(over.id);

    if (activeCol && overCol && activeItem) {
      // Check if dragging to factory-process from specific columns
      const sourceColumns = ["over-due", "stock", "pending-order"];
      
      if (overCol === "factory-process" && sourceColumns.includes(activeCol)) {
        // Store pending drag info and open checklist modal
        setPendingDragItem(activeItem);
        setPendingDragSource(activeCol);
        setIsCheckListModalOpen(true);
        return; // Don't complete the drag yet
      }

      if (activeCol === overCol) {
        // Move inside same column
        const items = [...columns[activeCol].items];
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        setColumns({
          ...columns,
          [activeCol]: { ...columns[activeCol], items: newItems },
        });
      } else {
        // Move between columns (normal case)
        const sourceItems = [...columns[activeCol].items];
        const destItems = [...columns[overCol].items];
        const movingItem = sourceItems.find((i) => i.id === active.id);

        if (movingItem) {
          setColumns({
            ...columns,
            [activeCol]: {
              ...columns[activeCol],
              items: sourceItems.filter((i) => i.id !== active.id),
            },
            [overCol]: { ...columns[overCol], items: [...destItems, movingItem] },
          });
        }
      }
    }
  };

  const findColumn = (id: string | number): [string | null, OrderItem | null] => {
    const idStr = id.toString();
    for (const key in columns) {
      const item = columns[key].items.find((i) => i.id === idStr);
      if (item) return [key, item];
    }
    return [null, null];
  };

  const getTotalOrders = (): number => {
    return Object.values(columns).reduce((total, col) => total + col.items.length, 0);
  };

  // CheckList Modal handlers
  const [pendingDragItem, setPendingDragItem] = useState<OrderItem | null>(null);
  const [pendingDragSource, setPendingDragSource] = useState<string | null>(null);

  const handleCheckListSave = (checkedItems: any[]) => {
    console.log("CheckList saved:", checkedItems);
    
    // Complete the drag operation if checklist is passed
    if (pendingDragItem && pendingDragSource) {
      const sourceItems = [...columns[pendingDragSource].items];
      const destItems = [...columns["factory-process"].items];
      
      setColumns({
        ...columns,
        [pendingDragSource]: {
          ...columns[pendingDragSource],
          items: sourceItems.filter((i) => i.id !== pendingDragItem.id),
        },
        ["factory-process"]: { ...columns["factory-process"], items: [...destItems, pendingDragItem] },
      });
      
      // Reset pending drag state
      setPendingDragItem(null);
      setPendingDragSource(null);
    }
  };

  const handleCheckListCancel = () => {
    console.log("CheckList cancelled");
    // Reset pending drag state
    setPendingDragItem(null);
    setPendingDragSource(null);
  };

  // Show loading state until client-side is ready to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="h-100 p-3 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 w-full   ">
        <div className="max-w-8xl mx-auto ">
          <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {Object.entries(initialData).map(([colId, col]) => (
              <div
                key={colId}
                className={`bg-white w-80 sm:w-80 md:w-80 lg:w-64 xl:w-56 rounded-2xl shadow-lg border-2 ${col.color} flex flex-col min-h-[600px] scroll-hidden`}
              >
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-center mb-2">
                    <h2 className="text-base font-semibold text-gray-700">
                      {col.title}
                    </h2>
                  </div>
                </div>
                <div className="flex-1 p-2">
                  {col.items.map((item) => (
                    <div key={item.id} className="bg-white border border-gray-200 p-3 rounded-xl shadow-sm mb-3 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="w-full border-2 border-dashed border-gray-300 rounded-xl p-2 text-gray-500">
                    <div className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Order
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(90vh-100px)] p-3 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
      </div>

      {/* Kanban Board */}
      <div className="max-w-8xl mx-auto h-[calc(90vh-100px)]">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {/* All columns in a single scrollable row */}
          <div className="flex gap-4 overflow-x-auto pb-4 h-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100  ">  
            {Object.entries(columns).map(([colId, col]) => (
              <div
                key={colId}
                className={`bg-white w-80 sm:w-80 md:w-80 lg:w-64 xl:w-56 rounded-2xl shadow-lg border-2 ${col.color} flex flex-col min-h-[600px] flex-shrink-0`}
              >
                {/* Column Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-center mb-2">
                    <h2 className="text-base font-semibold text-gray-700">
                      {col.title}
                    </h2>
                  </div>
                </div>

                {/* Column Content */}
                <div className="flex-1 p-2">
                  <SortableContext
                    items={col.items.map((i) => i.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {col.items.map((item) => (
                      <SortableItem key={item.id} {...item} />
                    ))}
                  </SortableContext>
                  
                  {/* Add Card Button */}
                  <button className="w-full border-2 border-dashed border-gray-300 rounded-xl p-2 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors hover:bg-blue-50">
                    <div className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Order
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </DndContext>
      </div>

      {/* CheckList Modal */}
      <CheckListModel
        isOpen={isCheckListModalOpen}
        onClose={() => setIsCheckListModalOpen(false)}
        title="Quality Check List"
        onSave={handleCheckListSave}
        onCancel={handleCheckListCancel}
        showDateTime={true}
        showRah={true}
      />
    </div>
  );
} 