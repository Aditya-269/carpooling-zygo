import axios from "axios"
import { useEffect, useState } from "react"

const baseURL = import.meta.env.VITE_REACT_API_URI;
// const baseURL = "http://localhost:8080/api";

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

const useFetch = (endpoint, includeCredentials = true) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const url = `${baseURL}/api/${endpoint}`;

  useEffect(() => {
    if (!endpoint) return; // Don't fetch if no endpoint is provided
    
    setLoading(true)
    const axiosConfig = {
      withCredentials: includeCredentials,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
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
    
  }, [url, includeCredentials, endpoint])

  function refetch(){
    if (!endpoint) return; // Don't fetch if no endpoint is provided
    
    setLoading(true)
    const axiosConfig = {
      withCredentials: includeCredentials,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
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