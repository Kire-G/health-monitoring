import axios from "axios";
import { API_BASE_URL } from "@/api"; // Import the centralized base URL

export const USER_MEASUREMENTS = `${API_BASE_URL}/measurements`;
export const USER = `${API_BASE_URL}/user`;

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL, // Use the imported base URL
  timeout: 30000, // Request timeout in milliseconds (30 seconds)
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Add authorization token to headers if available
    const token = ""; // Replace with your logic to get the token
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Handle successful response
    return response;
  },
  (error) => {
    // Handle response error
    if (error.response) {
      // Handle specific HTTP status codes
      if (error.response.status === 401) {
        // Unauthorized, redirect to login or handle token refresh
        console.error("Unauthorized, please log in again.");
      } else if (error.response.status === 500) {
        // Internal server error
        console.error("Server error, please try again later.");
      }
    } else {
      // Handle network or other errors
      console.error("Network error, please check your connection.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
