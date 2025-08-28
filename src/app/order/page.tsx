"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
  
// Form validation schema
const orderSchema = z.object({
  clientName: z.string().min(2, "Client name must be at least 2 characters"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  product: z.string().min(1, "Please select a product"),
  productImage: z.any(),
  orderDate: z.date({
    message: "Order date is required",
  }),
  dispatchDate: z.date({
    message: "Dispatch date is required",
  }),
  sellingPrice: z.number().min(0.01, "Selling price must be greater than 0"),
  supplier: z.string().min(1, "Please select a supplier"),
  supplierPaymentStatus: z.string().min(1, "Please select payment status"),
});

type OrderFormData = z.infer<typeof orderSchema>;

// Mock data for dropdowns
const products = [
  "Laptop",
  "Smartphone",
  "Tablet",
  "Monitor",
  "Keyboard",
  "Mouse",
  "Headphones",
  "Speaker",
];

const suppliers = [
  "TechCorp Inc.",
  "Digital Solutions Ltd.",
  "Electronics Pro",
  "Smart Devices Co.",
  "Future Tech",
  "Innovation Labs",
];

const paymentStatuses = [
  "Pending",
  "Success",
  "Failed",
  "Processing",
  "Cancelled",
];

export default function OrderPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      clientName: "",
      address: "",
      product: "",
      orderDate: new Date(),
      dispatchDate: new Date(),
      sellingPrice: 0,
      supplier: "",
      supplierPaymentStatus: "",
    },
  });

  const watchedProduct = watch("product");

  const onSubmit = async (data: OrderFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Order data:", data);
      alert("Order created successfully!");
      reset();
      setUploadedImage(null);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Error creating order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mx-auto max-w-8xl ">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
          Order Management
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Create and manage your orders efficiently
        </p>
      </div>

      {/* Order Form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:p-8">
        <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
          Create New Order
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Client Information Section */}
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Client Information
              </h3>
              
              {/* Client Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Client Name *
                </label>
                <Controller
                  name="clientName"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                      placeholder="Enter client name"
                    />
                  )}
                />
                {errors.clientName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.clientName.message}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address *
                </label>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={3}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                      placeholder="Enter complete address"
                    />
                  )}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.address.message}
                  </p>
                )}
              </div>
            </div>

            {/* Product Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Product Information
              </h3>
              
              {/* Product Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Product *
                </label>
                <Controller
                  name="product"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                    >
                      <option value="">Select a product</option>
                      {products.map((product) => (
                        <option key={product} value={product}>
                          {product}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.product && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.product.message}
                  </p>
                )}
              </div>

              {/* Product Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Product Image
                </label>
                <div className="mt-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
                  />
                </div>
              </div>

              {/* Uploaded Image Preview */}
              {uploadedImage && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Uploaded Product Image:
                  </label>
                  <div className="relative inline-block">
                    <Image
                      width={100}
                      height={100}
                      src={uploadedImage} 
                      alt="Product preview"
                      className="h-32 w-32 rounded-lg object-cover border border-gray-300 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => setUploadedImage(null)}
                      className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Details Section */}
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Order Details
              </h3>
              
              {/* Order Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Order Date *
                </label>
                <Controller
                  name="orderDate"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                    />
                  )}
                />
                {errors.orderDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.orderDate.message}
                  </p>
                )}
              </div>

              {/* Dispatch Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dispatch Date *
                </label>
                <Controller
                  name="dispatchDate"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                    />
                  )}
                />
                {errors.dispatchDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.dispatchDate.message}
                  </p>
                )}
              </div>

              {/* Selling Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Selling Price *
                </label>
                <Controller
                  name="sellingPrice"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      step="0.01"
                      min="0"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                      placeholder="0.00"
                    />
                  )}
                />
                {errors.sellingPrice && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.sellingPrice.message}
                  </p>
                )}
              </div>
            </div>

            {/* Supplier Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Supplier Information
              </h3>
              
              {/* Supplier Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Supplier *
                </label>
                <Controller
                  name="supplier"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                    >
                      <option value="">Select a supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier} value={supplier}>
                          {supplier}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.supplier && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.supplier.message}
                  </p>
                )}
              </div>

              {/* Supplier Payment Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Supplier Payment Status *
                </label>
                <Controller
                  name="supplierPaymentStatus"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                    >
                      <option value="">Select payment status</option>
                      {paymentStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.supplierPaymentStatus && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.supplierPaymentStatus.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                reset();
                setUploadedImage(null);
              }}
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Reset Form
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating Order..." : "Create Order"}
            </button>
          </div>
        </form>
      </div>

      {/* Order Summary Preview */}
      {/* {watchedProduct && (
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Order Preview
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Product</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{watchedProduct}</p>
            </div>
            {uploadedImage && (
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Product Image</p>
                <img
                  src={uploadedImage}
                  alt="Product preview"
                  className="h-20 w-20 rounded-lg object-cover"
                />
              </div>
            )}
          </div>
        </div>
      )} */}
    </div>
  );
} 