const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const authApi = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  async register(userData: any) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  async getProfile() {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async refreshToken() {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

export const usersApi = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async getById(id: number) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async create(userData: any) {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  async update(id: number, userData: any) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  async delete(id: number) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

export const companiesApi = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/companies`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async getById(id: number) {
    const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async create(companyData: any) {
    const response = await fetch(`${API_BASE_URL}/companies`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(companyData),
    });
    return handleResponse(response);
  },

  async update(id: number, companyData: any) {
    const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(companyData),
    });
    return handleResponse(response);
  },

  async delete(id: number) {
    const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async search(query: string) {
    const response = await fetch(`${API_BASE_URL}/companies/search?q=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

export const projectsApi = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async getById(id: number) {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async create(projectData: any) {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData),
    });
    return handleResponse(response);
  },

  async update(id: number, projectData: any) {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData),
    });
    return handleResponse(response);
  },

  async delete(id: number) {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async updateProgress(id: number, progress: number) {
    const response = await fetch(`${API_BASE_URL}/projects/${id}/progress`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ progress }),
    });
    return handleResponse(response);
  },
};

export const leadsApi = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/leads`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async getById(id: number) {
    const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async create(leadData: any) {
    const response = await fetch(`${API_BASE_URL}/leads`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(leadData),
    });
    return handleResponse(response);
  },

  async update(id: number, leadData: any) {
    const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(leadData),
    });
    return handleResponse(response);
  },

  async delete(id: number) {
    const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async updateStatus(id: number, status: string) {
    const response = await fetch(`${API_BASE_URL}/leads/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },
};

export const tasksApi = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async getById(id: number) {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async create(taskData: any) {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });
    return handleResponse(response);
  },

  async update(id: number, taskData: any) {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });
    return handleResponse(response);
  },

  async delete(id: number) {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async updateStatus(id: number, status: string) {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },

  async updateProgress(id: number, progress: number) {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}/progress`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ progress }),
    });
    return handleResponse(response);
  },
};

export const dashboardApi = {
  async getDashboardData() {
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async getStats() {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

export const reportsApi = {
  async generateSalesReport(startDate: string, endDate: string) {
    const response = await fetch(
      `${API_BASE_URL}/reports/sales?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  async generateProjectReport(startDate: string, endDate: string) {
    const response = await fetch(
      `${API_BASE_URL}/reports/projects?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  async generateTaskReport(startDate: string, endDate: string) {
    const response = await fetch(
      `${API_BASE_URL}/reports/tasks?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },
};