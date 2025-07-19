import axios from "axios";
// export const baseURL = `http://192.168.1.236:8080`; SOFIQ
export const baseURL = `http://192.168.0.108:8080`; // seloto
export const USER_MEASUREMENTS = `${baseURL}/measurements`;
export const USER = `${baseURL}/user`;

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: baseURL, // Replace with your API base URL
  timeout: 100, // Request timeout in milliseconds
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
