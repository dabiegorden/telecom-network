const API = process.env.NEXT_PUBLIC_API_URL || "/api";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// ─── Users API ────────────────────────────────────────────────────────────────

export const usersApi = {
  createUser: async (data: Record<string, any>) => {
    const response = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getAllUsers: async () => {
    const response = await fetch(`${API}/users`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getAllProfessionals: async () => {
    const response = await fetch(`${API}/users/professionals`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getAllRecruiters: async () => {
    const response = await fetch(`${API}/users/recruiters`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getUserById: async (id: string) => {
    const response = await fetch(`${API}/users/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  updateUser: async (id: string, data: any) => {
    const response = await fetch(`${API}/users/${id}`, {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return response.json();
  },

  deleteUser: async (id: string) => {
    const response = await fetch(`${API}/users/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

// ─── Jobs API ─────────────────────────────────────────────────────────────────

export const jobsApi = {
  // Get all jobs — optional filters: location, source, search, page, limit
  getAllJobs: async (params?: {
    location?: string;
    source?: "internal" | "rapidapi";
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const qs = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : "";
    const response = await fetch(`${API}/jobs${qs}`);
    return response.json();
  },

  // Get single job by ID
  getJobById: async (id: string) => {
    const response = await fetch(`${API}/jobs/${id}`);
    return response.json();
  },

  // Create job (FormData for image upload, or plain object)
  createJob: async (data: FormData | Record<string, any>) => {
    const isFormData = data instanceof FormData;
    const response = await fetch(`${API}/jobs`, {
      method: "POST",
      headers: isFormData
        ? getAuthHeaders()
        : { ...getAuthHeaders(), "Content-Type": "application/json" },
      body: isFormData ? data : JSON.stringify(data),
    });
    return response.json();
  },

  // Update job
  updateJob: async (id: string, data: FormData | Record<string, any>) => {
    const isFormData = data instanceof FormData;
    const response = await fetch(`${API}/jobs/${id}`, {
      method: "PUT",
      headers: isFormData
        ? getAuthHeaders()
        : { ...getAuthHeaders(), "Content-Type": "application/json" },
      body: isFormData ? data : JSON.stringify(data),
    });
    return response.json();
  },

  // Delete job (also removes all related applications on the backend)
  deleteJob: async (id: string) => {
    const response = await fetch(`${API}/jobs/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Get all applications for a specific job (admin / recruiter only)
  getJobApplications: async (
    jobId: string,
    params?: { page?: number; limit?: number; status?: string },
  ) => {
    const qs = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : "";
    const response = await fetch(`${API}/jobs/${jobId}/applications${qs}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Sync external jobs from RapidAPI Indeed into the database (admin only)
  syncExternalJobs: async (params?: {
    query?: string;
    location?: string;
    countryCode?: string;
    radius?: string;
    sortType?: string;
  }) => {
    const qs = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : "";
    const response = await fetch(`${API}/jobs/sync-external${qs}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Preview external jobs from RapidAPI without saving to DB
  previewExternalJobs: async (params?: {
    query?: string;
    location?: string;
    countryCode?: string;
    radius?: string;
  }) => {
    const qs = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : "";
    const response = await fetch(`${API}/jobs/external/preview${qs}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

// ─── Applications API ─────────────────────────────────────────────────────────

export const applicationsApi = {
  // User: submit an application (FormData supports optional resume PDF/DOC upload)
  applyToJob: async (
    jobId: string,
    data: FormData | { coverLetter?: string },
  ) => {
    const isFormData = data instanceof FormData;
    const response = await fetch(`${API}/applications/${jobId}`, {
      method: "POST",
      headers: isFormData
        ? getAuthHeaders()
        : { ...getAuthHeaders(), "Content-Type": "application/json" },
      body: isFormData ? data : JSON.stringify(data),
    });
    return response.json();
  },

  // User: view their own applications
  getMyApplications: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const qs = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : "";
    const response = await fetch(`${API}/applications/my/all${qs}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // User: withdraw (delete) their own application
  withdrawApplication: async (applicationId: string) => {
    const response = await fetch(
      `${API}/applications/${applicationId}/withdraw`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      },
    );
    return response.json();
  },

  // Admin: get all applications across every job
  getAllApplications: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    jobId?: string;
  }) => {
    const qs = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : "";
    const response = await fetch(`${API}/applications/admin/all${qs}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Admin / recruiter: move an application through the hiring pipeline
  updateApplicationStatus: async (
    applicationId: string,
    status: "pending" | "reviewing" | "shortlisted" | "rejected" | "hired",
    notes?: string,
  ) => {
    const response = await fetch(
      `${API}/applications/${applicationId}/status`,
      {
        method: "PATCH",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          ...(notes !== undefined && { notes }),
        }),
      },
    );
    return response.json();
  },
};

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  register: async (data: any) => {
    const response = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
