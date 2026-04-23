import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API,
});

export const getReport = (token) =>
  api.get("/api/report", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const addUserAPI = (data, token) =>
  api.post("/api/users", data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const uploadFileAPI = (formData, token) => {
  return fetch(`${API}/api/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });
};

export default api;