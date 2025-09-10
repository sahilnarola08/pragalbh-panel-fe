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
};

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// User Registration
// paylod = {
//   "firstName": "John",
//   "lastName": "Doe",
//   "address": "123 Main Street, City, State 12345",
//   "contactNumber": "1234567890",
//   "email": "john.doe@example.com",
//   "clientType": "individual",
//   "company": "ABC Company",
//   "platforms": [
//     { "platformName": "Instagram", "platformUsername": "jay_bhuvasaya" },
//     { "platformName": "YouTube", "platformUsername": "johnYT" },
//     { "platformName": "Twitter", "platformUsername": "john123" }
//   ]
// }



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
// add order
// paylod = {{
//   "clientName": "John Doe",
//   "address": "123 Street",
//   "product": "Laptop",
//   "orderDate": "2025-09-05",
//   "dispatchDate": "2025-09-10",
//   "purchasePrice": 500,
//   "sellingPrice": 650,
//   "supplier": "Supplier Ltd",
//   "orderPlatform": "Amazon",
//   "otherDetails": "Urgent order"
// }
export const addOrder = async (Paylod) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.addOrder, Paylod);
    return response.data;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
};

// add product
// paylod = {
//   "category": "Electronics",
//   "productName": "Laptop"
// }
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

const api = {
  register,
  addSupplier,
  addOrder,
  addProduct,
  getCustomerList,
  };

export default api;