import axios from "axios"
import { useEffect, useState } from "react"

const baseURL = import.meta.env.VITE_REACT_API_URI;
// const baseURL = "http://localhost:8080/api";

const useFetch = (endpoint, includeCredentials = false) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const url = `${baseURL}/${endpoint}`;

  useEffect(() => {
    setLoading(true)
    const axiosConfig = includeCredentials ? { withCredentials: true } : {};
    axios
      .get(url, axiosConfig)
      .then((response) => {
        setData(response.data)
      })
      .catch((err) => {
        // Extract error message from the response
        const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error || 
                           err.message || 
                           "An error occurred";
        setError(errorMessage);
      })
      .finally(() => {
        setLoading(false)
      })
    
  }, [url, includeCredentials])

  function refetch(){
    setLoading(true)
    const axiosConfig = includeCredentials ? { withCredentials: true } : {};
    axios
      .get(url, axiosConfig)
      .then((response) => {
        setData(response.data)
      })
      .catch((err) => {
        // Extract error message from the response
        const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error || 
                           err.message || 
                           "An error occurred";
        setError(errorMessage);
      })
      .finally(() => {
        setLoading(false)
      })
  }
  
  return { data, loading, error, refetch }
}

export default useFetch