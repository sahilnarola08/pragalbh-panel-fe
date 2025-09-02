import React from "react";
import { createPortal } from "react-dom";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  title?: string;
  altText?: string;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title = "Image Preview",
  altText = "Image Preview"
}) => {
  if (!isOpen || !imageUrl) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 p-4"
      style={{
        zIndex: 2147483647,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl max-h-[80vh] overflow-hidden"
        style={{ zIndex: 2147483647 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image Container */}
        <div className="p-4 flex items-center justify-center">
          <img
            src={imageUrl}
            alt={altText}
            className="max-w-full max-h-[60vh] object-contain rounded-lg"
          />
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-center p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImagePreviewModal;
