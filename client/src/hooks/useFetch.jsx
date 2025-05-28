import { useState, useEffect } from "react"
import axios from "axios"

const useFetch = (url) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const apiUrl = import.meta.env.DEV 
          ? `/api/${url}` 
          : `${import.meta.env.VITE_REACT_API_URI}/${url}`;
        
        console.log('Fetching from:', apiUrl);
        
        const res = await axios.get(apiUrl, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          validateStatus: function (status) {
            return status >= 200 && status < 500; // Accept all status codes less than 500
          }
        })
        
        console.log('Response received:', res);
        
        if (res.status === 401) {
          setError('Not authenticated');
          return;
        }
        
        setData(res.data)
      } catch (err) {
        console.error('API Error:', {
          url: `/${url}`,
          status: err.response?.status,
          message: err.message,
          response: err.response?.data
        });
        setError(err.response?.data?.message || err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [url])

  return { data, loading, error }
}

export default useFetch