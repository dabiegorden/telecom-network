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

  getCurrentUser: async () => {
    const response = await fetch(`${API}/users/me`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // data: plain object for JSON update, or FormData when uploading profileImage/bannerImage
  updateCurrentUser: async (data: Record<string, any> | FormData) => {
    const isFormData = data instanceof FormData;
    const response = await fetch(`${API}/users/me`, {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
      body: isFormData ? data : JSON.stringify(data),
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
  getAllJobs: async (params?: {
    location?: string;
    source?: "internal" | "rapidapi";
    jobType?: string;
    experienceLevel?: string;
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

  getJobById: async (id: string) => {
    const response = await fetch(`${API}/jobs/${id}`);
    return response.json();
  },

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

  deleteJob: async (id: string) => {
    const response = await fetch(`${API}/jobs/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  saveJob: async (id: string) => {
    const response = await fetch(`${API}/jobs/${id}/save`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  unsaveJob: async (id: string) => {
    const response = await fetch(`${API}/jobs/${id}/save`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getSavedJobs: async (params?: { page?: number; limit?: number }) => {
    const qs = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : "";
    const response = await fetch(`${API}/jobs/saved${qs}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getMyPostedJobs: async (params?: { page?: number; limit?: number; status?: string }) => {
    const qs = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : "";
    const response = await fetch(`${API}/jobs/my/posted${qs}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

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

  updateApplicationStatus: async (
    applicationId: string,
    status: "pending" | "reviewing" | "shortlisted" | "rejected" | "hired",
    notes?: string,
  ) => {
    const response = await fetch(
      `${API}/applications/${applicationId}/status`,
      {
        method: "PATCH",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...(notes !== undefined && { notes }) }),
      },
    );
    return response.json();
  },

  markApplicationViewed: async (applicationId: string) => {
    const response = await fetch(
      `${API}/applications/${applicationId}/viewed`,
      { method: "PATCH", headers: getAuthHeaders() },
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

  verifyOtp: async (email: string, otp: string) => {
    const response = await fetch(`${API}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    return response.json();
  },

  resendOtp: async (email: string) => {
    const response = await fetch(`${API}/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return response.json();
  },
};

// ─── Notifications API ────────────────────────────────────────────────────────

export const notificationsApi = {
  getMyNotifications: async () => {
    const response = await fetch(`${API}/notifications`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  markAsRead: async (id: string) => {
    const response = await fetch(`${API}/notifications/${id}/read`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  markAllAsRead: async () => {
    const response = await fetch(`${API}/notifications/read-all`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  deleteNotification: async (id: string) => {
    const response = await fetch(`${API}/notifications/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

// ─── Connections API ──────────────────────────────────────────────────────────

export const connectionsApi = {
  getMyConnections: async () => {
    const response = await fetch(`${API}/connections`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getDiscoverableUsers: async () => {
    const response = await fetch(`${API}/connections/discover`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getPendingRequests: async () => {
    const response = await fetch(`${API}/connections/requests`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getConnectionStatus: async (userId: string) => {
    const response = await fetch(`${API}/connections/status/${userId}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  sendRequest: async (userId: string) => {
    const response = await fetch(`${API}/connections/request/${userId}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  respondToRequest: async (id: string, action: "accepted" | "declined") => {
    const response = await fetch(`${API}/connections/${id}/respond`, {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action }),
    });
    return response.json();
  },

  removeConnection: async (id: string) => {
    const response = await fetch(`${API}/connections/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

// ─── Messages API ─────────────────────────────────────────────────────────────

export const messagesApi = {
  getConversations: async () => {
    const response = await fetch(`${API}/messages/conversations`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getOrCreateConversationWithUser: async (userId: string) => {
    const response = await fetch(`${API}/messages/conversations/with/${userId}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getMessages: async (conversationId: string) => {
    const response = await fetch(`${API}/messages/conversations/${conversationId}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  sendMessage: async (conversationId: string, content: string, file?: File) => {
    let body: BodyInit;
    let headers: Record<string, string> = { ...getAuthHeaders() };

    if (file) {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("attachment", file);
      body = formData;
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify({ content });
    }

    const response = await fetch(`${API}/messages/conversations/${conversationId}`, {
      method: "POST",
      headers,
      body,
    });
    return response.json();
  },

  markConversationAsRead: async (conversationId: string) => {
    const response = await fetch(`${API}/messages/conversations/${conversationId}/read`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

// ─── Analytics API ────────────────────────────────────────────────────────────

export const analyticsApi = {
  getPlatformAnalytics: async () => {
    const response = await fetch(`${API}/analytics/platform`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getRecruiterAnalytics: async () => {
    const response = await fetch(`${API}/analytics/recruiter`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getProfessionalAnalytics: async () => {
    const response = await fetch(`${API}/analytics/professional`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};
