"use client";

import { useState ,Suspense} from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addSupplier } from "@/apiStore/api";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";

// Form validation schema
const supplierSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  contactNumber: z.string()
    .max(15, "Contact number cannot exceed 15 digits")
    .regex(/^[0-9]+$/, "Contact number must contain only numbers"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  advancePayment: z.number().min(0, "Advance payment cannot be negative").optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

export default function SupplierPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading Supplier...</div>}>
      <SupplierPageContent />
    </Suspense>
  );
}

function SupplierPageContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const isOrder = searchParams.get("isOrder") === "true";
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      firstName: name || "",
      lastName: "",
      companyName: "",
      contactNumber: "",
      address: "",
      advancePayment: undefined,
    },
  });

  const onSubmit = async (data: SupplierFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        contactNumber: data.contactNumber,
        company: data.companyName,
        advancePayment: data.advancePayment || 0,
      };
      const response = await addSupplier(payload);
      if(response.status === 200) {
        toast.success("Supplier created successfully!");
        if(isOrder) {
          router.push("/order");
        } else {
          router.push("/supplier/supplier-list");
        }
      }
      reset();
    } catch (error) {
      console.error("Error creating supplier:", error);
      alert("Error creating supplier. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-8xl">
      {/* Supplier Form */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:p-5 lg:p-6">
        <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
          Create New Supplier
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information Section */}
          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50 sm:p-6">
            <h3 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <div className="mr-3 h-6 w-6 rounded-full bg-blue-100 p-1 dark:bg-blue-900/30">
                <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              Supplier Information
            </h3>

            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  First Name <span className="text-red-500">*</span>  
                </label>
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                      placeholder="Enter first name"
                    />
                  )}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Name <span className="text-red-500">*</span>  
                </label>
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                      placeholder="Enter last name"
                    />
                  )}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 mt-2">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Company Name <span className="text-red-500">*</span>  
                </label>
                <Controller
                  name="companyName"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                      placeholder="Enter company name"
                    />
                  )}
                />
                {errors.companyName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.companyName.message}
                  </p>
                )}
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Contact Number <span className="text-red-500">*</span>  
                </label>
                <Controller
                  name="contactNumber"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="tel"
                      value={field.value || ""}
                      onChange={(e) => {
                        // Only allow numbers
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        field.onChange(value);
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                      placeholder="Enter contact number"
                      maxLength={15}
                    />
                  )}
                />
                {errors.contactNumber && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.contactNumber.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 mt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Advance Payment
                </label>
                <Controller
                  name="advancePayment"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">

                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                        onBlur={field.onBlur}
                        name={field.name}
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                        placeholder="Enter amount"
                      />
                    </div>
                  )}
                />
                {errors.advancePayment && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.advancePayment.message}
                  </p>
                )}
              </div>
              <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Address <span className="text-red-500">*</span>   
              </label>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={1}
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
          </div>
          <div className="rounded-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => reset()}
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
                    Creating Supplier...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 inline h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Supplier
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
} 