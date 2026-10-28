const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  errors?: any;

  constructor(message: string, status: number, errors?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('mm_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      // Clear token if expired or unauthorized
      localStorage.removeItem('mm_token');
      localStorage.removeItem('mm_user');
      window.dispatchEvent(new Event('auth-unauthorized'));
    }
    throw new ApiError(data.message || 'Request failed', response.status, data.errors);
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ success: boolean; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getMe: () => request<{ success: boolean; user: any }>('/auth/me'),
  getDemoAccounts: () => request<{ success: boolean; accounts: any[] }>('/auth/demo-accounts'),

  // Profiles
  getMyStudentProfile: () => request<{ success: boolean; profile: any }>('/profiles/student/me'),
  updateMyStudentProfile: (profileData: any) =>
    request<{ success: boolean; profile: any; message: string }>('/profiles/student/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
  submitMyStudentProfile: () =>
    request<{ success: boolean; profile: any; message: string }>('/profiles/student/submit', {
      method: 'POST',
    }),
  getStudentProfileById: (id: string) => request<{ success: boolean; profile: any }>(`/profiles/student/${id}`),
  reviewStudentProfile: (id: string, reviewData: { status: string; reviewNotes: string }) =>
    request<{ success: boolean; profile: any; message: string }>(`/profiles/student/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    }),
  getMentorDirectory: () => request<{ success: boolean; mentors: any[] }>('/profiles/mentors'),

  // Sessions
  getSessions: (studentProfileId?: string) => {
    const query = studentProfileId ? `?studentProfileId=${studentProfileId}` : '';
    return request<{ success: boolean; sessions: any[] }>(`/sessions${query}`);
  },
  createSession: (sessionData: any) =>
    request<{ success: boolean; session: any; message: string }>('/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    }),

  // Recommendations
  getRecommendations: (studentProfileId?: string) => {
    const query = studentProfileId ? `?studentProfileId=${studentProfileId}` : '';
    return request<{ success: boolean; recommendations: any[] }>(`/recommendations${query}`);
  },
  createRecommendation: (recData: any) =>
    request<{ success: boolean; recommendation: any; message: string }>('/recommendations', {
      method: 'POST',
      body: JSON.stringify(recData),
    }),
  submitForEndorsement: (id: string) =>
    request<{ success: boolean; recommendation: any; message: string }>(`/recommendations/${id}/submit-endorsement`, {
      method: 'POST',
    }),

  // Action Items
  getActionItems: (studentProfileId?: string) => {
    const query = studentProfileId ? `?studentProfileId=${studentProfileId}` : '';
    return request<{ success: boolean; items: any[] }>(`/action-items${query}`);
  },
  updateActionItem: (id: string, itemData: any) =>
    request<{ success: boolean; item: any; message: string }>(`/action-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    }),

  // Endorsements
  getEndorsements: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return request<{ success: boolean; endorsements: any[] }>(`/endorsements${query}`);
  },
  makeEndorsementDecision: (id: string, decision: { status: string; decisionNotes: string }) =>
    request<{ success: boolean; endorsement: any; message: string }>(`/endorsements/${id}/decision`, {
      method: 'POST',
      body: JSON.stringify(decision),
    }),

  // HOD Administration & Department Overview
  getDepartmentOverview: () => request<{ success: boolean; stats: any }>('/hod/overview'),
  getAssignments: () => request<{ success: boolean; assignments: any[]; unassignedStudents: any[]; faculty: any[] }>('/hod/assignments'),
  assignMentor: (payload: { studentProfileId: string; facultyProfileId: string; notes?: string }) =>
    request<{ success: boolean; assignment: any; message: string }>('/hod/assign', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getAuditLogs: () => request<{ success: boolean; logs: any[] }>('/hod/audit-logs'),
  getUsers: () => request<{ success: boolean; users: any[] }>('/hod/users'),
  createUser: (payload: any) =>
    request<{ success: boolean; user: any; message: string }>('/hod/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Analytics
  getMenteeDashboardData: () => request<{ success: boolean; data: any }>('/analytics/mentee-dashboard'),
  getMentorDashboardData: () => request<{ success: boolean; data: any }>('/analytics/mentor-dashboard'),

  // Notifications
  getNotifications: () => request<{ success: boolean; notifications: any[]; unreadCount: number }>('/notifications'),
  markNotificationAsRead: (id: string) => request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsAsRead: () => request<{ success: boolean }>('/notifications/read-all', { method: 'PUT' }),
};
