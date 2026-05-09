import axios from 'axios'

const rootApi = axios.create({
  baseURL: import.meta.env.VITE_API_ROOT_URL,
  withCredentials: true,
  timeout: 15000,
})

rootApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

rootApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default rootApi
