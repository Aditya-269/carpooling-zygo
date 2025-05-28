import { createContext, useEffect, useReducer, useContext } from "react"
import axios from "axios"

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
      localStorage.setItem("user", JSON.stringify(action.payload));
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
      localStorage.removeItem("user");
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

  // Add axios interceptor to include credentials in all requests
  useEffect(() => {
    // Set default axios config
    axios.defaults.withCredentials = true;
    
    // Add request interceptor
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        // Add headers to all requests
        config.headers['Content-Type'] = 'application/json';
        config.headers['Accept'] = 'application/json';
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear user data and redirect to login
          dispatch({ type: 'LOGOUT' });
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

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