const API_BASE_URL = 'http://localhost:8083/api';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketCategory = 'Electrical' | 'IT Support' | 'Mechanical' | 'Lab Equipment';

export interface Ticket {
  id: string;
  ticketCode: string;
  category: TicketCategory;
  location: string;
  priority: TicketPriority;
  status: TicketStatus;
  description: string;
  preferredContact: string;
  createdBy: string;
  assignedTechnician: string;
  technicianType: string;
  resolutionNotes: string;
  rejectionReason: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketRequest {
  category: TicketCategory;
  location: string;
  priority: TicketPriority;
  description: string;
  preferredContact: string;
  createdBy: string;
  assignedTechnician?: string;
}

export interface TicketAttachmentResponse {
  id: number;
  fileName: string;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  filePath: string;
  uploadedAt: string;
}

export interface TicketResponse {
  id: number;
  ticketCode: string;
  category: TicketCategory;
  location: string;
  priority: TicketPriority;
  status: TicketStatus;
  description: string;
  preferredContact: string;
  createdBy: string;
  assignedTechnician: string | null;
  technicianType: string | null;
  resolutionNotes: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  attachments: TicketAttachmentResponse[];
}

class TicketService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('authToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log('Making API request to:', url);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      if (response.status === 204) {
        return {} as T;
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private async uploadFile<T>(endpoint: string, file: File): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return response.json();
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  async getAllTickets(): Promise<TicketResponse[]> {
    return this.request<TicketResponse[]>('/tickets');
  }

  async getTicketById(id: string): Promise<TicketResponse> {
    return this.request<TicketResponse>(`/tickets/${id}`);
  }

  async createTicket(ticket: TicketRequest, attachments?: File[], createdByUserId?: number): Promise<TicketResponse> {
    const url = `${API_BASE_URL}/tickets`;
    const formData = new FormData();
    
    formData.append('category', ticket.category);
    formData.append('location', ticket.location);
    formData.append('priority', ticket.priority);
    formData.append('description', ticket.description);
    formData.append('preferredContact', ticket.preferredContact);
    formData.append('createdBy', ticket.createdBy);
    
    if (ticket.assignedTechnician) {
      formData.append('assignedTechnician', ticket.assignedTechnician);
    }
    
    if (createdByUserId) {
      formData.append('createdByUserId', createdByUserId.toString());
    }
    
    if (attachments && attachments.length > 0) {
      attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }
    
    const token = localStorage.getItem('user_token') || localStorage.getItem('admin_token');
    
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Ticket creation failed:', error);
      throw error;
    }
  }

  async updateTicket(id: string, ticket: TicketRequest): Promise<TicketResponse> {
    return this.request<TicketResponse>(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ticket),
    });
  }

  async deleteTicket(id: string): Promise<void> {
    return this.request<void>(`/tickets/${id}`, {
      method: 'DELETE',
    });
  }

  async updateTicketStatus(id: string, status: TicketStatus): Promise<TicketResponse> {
    return this.request<TicketResponse>(`/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async assignTechnician(id: string, assignedTechnician: string, technicianType?: string): Promise<TicketResponse> {
    return this.request<TicketResponse>(`/tickets/${id}/assign-technician`, {
      method: 'PATCH',
      body: JSON.stringify({ assignedTechnician, technicianType }),
    });
  }

  async updateResolution(id: string, resolutionNotes: string, rejectionReason?: string): Promise<TicketResponse> {
    return this.request<TicketResponse>(`/tickets/${id}/resolution`, {
      method: 'PATCH',
      body: JSON.stringify({ resolutionNotes, rejectionReason }),
    });
  }

  // Attachment methods
  async uploadAttachment(ticketId: string, file: File): Promise<TicketAttachmentResponse> {
    return this.uploadFile<TicketAttachmentResponse>(`/tickets/${ticketId}/attachments`, file);
  }

  async getTicketAttachments(ticketId: string): Promise<TicketAttachmentResponse[]> {
    return this.request<TicketAttachmentResponse[]>(`/tickets/${ticketId}/attachments`);
  }

  async downloadAttachment(attachmentId: string): Promise<Blob> {
    const url = `${API_BASE_URL}/attachments/${attachmentId}/download`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to download attachment: ${response.statusText}`);
      }

      return response.blob();
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  async deleteAttachment(attachmentId: string): Promise<void> {
    return this.request<void>(`/attachments/${attachmentId}`, {
      method: 'DELETE',
    });
  }
}

export const ticketService = new TicketService();
