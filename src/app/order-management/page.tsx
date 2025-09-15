"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import CheckListModel from "@/components/atoms/CheckListModel";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getKanbanBoard, updateOrderStatus } from "@/apiStore/api";

// Updated OrderItem to match the backend data structure
interface OrderItem {
  _id: string; // Using _id from MongoDB
  orderId: string;
  orderDate: string; // Using orderDate from the backend
  product: string; // Using product from the backend
  productImage: string;
  checklist?: ChecklistItem[];
}

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  required?: boolean;
}

interface ColumnData {
  title: string;
  color: string;
  items: OrderItem[];
}

interface ColumnsData {
  [key: string]: ColumnData;
}


const checklistTemplate: ChecklistItem[] = [
  { id: "diamonds", label: "Check Diamonds", checked: false, required: true },
  { id: "movements", label: "Check Movements", checked: false, required: true },
  { id: "crown", label: "Check Crown", checked: false, required: true },
  { id: "datetime", label: "Check Day Date Time", checked: false, required: true },
  { id: "rah", label: "Check RAH", checked: false, required: true },
];

const withChecklists = (data: ColumnsData): ColumnsData => {
  const target = new Set(["over_due", "stock", "pending"]);
  const result: ColumnsData = {};
  for (const key in data) {
    const col = data[key];
    const items = col.items.map((it) =>
      target.has(key)
        ? { ...it, checklist: it.checklist ?? checklistTemplate.map(c => ({ ...c })) }
        : it
    );
    result[key] = { ...col, items };
  }
  return result;
};

// Drop Zone Component for empty columns
function DropZone({ columnId }: { columnId: string }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `drop-zone-${columnId}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-full min-h-[100px] border-2 border-dashed rounded-xl p-4 transition-colors ${
        isOver
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-300 bg-gray-50'
      }`}
    >
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p className="text-sm">Drop items here</p>
        </div>
      </div>
    </div>
  );
}

//  Sortable Card Component - Enhanced with image, product name, and tooltip
function SortableItem({ _id, orderId, orderDate, product, productImage, onClickItem }: OrderItem & { onClickItem?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: _id }); // Use _id as the dnd-kit id
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // track mouse down/up to differentiate drag vs click
  const handleMouseDown = (e: React.MouseEvent) => {
    (e.currentTarget as HTMLElement).dataset.down = String(Date.now());
  };
  const handleMouseUp = (e: React.MouseEvent) => {
    const downTime = Number((e.currentTarget as HTMLElement).dataset.down);
    const upTime = Date.now();
    if (upTime - downTime < 200) {
      // treat as click if less than 200ms press
      onClickItem?.();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white border border-gray-200 p-2 rounded-xl shadow-sm mb-3 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 hover:border-blue-300 group relative"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-800 mb-1 truncate">{orderId}</p>
          <p className="text-xs text-gray-600 mb-1">{new Date(orderDate).toLocaleDateString()}</p>
          <p className="text-xs text-gray-600 truncate">{product.slice(0, 20)}...</p>
        </div>
        <div className="flex-shrink-0">
          <Image
            src={productImage}
            alt={orderId}
            width={40}
            height={40}
            className="w-10 h-10 rounded-lg object-cover"
          />
        </div>
      </div>

      {/* Tooltip for full product name */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        {product}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}

const columnTitles = {
  over_due: "Over Due",
  stock: "Stock",
  pending: "Pending Order",
  factory_process: "Factory Process",
  video_confirmation: "Video Confirmation",
  dispatch: "Dispatch",
  updated_tracking_id: "Updated Tracking ID",
  delivery_confirmation: "Delivery Confirmation",
  review: "Review",
  done: "Done",
};

const columnColors = {
  over_due: "bg-red-50 border-red-200",
  stock: "bg-green-50 border-green-200",
  pending: " border-yellow-200",
  factory_process: "bg-blue-50 border-blue-200",
  video_confirmation: "bg-purple-50 border-purple-200",
  dispatch: "bg-orange-50 border-orange-200",
  updated_tracking_id: "bg-indigo-50 border-indigo-200",
  delivery_confirmation: "bg-green-50 border-green-200",
  review: "bg-pink-50 border-pink-200",
  done: "bg-gray-50 border-gray-200",
};

// New array to define the fixed order of columns
const kanbanOrder = [
  'over_due',
  'stock',
  'pending',
  'factory_process',
  'video_confirmation',
  'dispatch',
  'updated_tracking_id',
  'delivery_confirmation',
  'review',
  'done'
];

// Enhanced Kanban Skeleton Component
function KanbanSkeleton() {
  return (
    <div className="h-[calc(90vh-100px)] md:p-3 p-2 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Skeleton */}
      <div className="mb-4">
        <Skeleton className="h-8 w-64 mx-auto md:mx-0" />
      </div>
      
      {/* Kanban Board Skeleton */}
      <div className="max-w-8xl mx-auto h-[calc(90vh-100px)]">
        <div className="flex gap-4 overflow-x-auto pb-4 h-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {kanbanOrder.map((colId) => (
            <div
              key={colId}
              className={`bg-white w-72 sm:w-74 lg:w-64 xl:w-56 rounded-2xl shadow-lg border-2 ${columnColors[colId as keyof typeof columnColors]} flex flex-col min-h-[600px] flex-shrink-0`}
            >
              {/* Column Header Skeleton */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-center mb-2">
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>

              {/* Column Content Skeleton */}
              <div className="flex-1 p-2">
                {/* Card Skeletons - Different amounts for different columns */}
                {Array.from({ length: colId === 'over_due' ? 2 : colId === 'stock' ? 3 : colId === 'pending' ? 4 : 2 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 p-2 rounded-xl shadow-sm mb-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <Skeleton className="h-3 w-20 mb-2" />
                        <Skeleton className="h-3 w-16 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <div className="flex-shrink-0">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add Card Button Skeleton */}
                <div className="w-full border-2 border-dashed border-gray-300 rounded-xl p-2 mt-2">
                  <div className="flex items-center justify-center">
                    <Skeleton className="h-4 w-4 mr-2" />
                    <Skeleton className="h-4 w-20" />
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

export default function OrderManagementPage() {
  const [columns, setColumns] = useState<ColumnsData>({});
  const [isClient, setIsClient] = useState(false);
  const [isCheckListModalOpen, setIsCheckListModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<OrderItem | null>(null);
  const [pendingDragItem, setPendingDragItem] = useState<OrderItem | null>(null);
  const [pendingDragSource, setPendingDragSource] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Enhanced function to fetch data from the API with skeleton loading
  const fetchKanbanData = async () => {
    setIsLoading(true);
    try {
      const data = await getKanbanBoard();
      const apiData = data.data;

      // Map API data to frontend structure
      const formattedData: ColumnsData = {};
      for (const status in apiData) {
        if (columnTitles[status as keyof typeof columnTitles]) {
          formattedData[status] = {
            title: columnTitles[status as keyof typeof columnTitles],
            color: columnColors[status as keyof typeof columnColors],
            items: apiData[status],
          };
        }
      }
      setColumns(withChecklists(formattedData));
    } catch (error) {
      console.error("Error fetching data:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    fetchKanbanData();
  }, []);

  const sensors = useSensors(useSensor(PointerSensor));

  const findColumn = (id: string | number): [string | null, OrderItem | null] => {
    const idStr = id.toString();

    // Check if it's a drop zone ID
    if (idStr.startsWith('drop-zone-')) {
      const columnId = idStr.replace('drop-zone-', '');
      return [columnId, null];
    }

    // Check for items in columns
    for (const key in columns) {
      const item = columns[key].items.find((i) => i._id === idStr); // Use _id here
      if (item) return [key, item];
    }
    return [null, null];
  };

  const updateStatusApi = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, { status: newStatus });
      // Re-fetch data to reflect the change
      await fetchKanbanData();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const [activeCol, draggedItem] = findColumn(active.id);
    const [overCol] = findColumn(over.id);
    if (!activeCol || !overCol || !draggedItem) return;

    const sourceColumns = ["over_due", "stock", "pending"];

    // Gate only when moving into Factory Process from the 3 source columns
    if (overCol === "factory_process" && sourceColumns.includes(activeCol)) {
      const allChecked = (draggedItem.checklist ?? []).every(c => c.checked);
      if (allChecked) {
        // allow move directly and call API
        updateStatusApi(draggedItem._id, "factory_process");
        return;
      } else {
        // open modal to complete checks, then move after save
        setPendingDragItem(draggedItem);
        setPendingDragSource(activeCol);
        setActiveItem(draggedItem);
        setIsCheckListModalOpen(true);
        return; // stop normal DnD flow
      }
    }

    // Handle reordering within the same column
    if (activeCol === overCol) {
      const items = [...columns[activeCol].items];
      const oldIndex = items.findIndex((i) => i._id === active.id);
      const newIndex = items.findIndex((i) => i._id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);

      setColumns({
        ...columns,
        [activeCol]: { ...columns[activeCol], items: newItems },
      });
    } else {
      // Handle moving between different columns
      updateStatusApi(draggedItem._id, overCol);
    }
  };

  const handleCheckListSave = (checkedItems: ChecklistItem[]) => {
    const allChecked = checkedItems.every(c => c.checked);
    if (pendingDragItem && pendingDragSource && allChecked) {
      updateStatusApi(pendingDragItem._id, "factory_process");
    }

    setColumns(prev => {
      let updated: ColumnsData = { ...prev };
      for (const key in updated) {
        updated[key] = {
          ...updated[key],
          items: updated[key].items.map(i =>
            activeItem && i._id === activeItem._id ? { ...i, checklist: checkedItems } : i
          ),
        };
      }
      return updated;
    });

    setPendingDragItem(null);
    setPendingDragSource(null);
    setActiveItem(null);
    setIsCheckListModalOpen(false);
  };

 const handleCheckListCancel = () => {
    setPendingDragItem(null);
    setPendingDragSource(null);
    setActiveItem(null);
    setIsCheckListModalOpen(false);
  };

  const clickable = new Set(["over_due", "stock", "pending"]);
  const handleItemClick = (item: OrderItem, colId: string) => {
    if (!clickable.has(colId)) return;
    setActiveItem(item);
    setIsCheckListModalOpen(true);
  };

  // Updated loading condition to use the enhanced skeleton
  if (!isClient || isLoading) {
    return <KanbanSkeleton />;
  }
  return (
    <div className="h-[calc(90vh-100px)] md:p-3 p-2 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 ">
      {/* Header */}
      <div className="mb-4">
        <h1 className="md:text-2xl text-xl font-semibold md:font-bold text-gray-800 text-center md:text-left">Order Management</h1>
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
            {kanbanOrder.map((colId) => {
              const col = columns[colId];
              if (!col) return null; // Ensure the column data exists before rendering
              return (
                <div
                  key={colId}
                  className={`bg-white w-72 sm:w-74  lg:w-64 xl:w-56 rounded-2xl shadow-lg border-2 ${col.color} flex flex-col min-h-[600px] flex-shrink-0`}
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
                    {col.items.length > 0 ? (
                      <SortableContext
                        items={col.items.map((i) => i._id)} // Use _id here
                        strategy={verticalListSortingStrategy}
                      >
                        {col.items.map((item) => (
                          <SortableItem key={item._id} {...item}
                          onClickItem={() => handleItemClick(item, colId)}
                           />
                        ))}
                      </SortableContext>
                    ) : (
                      <DropZone columnId={colId} />
                    )}

                    {/* Add Card Button */}
                    <button className="w-full border-2 border-dashed border-gray-300 rounded-xl p-2 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors hover:bg-blue-50 mt-2">
                      <div className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Order
                      </div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </DndContext>
      </div>
      {activeItem && (
        <CheckListModel
          isOpen={isCheckListModalOpen}
          onClose={() => setIsCheckListModalOpen(false)}
          title={`Quality Check List - ${activeItem.orderId}`}
          items={activeItem.checklist}
          onSave={handleCheckListSave}
          onCancel={handleCheckListCancel}
          showDateTime={true}
          showRah={true}
        />
      )}
    </div>
  );
}
