import axios from "axios";
import { API_BASE_URL } from "@/api";

export const USER_MEASUREMENTS = `${API_BASE_URL}/measurements`;
export const USER = `${API_BASE_URL}/user`;
export const baseURL = API_BASE_URL;

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = "";
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        console.error("Unauthorized, please log in again.");
      } else if (error.response.status === 500) {
        console.error("Server error, please try again later.");
      }
    } else {
      console.error("Network error, please check your connection.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
