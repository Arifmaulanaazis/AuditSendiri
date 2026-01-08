import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export interface User {
    id: string;
    username: string;
    role: 'admin' | 'user' | 'guest';
    full_name: string;
    created_at: string;
}

export interface LoginResponse {
    token: string;
    expires_at: number;
    user: User;
}

export interface Transaction {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description: string;
    created_at: string;
    created_by: string;
}

export interface SetupCheckResponse {
    is_setup: boolean;
}

export const checkSetup = async (): Promise<boolean> => {
    try {
        const response = await api.get<SetupCheckResponse>('/check-setup');
        return response.data.is_setup;
    } catch (error) {
        console.error('Failed to check setup status:', error);
        return false;
    }
};

export const getTransactions = async (): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>('/transactions');
    return response.data;
};

export const updateTransaction = async (id: string, transaction: Partial<Transaction>): Promise<Transaction> => {
    const response = await api.put<Transaction>(`/transactions/${id}`, transaction);
    return response.data;
};

export const deleteTransaction = async (id: string): Promise<void> => {
    await api.delete(`/transactions/${id}`);
};

export const getUsers = async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
};

export interface AppSettings {
    rt_name: string;
    rw_name: string;
    kelurahan: string;
    kecamatan: string;
    address: string;
}

export const getSettings = async (): Promise<AppSettings> => {
    const response = await api.get<AppSettings>('/settings');
    return response.data;
};

export const updateSettings = async (settings: AppSettings): Promise<AppSettings> => {
    const response = await api.put<AppSettings>('/settings', settings);
    return response.data;
};

export interface AuditLog {
    id: string;
    entity_type: string;
    entity_id: string;
    action: string;
    note: string;
    created_at: string;
    created_by?: string;
}

export const getAuditLogs = async (): Promise<AuditLog[]> => {
    const response = await api.get<AuditLog[]>('/audit-log');
    return response.data;
};

export const restoreAuditLog = async (id: string): Promise<void> => {
    await api.post(`/audit-log/${id}/restore`);
};

export default api;
