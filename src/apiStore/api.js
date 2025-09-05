import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API;
if (!BASE_URL)
  throw new Error(
    "API base URL is not defined. Please check your environment variables.",
  );

const API_ENDPOINTS = {
  register: "/user/registration",
  addSupplier: "/supplier/create",
 
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


const api = {
  register,
  addSupplier,
  };

export default api;