import { createContext, useEffect, useReducer, useContext } from "react"
import axios from "axios";

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
    default: 
      return state;
  }
}

export const AuthContextProvider = ({children}) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE)

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(state.user))
  }, [state.user])

  // Set up axios interceptors
  useEffect(() => {
    // Request interceptor
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        // Add token to all requests if it exists
        if (state.user?.accessToken) {
          config.headers.Authorization = `Bearer ${state.user.accessToken}`;
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
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          dispatch({ type: "LOGOUT" });
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors on unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
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