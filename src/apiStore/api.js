import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API;
if (!BASE_URL)
  throw new Error(
    "API base URL is not defined. Please check your environment variables.",
  );

const API_ENDPOINTS = {
  register: "/user/registration",
  addSupplier: "/supplier/create",
  addOrder: "/order/create",
  addProduct: "/product/create",
  getCustomerList: "/user/users-data",
  getProductList: "/product/all",
  getSupplierList: "/supplier/all",
  getOrderList: "/order/all",
  // New endpoints for order management
  getKanbanBoard: "/order/kanban-board",
  updateOrderStatus: "/order/update-status",
  updateOrderChecklist: "/order/update-checklist",
  updateTrackingInfo: "/order/update-tracking-info",
};

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


export const register = async (Paylod) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.register, Paylod);
    return response.data;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
};

export const addSupplier = async (Paylod) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.addSupplier, Paylod);
    return response.data;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
};

export const addOrder = async (Paylod) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.addOrder, Paylod);
    return response.data;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
};


export const addProduct = async (Paylod) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.addProduct, Paylod);
    return response.data;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
};

export const getCustomerList = async (params) => {

  try {
    const response = await apiClient.get(API_ENDPOINTS.getCustomerList, { params });
    return response.data;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
};

export const getProductList = async (params) => {

  try {
    const response = await apiClient.get(API_ENDPOINTS.getProductList, { params });
    return response.data;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
};

export const getSupplierList = async (params) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.getSupplierList, { params });
    return response.data;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
};

export const getOrderList = async (params) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.getOrderList, { params });
    return response.data;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
};

// Get Kanban Board Data
export const getKanbanBoard = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.getKanbanBoard);
    return response.data;
  } catch (error) {
    console.error("Error fetching kanban board data:", error);
    throw error;
  }
};

// Update Order Status
export const updateOrderStatus = async (orderId, payload) => {
  const body = { orderId, ...payload };
  try {
    const response = await apiClient.patch(API_ENDPOINTS.updateOrderStatus, body);
    return response.data;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// Update checklist for an order
export const updateOrderChecklist = async (orderId, checklist) => {
  try {
    const res = await apiClient.patch(API_ENDPOINTS.updateOrderChecklist, { orderId, checklist });
    return res.data;
  } catch (err) {
    console.error("Error updating checklist:", err.response?.data || err.message);
    throw err;
  }
};

// Update tracking details
export const updateTrackingInfo = async (payload) => {
  try {
    const response = await apiClient.patch(API_ENDPOINTS.updateTrackingInfo, payload);
    return response.data;
  } catch (error) {
    console.error("Error updating tracking info:", error);
    throw error;
  }
};


const api = {
  register,
  addSupplier,
  addOrder,
  addProduct,
  getCustomerList,
  getProductList,
  getSupplierList,
  getOrderList,
  getKanbanBoard,
  updateOrderStatus,
  updateOrderChecklist,
  updateTrackingInfo,
};

export default api;