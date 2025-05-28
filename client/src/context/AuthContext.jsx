import { createContext, useEffect, useReducer, useContext } from "react"
import axios from "axios";

const apiUri = import.meta.env.VITE_REACT_API_URI;

const INITIAL_STATE = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  loading: false,
  error: null
}

export const AuthContext = createContext(INITIAL_STATE);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};

const AuthReducer = (state, action) => {
  switch(action.type){
    case "LOGIN_START":
      return{
        user: null,
        loading: true,
        error: null
      }
    case "LOGIN_SUCCESS":
      return{
        user: action.payload,
        loading: false,
        error: null
      }
    case "LOGIN_FAILED":
      return{
        user: null,
        loading: false,
        error: action.payload
      }
    case "LOGOUT":
      localStorage.removeItem("user"); // Clear user data from local storage
      return{
        user: null,
        loading: false,
        error: null
      }
    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload
      }
    default: 
      return state;
  }
}

export const AuthContextProvider = ({children}) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE)

  // Set up axios interceptors for handling authentication
  useEffect(() => {
    // Request interceptor
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        // Add auth token to requests if user is logged in
        if (state.user?.token) {
          config.headers.Authorization = `Bearer ${state.user.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh the token
            const response = await axios.post(
              `${apiUri}/api/auth/refresh-token`,
              {},
              { withCredentials: true }
            );

            if (response.data?.token) {
              // Update user with new token
              const updatedUser = {
                ...state.user,
                token: response.data.token
              };
              dispatch({ type: "UPDATE_USER", payload: updatedUser });
              
              // Retry the original request with new token
              originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            // If refresh fails, log out the user
            dispatch({ type: "LOGOUT" });
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    // Clean up interceptors
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [state.user]);

  // Update localStorage when user state changes
  useEffect(() => {
    if (state.user) {
      localStorage.setItem("user", JSON.stringify(state.user));
    }
  }, [state.user]);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        error: state.error,
        dispatch
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}