import React, { useState, useEffect } from 'react';
import { CheckIcon, XIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";

// Define the checkbox item interface
interface CheckboxItem {
  id: string;
  label: string;
  checked: boolean;
  required?: boolean;
}

// Define the props interface for the modal
interface CheckListModelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  items?: CheckboxItem[];
  onSave?: (checkedItems: CheckboxItem[]) => void;
  onCancel?: () => void;
  showDateTime?: boolean;
  showRah?: boolean;
  maxHeight?: string;
  width?: string;
}

const CheckListModel: React.FC<CheckListModelProps> = ({
  isOpen,
  onClose,
  title = "Quality Check List",
  items,
  onSave,
  onCancel,
  showDateTime = true,
  showRah = true,
  maxHeight = "max-h-[80vh]",
  width = "w-full max-w-md"
}) => {
  // Default items if none provided
  const defaultItems: CheckboxItem[] = [
    { id: "diamonds", label: "Check Diamonds", checked: false, required: true },
    { id: "movements", label: "Check Movements", checked: false, required: true },
    { id: "crown", label: "Check Crown", checked: false, required: true },
    { id: "datetime", label: "Check Day Date Time", checked: false, required: false },
    { id: "rah", label: "Check RAH", checked: false, required: false },
  ];

  // Use provided items or default items, filtered based on props
  const [checkboxItems, setCheckboxItems] = useState<CheckboxItem[]>(() => {
    const baseItems = items || defaultItems;
    let filteredItems = baseItems;
    
    if (!showDateTime) {
      filteredItems = filteredItems.filter(item => item.id !== "datetime");
    }
    
    if (!showRah) {
      filteredItems = filteredItems.filter(item => item.id !== "rah");
    }
    
    return [...filteredItems];
  });

  // Reset items when modal opens
  useEffect(() => {
    if (isOpen) {
      const baseItems = items || defaultItems;
      let filteredItems = baseItems;
      
      if (!showDateTime) {
        filteredItems = filteredItems.filter(item => item.id !== "datetime");
      }
      
      if (!showRah) {
        filteredItems = filteredItems.filter(item => item.id !== "rah");
      }
      
      setCheckboxItems([...filteredItems]);
    }
  }, [isOpen, items, showDateTime, showRah]);

  // Handle checkbox toggle
  const handleCheckboxChange = (id: string) => {
    setCheckboxItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  // Handle save
  const handleSave = () => {
    if (onSave) {
      onSave(checkboxItems);
    }
    onClose();
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  // Check if all required items are checked
  const allRequiredChecked = checkboxItems
    .filter(item => item.required)
    .every(item => item.checked);

  // Get checked count
  const checkedCount = checkboxItems.filter(item => item.checked).length;
  const totalCount = checkboxItems.length;

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={cn(
        "relative bg-white rounded-2xl shadow-2xl border border-gray-200",
        width,
        maxHeight,
        "overflow-hidden"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
              <p className="text-sm text-gray-600">
                {checkedCount} of {totalCount} items completed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            {checkboxItems.map((item) => (
              <div key={item.id} className="flex items-center">
                <label className="flex items-center cursor-pointer group w-full">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleCheckboxChange(item.id)}
                      className="peer sr-only"
                    />
                    <div className={cn(
                      "mr-3 flex size-6 items-center justify-center rounded-lg border-2 transition-all duration-200",
                      "peer-checked:border-blue-500 peer-checked:bg-blue-500",
                      "border-gray-300 hover:border-blue-400",
                      "group-hover:shadow-md group-hover:scale-105"
                    )}>
                      <CheckIcon className={cn(
                        "hidden text-white transition-all duration-200",
                        "peer-checked:block peer-checked:scale-100",
                        "w-4 h-4"
                      )} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className={cn(
                      "text-sm font-medium transition-colors",
                      item.checked ? "text-gray-900 line-through" : "text-gray-700",
                      item.required && "font-semibold"
                    )}>
                      {item.label}
                    </span>
                    {item.required && (
                      <span className="ml-2 text-xs text-red-500 font-medium">Required</span>
                    )}
                  </div>
                </label>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round((checkedCount / totalCount) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(checkedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            {!allRequiredChecked && (
              <span className="text-xs text-red-500 font-medium">
                Complete required items
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={!allRequiredChecked}
              className={cn(
                "px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                allRequiredChecked
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
            >
              Save & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckListModel;
