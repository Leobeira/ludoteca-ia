import axios from "axios";

const isVercel = window.location.hostname.includes("vercel.app");

export const API_URL = isVercel
  ? "https://ludoteca-ia-backend.onrender.com" 
  : "http://127.0.0.1:8000";                

const api = axios.create({
  baseURL: API_URL,
});

export default api;