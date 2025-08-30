"use client";

import { useState } from "react";
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
  "pending-order": {
    title: "Pending Order",
    color: " border-yellow-200",
    items: [
      { id: "1", orderId: "ORD-1001", date: "2025-08-30" },
      { id: "2", orderId: "ORD-1002", date: "2025-08-29" },
      { id: "3", orderId: "ORD-1003", date: "2025-08-28" },
    ],
  },
  "factory-process": {
    title: "Factory Process",
    color: "bg-blue-50 border-blue-200",
    items: [
      { id: "4", orderId: "ORD-1004", date: "2025-08-27" },
      { id: "5", orderId: "ORD-1005", date: "2025-08-26" },
    ],
  },
  "video-confirmation": { 
    title: "Video Confirmation", 
    color: "bg-purple-50 border-purple-200",
    items: [
      { id: "6", orderId: "ORD-1006", date: "2025-08-25" },
    ] 
  },
  "dispatch": { 
    title: "Dispatch", 
    color: "bg-orange-50 border-orange-200",
    items: [
      { id: "7", orderId: "ORD-1007", date: "2025-08-24" },
    ] 
  },
  "updated-tracking": { 
    title: "Updated Tracking ID", 
    color: "bg-indigo-50 border-indigo-200",
    items: [
      { id: "8", orderId: "ORD-1008", date: "2025-08-23" },
    ] 
  },
  "delivery-confirmation": { 
    title: "Delivery Confirmation", 
    color: "bg-green-50 border-green-200",
    items: [
      { id: "9", orderId: "ORD-1009", date: "2025-08-22" },
    ] 
  },
  "review": { 
    title: "Review", 
    color: "bg-pink-50 border-pink-200",
    items: [
      { id: "10", orderId: "ORD-1010", date: "2025-08-21" },
    ] 
  },
  "done": { 
    title: "Done", 
    color: "bg-gray-50 border-gray-200",
    items: [
      { id: "11", orderId: "ORD-1011", date: "2025-08-20" },
      { id: "12", orderId: "ORD-1012", date: "2025-08-19" },
    ] 
  },
};

// 🔹 Sortable Card Component - Simplified with only Order ID and Date
function SortableItem({ id, orderId, date }: OrderItem) {
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
      className="bg-white border border-gray-200 p-2 rounded-xl shadow-sm mb-3 cursor-move hover:shadow-lg transition-all duration-200 hover:scale-105 hover:border-blue-300"
    >
      <div className="text-left">
        <p className="text-sm font-bold text-gray-800 mb-1">{orderId}</p>
        <p className="text-xs text-gray-600">{date}</p>
      </div>
    </div>
  );
}

export default function OrderManagementPage() {
  const [columns, setColumns] = useState<ColumnsData>(initialData);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const [activeCol, activeItem] = findColumn(active.id);
    const [overCol] = findColumn(over.id);

    if (activeCol && overCol) {
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
        // Move between columns
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

  return (
    <div className="h-min-screen p-3 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Kanban Board */}
      <div className="max-w-8xl mx-auto ">
        <div className="flex gap-2 overflow-x-auto pb-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            {Object.entries(columns).map(([colId, col]) => (
              <div
                key={colId}
                className={`bg-white w-72 rounded-2xl shadow-lg border-2 ${col.color} flex flex-col min-h-[600px] `}
              >
                {/* Column Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-center mb-2">
                    <h2 className="text-lg font-semibold text-gray-700 text-xs">
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
          </DndContext>
        </div>
      </div>
    </div>
  );
} 