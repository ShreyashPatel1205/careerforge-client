const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const TOKEN_KEY = "careerforge_token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(options.body && !isFormData ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getToken,
  setToken,
  clearToken,

  register: (data) => request("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data) => request("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),
  me: () => request("/api/users/me"),

  getResumes: () => request("/api/resumes"),
  getResume: (id) => request(`/api/resumes/${id}`),
  createResume: (data) => request("/api/resumes", { method: "POST", body: JSON.stringify(data) }),
  updateResume: (id, data) => request(`/api/resumes/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  rewriteBullets: (data) => request("/api/ai/rewrite-bullets", { method: "POST", body: JSON.stringify(data) }),
  rewriteSummary: (data) => request("/api/ai/rewrite-summary", { method: "POST", body: JSON.stringify(data) }),

  uploadCertificate: (formData) => request("/api/certificates", { method: "POST", body: formData }),
  deleteCertificate: (id) => request(`/api/certificates/${id}`, { method: "DELETE" }),

  downloadResume: async (id) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/api/resumes/${id}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to download resume");
    }
    return res.blob();
  },
};
