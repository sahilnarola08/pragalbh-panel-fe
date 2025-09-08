"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import ImagePreviewModal from "@/components/atoms/ImagePreviewModal";
import { addProduct } from "@/apiStore/api";
import { toast } from "react-toastify";

// Form validation schema
const productSchema = z.object({
  category: z.string().min(1, "Please select a category"),
  productName: z.string().min(2, "Product name must be at least 2 characters"),
});

type ProductFormData = z.infer<typeof productSchema>;

// Mock data for dropdowns
const categories = [
  "Electronics",
  "Clothing & Fashion",
  "Home & Garden",
  "Sports & Outdoors",
  "Books & Media",
  "Automotive",
  "Health & Beauty",
  "Toys & Games",
  "Food & Beverages",
  "Jewelry & Accessories",
  "Tools & Hardware",
  "Pet Supplies",
  "Office Supplies",
  "Baby Products",
  "Other",
];

export default function ProductPage() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      category: "",
      productName: "",
    },
  });

  const watchedCategory = watch("category");

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      // Transform form data to match API payload
      const payload = {
        category: data.category,
        productName: data.productName,
      };

      await addProduct(payload);
      toast.success("Product created successfully!");
      
      // Reset form and images
      reset();
      setUploadedImages([]);
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Error creating product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Check if we can add more images (max 5) - Images are optional
    const maxImages = 5;
    const currentCount = uploadedImages.length;
    const canAdd = maxImages - currentCount;

    if (canAdd <= 0) {
      toast.warning('Maximum 5 images already uploaded!');
      return;
    }

    // Convert files to array and limit to what we can add
    const fileArray = Array.from(files);
    const filesToAdd = fileArray.slice(0, canAdd);

    // Process each file
    const promises = filesToAdd.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          resolve(result);
        };
        reader.readAsDataURL(file);
      });
    });

    // Wait for all files to process, then update state
    Promise.all(promises).then((newImageUrls) => {
      setUploadedImages(prev => [...prev, ...newImageUrls]);
      // Clear the input so user can select more files if needed
      event.target.value = '';
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  return (
    <div className="mx-auto max-w-8xl">
      {/* Product Form */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:p-6 lg:p-8">
        <h2 className="mb-6 text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white text-center px-2 sm:px-0">
          Create New Product
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <div className="rounded-xl bg-gray-50 md:p-4 p-2 dark:bg-gray-700/50">
            <h3 className="mb-6 text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center px-2 sm:px-0">
              <div className="mr-3 h-6 w-6 rounded-full bg-blue-100 p-1 dark:bg-blue-900/30">
                <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              Product Information
            </h3>

            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category *
                </label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Product Name *
                </label>
                <Controller
                  name="productName"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                      placeholder="Enter product name"
                    />
                  )}
                />
                {errors.productName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.productName.message}
                  </p>
                )}
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className=" mt-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Images 
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={uploadedImages.length >= 5}
                    className=" w-50 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-900/50"
                  >
                    Choose Files
                  </button>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {uploadedImages.length}/5 images uploaded
                  </span>
                </div>
              </div>

              <input
                id="file-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploadedImages.length >= 5}
                className="hidden"
              />

              {/* Uploaded Images Preview */}
              {uploadedImages.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Uploaded Product Images:
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <Image
                          width={120}
                          height={120}
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="h-24 w-24 rounded-lg object-cover border border-gray-300 dark:border-gray-600 shadow-md cursor-pointer hover:scale-110 hover:shadow-lg transition-all duration-200"
                          onClick={() => {
                            setPreviewImage(image);
                            setShowPreview(true);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-lg transition-all duration-200"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Form Actions */}
          <div className="rounded-xl p-4 dark:from-blue-900/20 dark:to-purple-900/20">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  reset();
                  setUploadedImages([]);
                }}
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                <svg className="mr-2 inline h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Form
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-102"
              >
                {isSubmitting ? (
                  <>
                    <svg className="mr-2 inline h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Product...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 inline h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Product
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false);
          setPreviewImage(null);
        }}
        imageUrl={previewImage}
        title="Product Image Preview"
        altText="Product Preview"
      />
    </div>
  );
} 