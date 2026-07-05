import axios from "axios";

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://subsystem-uniquely-impulsive.ngrok-free.dev";

console.log("API_URL usada:", API_URL);

export const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
});

export const getImageUrl = (path?: string | null) => {
  if (!path) return null;

  if (path.startsWith("http")) {
    return path;
  }

  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error?.response?.data?.detail;

    if (typeof detail === "string") {
      return Promise.reject(new Error(detail));
    }

    if (Array.isArray(detail) && detail.length > 0) {
      return Promise.reject(
        new Error(detail[0]?.msg ?? "Error de validación")
      );
    }

    return Promise.reject(
      new Error(error?.message ?? "No se pudo conectar con la API")
    );
  }
);