import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

const BASE = api.defaults.baseURL;

export const sendMessage = async (message, { sources, mode, history } = {}) => {
  const response = await api.post(
    "/chat",
    { message, sources, mode, history },
    { timeout: 120000 },
  );
  return response.data;
};

export const uploadFile = async (file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 300000,
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });
  return response.data;
};

export const listDocuments = async () => {
  const response = await api.get("/documents");
  return response.data.documents;
};

export const deleteDocument = async (id) => {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
};

export const transcriptUrl = (id) => `${BASE}/documents/${id}/transcript`;

export default api;
