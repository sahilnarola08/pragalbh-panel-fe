"use client";

import React, { useState, useEffect } from 'react';
import { CheckIcon, XIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";

interface TrackingModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { trackingId: string; courierCompany: string }) => void;
  initialTrackingId?: string;
  initialCourierCompany?: string;
  loading?: boolean;
  trackingItem?: any;
  title?: string;
  maxHeight?: string;
  width?: string;
}

export default function TrackingModal({
  open,
  onClose,
  onSubmit,
  initialTrackingId = "",
  initialCourierCompany = "",
  loading = false,
  trackingItem,
  title = "Tracking Details",
  maxHeight = "max-h-[80vh]",
  width = "w-full max-w-lg"
}: TrackingModalProps) {
  const [trackingId, setTrackingId] = useState(initialTrackingId);
  const [courierCompany, setCourierCompany] = useState(initialCourierCompany);
  const [errors, setErrors] = useState<{ trackingId?: string; courierCompany?: string }>({});

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setTrackingId(initialTrackingId);
      setCourierCompany(initialCourierCompany);
      setErrors({});
    }
  }, [open, initialTrackingId, initialCourierCompany]);

  // Handle input changes
  const handleTrackingIdChange = (value: string) => {
    setTrackingId(value);
    if (errors.trackingId) {
      setErrors(prev => ({ ...prev, trackingId: undefined }));
    }
  };

  const handleCourierCompanyChange = (value: string) => {
    setCourierCompany(value);
    if (errors.courierCompany) {
      setErrors(prev => ({ ...prev, courierCompany: undefined }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: { trackingId?: string; courierCompany?: string } = {};
    
    if (!trackingId.trim()) {
      newErrors.trackingId = "Tracking ID is required";
    }
    
    if (!courierCompany.trim()) {
      newErrors.courierCompany = "Courier company is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (!validateForm()) return;
    
    onSubmit({ 
      trackingId: trackingId.trim(), 
      courierCompany: courierCompany.trim() 
    });
  };

  // Handle cancel
  const handleCancel = () => {
    onClose();
  };

  // Check if form is valid
  const isFormValid = trackingId.trim() && courierCompany.trim();

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  if (!open) return null;

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
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
              {trackingItem?.orderId && (
                <p className="text-sm text-gray-600">
                  Order ID: {trackingItem.orderId}
                </p>
              )}
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
          <div className="space-y-6">
            {/* Tracking ID Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Tracking ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter tracking ID"
                  value={trackingId}
                  onChange={(e) => handleTrackingIdChange(e.target.value)}
                  className={cn(
                    "w-full px-4 py-3 border rounded-lg transition-all duration-200",
                    "focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none",
                    "placeholder:text-gray-400 text-gray-900",
                    errors.trackingId 
                      ? "border-red-300 bg-red-50" 
                      : "border-gray-300 hover:border-gray-400"
                  )}
                  disabled={loading}
                />
                {trackingId && !errors.trackingId && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckIcon className="w-5 h-5 text-green-500" />
                  </div>
                )}
              </div>
              {errors.trackingId && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.trackingId}
                </p>
              )}
            </div>

            {/* Courier Company Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Courier Company <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter courier company name"
                  value={courierCompany}
                  onChange={(e) => handleCourierCompanyChange(e.target.value)}
                  className={cn(
                    "w-full px-4 py-3 border rounded-lg transition-all duration-200",
                    "focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none",
                    "placeholder:text-gray-400 text-gray-900",
                    errors.courierCompany 
                      ? "border-red-300 bg-red-50" 
                      : "border-gray-300 hover:border-gray-400"
                  )}
                  disabled={loading}
                />
                {courierCompany && !errors.courierCompany && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckIcon className="w-5 h-5 text-green-500" />
                  </div>
                )}
              </div>
              {errors.courierCompany && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.courierCompany}
                </p>
              )}
            </div>

            {/* Form Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isFormValid ? "bg-green-500" : "bg-gray-400"
                )} />
                <span>
                  {isFormValid ? "Ready to save" : "Complete all required fields"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            {loading && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin" />
                <span>Saving...</span>
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={!isFormValid || loading}
              className={cn(
                "px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                isFormValid && !loading
                  ? "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
            >
              {loading ? "Saving..." : "Save & Move"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
