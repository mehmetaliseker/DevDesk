import { getToken } from './auth';
import type { AuthResponse, AuthUser } from '@/types/auth';
import type { Category } from '@/types/category';
import type {
  Ticket,
  TicketFilters,
  TicketMessage,
  TicketPriority,
  TicketStatus
} from '@/types/ticket';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api';

interface ApiRequestOptions extends RequestInit {
  auth?: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { auth = true, headers, ...requestOptions } = options;
  const token = getToken();
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has('Content-Type') && requestOptions.body) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (auth && token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: requestHeaders,
    cache: 'no-store'
  });

  const contentType = response.headers.get('content-type');
  const hasJson = contentType?.includes('application/json');
  const data = hasJson ? await response.json() : null;

  if (!response.ok) {
    const message =
      typeof data?.message === 'string'
        ? data.message
        : Array.isArray(data?.message)
          ? data.message.join(', ')
          : 'Request failed.';
    throw new ApiError(message, response.status);
  }

  return data as T;
}

function toQueryString(filters: TicketFilters): string {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  const query = params.toString();
  return query ? `?${query}` : '';
}

export const authApi = {
  register(payload: { name: string; email: string; password: string }) {
    return request<{ user: AuthUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
      auth: false
    });
  },
  login(payload: { email: string; password: string }) {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
      auth: false
    });
  },
  me() {
    return request<AuthUser>('/auth/me');
  }
};

export const categoriesApi = {
  list() {
    return request<Category[]>('/categories');
  },
  adminList() {
    return request<Category[]>('/categories/admin');
  },
  create(payload: { name: string }) {
    return request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  update(id: string, payload: { name?: string; isActive?: boolean }) {
    return request<Category>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },
  deactivate(id: string) {
    return request<Category>(`/categories/${id}/deactivate`, {
      method: 'PATCH'
    });
  }
};

export const ticketsApi = {
  list(filters: TicketFilters = {}) {
    return request<Ticket[]>(`/tickets${toQueryString(filters)}`);
  },
  detail(id: string) {
    return request<Ticket>(`/tickets/${id}`);
  },
  create(payload: {
    title: string;
    description: string;
    categoryId: string;
    priority: TicketPriority;
  }) {
    return request<Ticket>('/tickets', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  updateStatus(id: string, status: TicketStatus) {
    return request<Ticket>(`/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },
  updatePriority(id: string, priority: TicketPriority) {
    return request<Ticket>(`/tickets/${id}/priority`, {
      method: 'PATCH',
      body: JSON.stringify({ priority })
    });
  },
  assign(id: string, assignedAgentId?: string) {
    return request<Ticket>(`/tickets/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify(assignedAgentId ? { assignedAgentId } : {})
    });
  },
  createMessage(ticketId: string, message: string) {
    return request<TicketMessage>(`/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  }
};

export const dashboardApi = {
  get() {
    return request<unknown>('/dashboard');
  }
};

export const usersApi = {
  supportAgents() {
    return request<AuthUser[]>('/users/support-agents');
  },
  list() {
    return request<AuthUser[]>('/users');
  }
};
