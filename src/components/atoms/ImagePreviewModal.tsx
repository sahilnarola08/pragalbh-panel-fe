import React from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

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
          <h3 className=" md:text-lg  text-sm font-semibold ">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image Container */}
        <div className="p-4 flex items-center justify-center">
          <Image
            src={imageUrl}
            alt={altText}
            width={800}
            height={600}
            className="max-w-full max-h-[60vh] object-contain rounded-lg"
            style={{ width: 'auto', height: 'auto' }}
            unoptimized={true}
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImagePreviewModal;
