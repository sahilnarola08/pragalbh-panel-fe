"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { addOrder, getCustomerList, getProductList, getSupplierList } from "@/apiStore/api";
import { toast } from "react-toastify";
import ImagePreviewModal from "@/components/atoms/ImagePreviewModal";

// Customer interface based on API response
interface Customer {
  id: string;
  fullName: string;
  email: string;
  contactNumber: string;
  address: string;
}

// Product interface based on API response
interface Product {
  _id: string;
  productName: string;
  category: string;
}

// Add Supplier interface after Product interface (around line 27)
interface Supplier {
  _id: string;
  fullName: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  firstName: string;
  lastName: string;
}

// Form validation schema
const orderSchema = z.object({
  clientName: z.string().min(2, "Client name must be at least 2 characters"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  product: z.string().min(1, "Please select a product"),
  orderDate: z.date({
    message: "Order date is required",
  }),
  dispatchDate: z.date({
    message: "Dispatch date is required",
  }),
  purchasePrice: z.union([
    z.number().min(0.01, "Purchase price must be greater than 0"),
    z.string().refine((val) => val === "", "Please enter a valid number")
  ]).refine((val) => {
    if (typeof val === "string") return val === "";
    return val > 0;
  }, "Purchase price must be greater than 0"),
  sellingPrice: z.union([
    z.number().min(0.01, "Selling price must be greater than 0"),
    z.string().refine((val) => val === "", "Please enter a valid number")
  ]).refine((val) => {
    if (typeof val === "string") return val === "";
    return val > 0;
  }, "Selling price must be greater than 0"),
  supplier: z.string().optional(),
  orderPlatform: z.string().min(1, "Please select order platform"),
  otherDetails: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

const orderPlatforms = [
  "Amazon",
  "eBay",
  "Shopify",
  "WooCommerce",
  "Magento",
  "Custom Website",
  "Direct Sale",
  "Other",
];

export default function OrderPage() {
  const router = useRouter();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOtherDetailsOpen, setIsOtherDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [clients, setClients] = useState<Customer[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  
  // Product related state
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  
  // Product search state variables
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [debouncedProductSearchQuery, setDebouncedProductSearchQuery] = useState("");
  // Add supplier state variables after product search state (around line 101)
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
  const [supplierSearchQuery, setSupplierSearchQuery] = useState("");
  const [showSupplierSuggestions, setShowSupplierSuggestions] = useState(false);
  const [debouncedSupplierSearchQuery, setDebouncedSupplierSearchQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Debounce product search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedProductSearchQuery(productSearchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [productSearchQuery]);

  // Add supplier search debouncing (after product search debouncing)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSupplierSearchQuery(supplierSearchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [supplierSearchQuery]);

  // Fetch clients from API with search parameters
  const fetchClients = useCallback(async (searchTerm: string = "") => {
    try {
      setIsLoadingClients(true);
      const params = searchTerm ? { search: searchTerm } : {};
      const response = await getCustomerList(params);
      
      if (response && response.data && response.data.users) {
        setClients(response.data.users);
      } else {
        setClients([]);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      setClients([]);
    } finally {
      setIsLoadingClients(false);
    }
  }, []);

  // Update the fetchProducts function to accept search parameters (around line 140)
  const fetchProducts = useCallback(async (searchTerm: string = "") => {
    try {
      setIsLoadingProducts(true);
      const params = searchTerm ? { search: searchTerm } : {};
      const response = await getProductList(params);
      
      if (response && response.data && response.data.products) {
        setProducts(response.data.products);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      toast.error("Error loading products. Please try again.");
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  // Add fetchSuppliers function (after fetchProducts)
  const fetchSuppliers = useCallback(async (searchTerm: string = "") => {
    try {
      setIsLoadingSuppliers(true);
      const params = searchTerm ? { search: searchTerm } : {};
      const response = await getSupplierList(params);
      
      if (response && response.data ) {
        setSuppliers(response.data.suppliers);
      } else {
        setSuppliers([]);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      setSuppliers([]);
      toast.error("Error loading suppliers. Please try again.");
    } finally {
      setIsLoadingSuppliers(false);
    }
  }, []);

  // Initial load and search with debounced query
  useEffect(() => {
    fetchClients(debouncedSearchQuery);
  }, [debouncedSearchQuery, fetchClients]);

  // Add useEffect to fetch products with search (after the existing useEffect for products)
  useEffect(() => {
    fetchProducts(debouncedProductSearchQuery);
  }, [debouncedProductSearchQuery, fetchProducts]);

  // Add useEffect to fetch suppliers with search
  useEffect(() => {
    fetchSuppliers(debouncedSupplierSearchQuery);
  }, [debouncedSupplierSearchQuery, fetchSuppliers]);

  // Filter clients based on search query (client-side filtering as backup)
  const filteredClients = clients.filter(client =>
    client.fullName && client.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Click outside handler to close suggestions
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const productSuggestionsRef = useRef<HTMLDivElement>(null);
  // Add supplier suggestions ref
  const supplierSuggestionsRef = useRef<HTMLDivElement>(null);

  // Update click outside handler to include supplier suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (productSuggestionsRef.current && !productSuggestionsRef.current.contains(event.target as Node)) {
        setShowProductSuggestions(false);
      }
      if (supplierSuggestionsRef.current && !supplierSuggestionsRef.current.contains(event.target as Node)) {
        setShowSupplierSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
      purchasePrice: 0,
      sellingPrice: 0,
      supplier: "",
      orderPlatform: "",
      otherDetails: "",
    },
  });

  const watchedProduct = watch("product");

  const onSubmit = async (data: OrderFormData) => {
    setIsSubmitting(true);
    
    try {
      // Directly create order without client validation
      const payload = {
        clientName: data.clientName,
        address: data.address,
        product: data.product,
        orderDate: data.orderDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
        dispatchDate: data.dispatchDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
        purchasePrice: data.purchasePrice,
        sellingPrice: data.sellingPrice,
        supplier: data.supplier || "", // Handle optional supplier
        orderPlatform: data.orderPlatform,
        otherDetails: data.otherDetails || "", // Handle optional other details
      };

      await addOrder(payload);
      toast.success("Order created successfully!");

      // Reset form and images
      reset();
      setUploadedImages([]);
      setIsOtherDetailsOpen(false);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Error creating order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Check if we can add more images (max 5) - Images are now optional
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
    <div className="mx-auto max-w-8xl ">
      {/* Order Form */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:p-6 lg:p-8">
        <h2 className="mb-6 text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white text-center px-2 sm:px-0">
          Create New Order
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Client Information Section */}
          <div className="rounded-xl bg-gray-50 md:p-6 p-2  dark:bg-gray-700/50">
            <h3 className="mb-6 text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center px-2 sm:px-0">
              <div className="mr-3 h-6 w-6 rounded-full bg-blue-100 p-1 dark:bg-blue-900/30">
                <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              Client Information
            </h3>

            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
              {/* Client Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Client Name *
                </label>
                <Controller
                  name="clientName"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <input
                          {...field}
                          type="text"
                          className="mt-1 block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                          placeholder="Search or enter client name"
                          onChange={(e) => {
                            field.onChange(e);
                            setSearchQuery(e.target.value);
                            setShowSuggestions(true);
                          }}
                          onFocus={() => setShowSuggestions(true)}
                        />
                      </div>

                      {/* Loading indicator */}
                      {isLoadingClients && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      )}

                      {/* Suggestions Dropdown */}
                      {showSuggestions && (field.value || searchQuery) && !isLoadingClients && (
                        <div ref={suggestionsRef} className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 max-h-60 overflow-auto">
                          {/* Existing clients */}
                          {filteredClients.length > 0 ? (
                            filteredClients.map((client) => (
                              <div
                                key={client.id}
                                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm text-gray-700 dark:text-gray-300"
                                onClick={() => {
                                  field.onChange(client.fullName);
                                  setShowSuggestions(false);
                                  setSearchQuery('');
                                }}
                              >
                                {client.fullName}
                              </div>
                            ))
                          ) : (
                            <>
                            <div 
                              onClick={() => {
                                const clientName = field.value || searchQuery;
                                router.push(`/customer/add-customer?name=${encodeURIComponent(clientName)}&isOrder=true`);
                              }}
                              className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                              Add &apos;{field.value || searchQuery}&apos; 
                            </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
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
                  Delivery Address *
                </label>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={1}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                      placeholder="Enter complete delivery address"
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

          {/* Product Information Section */}
          <div className="rounded-xl bg-gray-50 md:p-6 p-2 dark:bg-gray-700/50">
            <h3 className="mb-6 text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center px-2 sm:px-0">
              <div className="mr-3 h-6 w-6 rounded-full bg-green-100 p-1 dark:bg-green-900/30">
                <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              Product Information
            </h3>

            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 mt-2">
              {/* Product Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Product *
                </label>
                <Controller
                  name="product"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <input
                          {...field}
                          type="text"
                          className="mt-1 block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                          placeholder="Search or enter product name"
                          onChange={(e) => {
                            field.onChange(e);
                            setProductSearchQuery(e.target.value);
                            setShowProductSuggestions(true);
                          }}
                          onFocus={() => setShowProductSuggestions(true)}
                        />
                      </div>

                      {/* Loading indicator */}
                      {isLoadingProducts && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      )}

                      {/* Product Suggestions Dropdown */}
                      {showProductSuggestions && (field.value || productSearchQuery) && !isLoadingProducts && (
                        <div ref={productSuggestionsRef} className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 max-h-60 overflow-auto">
                          {/* Existing products */}
                          {products.length > 0 ? (
                            products.map((product) => (
                              <div
                                key={product._id}
                                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm text-gray-700 dark:text-gray-300"
                                onClick={() => {
                                  field.onChange(product.productName);
                                  setShowProductSuggestions(false);
                                  setProductSearchQuery('');
                                }}
                              >
                                {product.productName} ({product.category})
                              </div>
                            ))
                          ) : (
                            <div 
                              onClick={() => {
                                const productName = field.value || productSearchQuery;
                                router.push(`/product/add-product?name=${encodeURIComponent(productName)}&isOrder=true`);
                              }}
                              className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                              Add &apos;{field.value || productSearchQuery}&apos; 
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                />
                {errors.product && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.product.message}
                  </p>
                )}
              </div>

              {/* Order Platform */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Order Platform *
                </label>
                <Controller
                  name="orderPlatform"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                    >
                      <option value="">Select order platform</option>
                      {orderPlatforms.map((platform) => (
                        <option key={platform} value={platform}>
                          {platform}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.orderPlatform && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.orderPlatform.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 mt-2">
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
            </div>
            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 mt-2">
              {/* Purchase Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Purchase Price *
                </label>
                <Controller
                  name="purchasePrice"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      step="0.01"
                      min="0"
                      value={field.value === 0 ? '' : field.value}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          field.onChange('');
                        } else {
                          const numValue = parseFloat(value);
                          if (isNaN(numValue)) {
                            field.onChange(value); 
                          } else {
                            field.onChange(numValue);
                          }
                        }
                      }}
                      onFocus={(e) => {
                        if (field.value === 0) {
                          e.target.value = '';
                          field.onChange('');
                        }
                      }}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                      placeholder="Enter purchase price"
                    />
                  )}
                />
                {errors.purchasePrice && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.purchasePrice.message}
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
                      value={field.value === 0 ? '' : field.value}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          field.onChange('');
                        } else {
                          const numValue = parseFloat(value);
                          if (isNaN(numValue)) {
                            field.onChange(value); // Keep invalid input to trigger validation
                          } else {
                            field.onChange(numValue);
                          }
                        }
                      }}
                      onFocus={(e) => {
                        if (field.value === 0) {
                          e.target.value = '';
                          field.onChange('');
                        }
                      }}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                      placeholder="Enter selling price"
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
            {/* Product Images Upload - Now Optional */}
            <div className="lg:col-span-2 mt-2">
              <div className=" mb-3">
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
          <div className="rounded-xl bg-gray-50 md:p-6 p-2 dark:bg-gray-700/50">
            <h3 className="mb-6 text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center px-2 sm:px-0">
              <div className="mr-3 h-6 w-6 rounded-full bg-indigo-100 p-1 dark:bg-indigo-900/30">
                <svg className="h-4 w-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              Supplier Information
            </h3>

            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Supplier
                </label>
                <Controller
                  name="supplier"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <input
                          {...field}
                          type="text"
                          className="mt-1 block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                          placeholder="Search or enter supplier name"
                          onChange={(e) => {
                            field.onChange(e);
                            setSupplierSearchQuery(e.target.value);
                            setShowSupplierSuggestions(true);
                          }}
                          onFocus={() => setShowSupplierSuggestions(true)}
                        />
                      </div>

                      {/* Loading indicator */}
                      {isLoadingSuppliers && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      )}

                      {/* Supplier Suggestions Dropdown */}
                      {showSupplierSuggestions && (field.value || supplierSearchQuery) && !isLoadingSuppliers && (
                        <div ref={supplierSuggestionsRef} className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 max-h-60 overflow-auto">
                          {/* Existing suppliers */}
                          {suppliers.length > 0 ? (
                            suppliers.map((supplier) => (
                              <div
                                key={supplier._id}
                                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm text-gray-700 dark:text-gray-300"
                                onClick={() => {
                                  field.onChange(supplier.fullName);
                                  setShowSupplierSuggestions(false);
                                  setSupplierSearchQuery('');
                                }}
                              >
                                {supplier.fullName}
                              </div>
                            ))
                          ) : (
                            <div 
                              onClick={() => {
                                const supplierName = field.value || supplierSearchQuery;
                                router.push(`/supplier/add-supplier?name=${encodeURIComponent(supplierName)}&isOrder=true`);
                              }}
                              className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                              Add &apos;{field.value || supplierSearchQuery}&apos; 
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                />
                {errors.supplier && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.supplier.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-700/50 overflow-hidden">
            <button
              type="button"
              onClick={() => setIsOtherDetailsOpen(!isOtherDetailsOpen)}
              className="w-full p-6 text-left"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center px-2 sm:px-0">
                  <div className="mr-3 h-6 w-6 rounded-full bg-orange-100 p-1 dark:bg-orange-900/30">
                    <svg className="h-4 w-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  Other Details
                </h3>
                <svg
                  className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isOtherDetailsOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {isOtherDetailsOpen && (
              <div className="px-6 pb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Notes
                  </label>
                  <Controller
                    name="otherDetails"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={4}
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                        placeholder="Enter any additional details, notes, or special instructions..."
                      />
                    )}
                  />
                  {errors.otherDetails && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.otherDetails.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="rounded-xl ">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  reset();
                  setUploadedImages([]);
                  setIsOtherDetailsOpen(false);
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
                    Creating Order...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 inline h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Order
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
        title="Order Image Preview"
        altText="Product Preview"
      />
    </div>
  );
} 