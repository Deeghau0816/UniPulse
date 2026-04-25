const API_BASE_URL = 'http://localhost:8083/api';

export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  name: string;
  role: string;
  profileImage?: string | null;
  sliitId?: string | null;
  provider?: string;
  profileCompleted?: boolean;
}

class UserService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('user_token') || localStorage.getItem('admin_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async getAllUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch users:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const users = await response.json();
    console.log('Fetched users:', users);
    return users;
  }

  async getTechnicians(): Promise<User[]> {
    const allUsers = await this.getAllUsers();
    const technicians = allUsers.filter(user => user.role === 'TECHNICIAN');
    console.log('Filtered technicians:', technicians);
    return technicians;
  }
}

export const userService = new UserService();
