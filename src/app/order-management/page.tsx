"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import CheckListModel from "@/components/atoms/CheckListModel";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
  DragOverlay,
  DragStartEvent,
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

// Simple Movement Indicator - Shows source to destination
function MovementIndicator({ 
  sourceColumn, 
  destinationColumn, 
  draggedItem 
}: { 
  sourceColumn: string; 
  destinationColumn: string; 
  draggedItem: OrderItem | null;
}) {
  if (!draggedItem || sourceColumn === destinationColumn) return null;

  const sourceTitle = columnTitles[sourceColumn as keyof typeof columnTitles];
  const destTitle = columnTitles[destinationColumn as keyof typeof columnTitles];

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg border border-gray-700">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-blue-400 font-medium">{sourceTitle}</span>
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <span className="text-green-400 font-medium">{destTitle}</span>
        </div>
        <div className="text-xs text-gray-300 mt-1">
          Moving: <span className="font-semibold text-white">{draggedItem.orderId}</span>
        </div>
      </div>
    </div>
  );
}

// Enhanced Drop Zone Component with mobile support
function DropZone({ columnId, isOver, draggedItem }: { 
  columnId: string; 
  isOver: boolean; 
  draggedItem?: OrderItem | null;
}) {
  const { setNodeRef } = useDroppable({
    id: `drop-zone-${columnId}`,
  });

  const columnTitle = columnTitles[columnId as keyof typeof columnTitles];

  return (
    <div
      ref={setNodeRef}
      className={`w-full min-h-[100px] border-2 border-dashed rounded-xl p-4 transition-all duration-300 touch-manipulation ${
        isOver
          ? 'border-green-500 bg-green-100 scale-105 shadow-lg'
          : 'border-gray-300 bg-gray-50'
      }`}
    >
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          {isOver && draggedItem ? (
            <>
              <svg className="w-8 h-8 mx-auto mb-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <p className="text-sm font-medium text-green-600">
                Drop &quot; {draggedItem.orderId} &quot; here
              </p>
            </>
          ) : (
            <>
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p className="text-sm">Drop items here</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Enhanced Sortable Card Component with better mobile support
function SortableItem({ _id, orderId, orderDate, product, productImage, onClickItem }: OrderItem & { onClickItem?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: _id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  // Enhanced touch handling for mobile - Remove preventDefault to allow drag
  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't prevent default to allow drag to work
    (e.currentTarget as HTMLElement).dataset.touchStart = String(Date.now());
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchStartTime = Number((e.currentTarget as HTMLElement).dataset.touchStart);
    const touchEndTime = Date.now();
    
    // If touch duration is less than 150ms, treat as click
    if (touchEndTime - touchStartTime < 150) {
      onClickItem?.();
    }
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
      className={`bg-white border border-gray-200 p-2 rounded-xl shadow-sm mb-3 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 hover:border-blue-300 group relative touch-manipulation ${
        isDragging ? 'shadow-2xl border-blue-400 bg-blue-50' : ''
      }`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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

      {/* Tooltip for full product name - Hidden on mobile */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 hidden md:block">
        {product}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}

// Drag Overlay Component
function DragOverlayContent({ item }: { item: OrderItem }) {
  return (
    <div className="bg-white border-2 border-blue-400 p-2 rounded-xl shadow-2xl transform rotate-2 scale-105">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-800 mb-1 truncate">{item.orderId}</p>
          <p className="text-xs text-gray-600 mb-1">{new Date(item.orderDate).toLocaleDateString()}</p>
          <p className="text-xs text-gray-600 truncate">{item.product.slice(0, 20)}...</p>
        </div>
        <div className="flex-shrink-0">
          <Image
            src={item.productImage}
            alt={item.orderId}
            width={40}
            height={40}
            className="w-10 h-10 rounded-lg object-cover"
          />
        </div>
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
  const [draggedItem, setDraggedItem] = useState<OrderItem | null>(null);
  const [sourceColumn, setSourceColumn] = useState<string | null>(null);
  const [destinationColumn, setDestinationColumn] = useState<string | null>(null);

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

  // Enhanced sensors for mobile and desktop support - Fixed for mobile
  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100, // Reduced delay for better mobile experience
        tolerance: 5, // Reduced tolerance for easier activation
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Reduced distance for easier activation
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5, // Reduced distance for easier activation
      },
    })
  );

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

  const handleDragStart = (event: DragStartEvent) => {
    const [activeCol, item] = findColumn(event.active.id);
    if (item) {
      setDraggedItem(item);
      setSourceColumn(activeCol);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Clear all drag states
    setDraggedItem(null);
    setSourceColumn(null);
    setDestinationColumn(null);
    
    if (!over) return;

    const [activeCol, draggedItem] = findColumn(active.id);
    const [overCol] = findColumn(over.id);
    if (!activeCol || !overCol || !draggedItem) return;

    const sourceColumns = ["over_due", "stock", "pending"];

    // Gate only when moving into Factory Process from the 3 source columns
    if (overCol === "factory_process" && sourceColumns.includes(activeCol)) {
      const allChecked = (draggedItem.checklist ?? []).every(c => c.checked);
      if (allChecked) {
        // Optimistically update local state first
        moveItemBetweenColumns(draggedItem, activeCol, overCol);
        // Then call API
        updateStatusApiOptimistic(draggedItem._id, "factory_process");
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
      // Handle moving between different columns with optimistic update
      moveItemBetweenColumns(draggedItem, activeCol, overCol);
      updateStatusApiOptimistic(draggedItem._id, overCol);
    }
  };

  // Handle drag over to show destination
  const handleDragOver = (event: any) => {
    const { over } = event;
    if (over) {
      const [overCol] = findColumn(over.id);
      if (overCol) {
        setDestinationColumn(overCol);
      }
    }
  };

  // New function to handle optimistic updates between columns
  const moveItemBetweenColumns = (item: OrderItem, fromColumn: string, toColumn: string) => {
    setColumns(prevColumns => {
      const newColumns = { ...prevColumns };
      
      // Remove item from source column
      newColumns[fromColumn] = {
        ...newColumns[fromColumn],
        items: newColumns[fromColumn].items.filter(i => i._id !== item._id)
      };
      
      // Add item to target column
      newColumns[toColumn] = {
        ...newColumns[toColumn],
        items: [...newColumns[toColumn].items, item]
      };
      
      return newColumns;
    });
  };

  // Optimistic API update function
  const updateStatusApiOptimistic = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, { status: newStatus });
      // Optionally refetch to ensure data consistency
      // await fetchKanbanData();
    } catch (error) {
      console.error("Error updating status:", error);
      // On error, refetch data to revert optimistic update
      await fetchKanbanData();
    }
  };

  const handleCheckListSave = (checkedItems: ChecklistItem[]) => {
    const allChecked = checkedItems.every(c => c.checked);
    if (pendingDragItem && pendingDragSource && allChecked) {
      // Optimistically move the item
      moveItemBetweenColumns(pendingDragItem, pendingDragSource, "factory_process");
      // Then call API
      updateStatusApiOptimistic(pendingDragItem._id, "factory_process");
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
      
      {/* Movement Indicator - Shows at top */}
      {draggedItem && sourceColumn && destinationColumn && (
        <MovementIndicator 
          sourceColumn={sourceColumn}
          destinationColumn={destinationColumn}
          draggedItem={draggedItem}
        />
      )}
      
      {/* Kanban Board */}
      <div className="max-w-8xl mx-auto h-[calc(90vh-100px)] relative">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          {/* Enhanced scrollable container with better mobile support */}
          <div className="flex gap-2 md:gap-4 overflow-x-auto overflow-y-hidden pb-4 h-full scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 hover:scrollbar-thumb-gray-500 scrollbar-thumb-rounded-full scrollbar-track-rounded-full touch-pan-x">
            {kanbanOrder.map((colId) => {
              const col = columns[colId];
              if (!col) return null;
              
              const isSourceColumn = sourceColumn === colId;
              const isDestinationColumn = destinationColumn === colId;
              
              return (
                <div
                  key={colId}
                  className={`bg-white w-64 sm:w-72 md:w-74 lg:w-64 xl:w-56 rounded-2xl shadow-lg border-2 ${col.color} flex flex-col min-h-[600px] flex-shrink-0 transition-all duration-300 touch-manipulation ${
                    isSourceColumn ? 'ring-4 ring-blue-400 ring-opacity-60 bg-blue-50' : ''
                  } ${
                    isDestinationColumn ? 'ring-4 ring-green-400 ring-opacity-60 bg-green-50' : ''
                  }`}
                >
                  {/* Column Header */}
                  <div className="p-3 md:p-4 border-b border-gray-200">
                    <div className="flex items-center justify-center mb-2">
                      <h2 className="text-sm md:text-base font-semibold text-gray-700">
                        {col.title}
                      </h2>
                    </div>
                  </div>

                  {/* Column Content */}
                  <div className="flex-1 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {col.items.length > 0 ? (
                      <SortableContext
                        items={col.items.map((i) => i._id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {col.items.map((item) => (
                          <SortableItem key={item._id} {...item}
                          onClickItem={() => handleItemClick(item, colId)}
                           />
                        ))}
                      </SortableContext>
                    ) : (
                      <DropZone 
                        columnId={colId} 
                        isOver={isDestinationColumn} 
                        draggedItem={draggedItem}
                      />
                    )}

                    {/* Add Card Button */}
                    <button className="w-full border-2 border-dashed border-gray-300 rounded-xl p-2 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors hover:bg-blue-50 mt-2 touch-manipulation">
                      <div className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="text-xs md:text-sm">Add Order</span>
                      </div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Drag Overlay */}
          <DragOverlay>
            {draggedItem ? <DragOverlayContent item={draggedItem} /> : null}
          </DragOverlay>
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
