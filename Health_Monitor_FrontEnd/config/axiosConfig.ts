import axios from "axios";
import { API_BASE_URL } from "@/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const USER_MEASUREMENTS = `${API_BASE_URL}/measurements`;
export const USER = `${API_BASE_URL}/user`;
export const AUTH = `${API_BASE_URL}/api/auth`;
export const baseURL = API_BASE_URL;

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Attach JWT token if present
    return (async () => {
      try {
        const token = await AsyncStorage.getItem("auth_token");
        if (token) {
          // Initialize headers object if undefined and set Authorization header
          const headers: any = config.headers ?? {};
          headers["Authorization"] = `Bearer ${token}`;
          config.headers = headers;
        }
      } catch (e) {
        // ignore token retrieval errors
      }
      return config;
    })();
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
