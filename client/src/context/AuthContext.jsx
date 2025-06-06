import { createContext, useEffect, useReducer, useContext } from "react"

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