// axiosInstance.ts
import axios from 'axios';
import toast from 'react-hot-toast';

// Create an Axios instance
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // Set your API base URL
    timeout: 120000, // Set a timeout for requests
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        try {
            const authStorage = localStorage.getItem('auth-storage');
            if (authStorage) {
                const { state } = JSON.parse(authStorage);
                if (state?.token) {
                    config.headers.Authorization = `Bearer ${state.token}`;
                }
            }
            return config;
        } catch (err) {
            toast.error('Error accessing authentication data');
            return config;
        }
    },
    (error) => {
        toast.error('An error occurred while sending the request');
        return Promise.reject(error);
    }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        // Handle successful responses
        return response;
    },
    (error) => {
        const { response, request, message } = error;

        // Handle errors
        if (response) {
            if (response.status === 401) {
                // Clear auth storage and reload on 401 unauthorized
                localStorage.removeItem('auth-storage');
                window.location.reload();
                return Promise.reject("Unauthorized - Please login again");
            }
            // The request was made and the server responded with a status code
            toast.error(`Error Response: ${response.data}`);
            toast.error(`Error Status: ${response.status}`);
            toast.error(`Error Headers: ${JSON.stringify(response.headers)}`);
        } else if (request) {
            // The request was made but no response was received
            toast.error('No response received from the server');
        } else {
            // Something happened in setting up the request that triggered an Error
            toast.error(`Error: ${message}`);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
