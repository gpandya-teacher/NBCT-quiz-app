const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export function fetchApi(path, options) {
  const url = buildApiUrl(path);
  console.log("[api request]", options?.method ?? "GET", url);
  return fetch(url, options);
}

export { API_BASE_URL };
