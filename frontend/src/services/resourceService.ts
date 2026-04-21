const API_BASE_URL = 'http://localhost:8083/api';

export type ResourceType = 'LECTURE_HALL' | 'LAB' | 'MEETING_ROOM' | 'EQUIPMENT';
export type ResourceStatus = 'ACTIVE' | 'OUT_OF_SERVICE';

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  capacity?: number;
  location: string;
  description: string;
  availabilityWindows: string;
  status: ResourceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceRequest {
  name: string;
  type: ResourceType;
  capacity?: number;
  location: string;
  description: string;
  availabilityWindows: string;
  status: ResourceStatus;
  imageUrl?: string;
}

export interface ResourceResponse {
  id: number;
  name: string;
  type: ResourceType;
  capacity: number | null;
  location: string;
  description: string;
  availabilityWindows: string;
  status: ResourceStatus;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data for development when backend is not available
const mockResources: ResourceResponse[] = [
  {
    id: 1,
    name: 'Main Lecture Hall A',
    type: 'LECTURE_HALL',
    capacity: 150,
    location: 'Building 3, Floor 2',
    description: 'Large lecture hall with projector, sound system, and air conditioning. Perfect for lectures and presentations.',
    availabilityWindows: 'Mon-Fri 8AM-10PM, Sat 9AM-5PM',
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=800&h=500&fit=crop',
    createdAt: '2026-01-15T10:00:00',
    updatedAt: '2026-01-15T10:00:00',
  },
  {
    id: 2,
    name: 'Computer Lab 1',
    type: 'LAB',
    capacity: 40,
    location: 'Building 2, Floor 1',
    description: 'Fully equipped computer lab with 40 workstations, high-speed internet, and printing facilities.',
    availabilityWindows: 'Mon-Fri 9AM-9PM',
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=500&fit=crop',
    createdAt: '2026-01-16T10:00:00',
    updatedAt: '2026-01-16T10:00:00',
  },
  {
    id: 3,
    name: 'Meeting Room B',
    type: 'MEETING_ROOM',
    capacity: 12,
    location: 'Building 1, Floor 3',
    description: 'Small meeting room with whiteboard, video conferencing equipment, and comfortable seating.',
    availabilityWindows: 'Mon-Fri 8AM-6PM',
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop',
    createdAt: '2026-01-17T10:00:00',
    updatedAt: '2026-01-17T10:00:00',
  },
  {
    id: 4,
    name: 'Physics Lab',
    type: 'LAB',
    capacity: 30,
    location: 'Building 4, Floor 1',
    description: 'Physics laboratory with experimental equipment, safety gear, and instructor station.',
    availabilityWindows: 'Mon-Fri 8AM-5PM',
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=500&fit=crop',
    createdAt: '2026-01-18T10:00:00',
    updatedAt: '2026-01-18T10:00:00',
  },
  {
    id: 5,
    name: 'Projector EP-2000',
    type: 'EQUIPMENT',
    capacity: null,
    location: 'Equipment Room, Building 3',
    description: 'High-definition projector with HDMI and VGA connections. Includes remote control and carry case.',
    availabilityWindows: 'Mon-Sun 8AM-10PM',
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=500&fit=crop',
    createdAt: '2026-01-19T10:00:00',
    updatedAt: '2026-01-19T10:00:00',
  },
  {
    id: 6,
    name: 'Lecture Hall B',
    type: 'LECTURE_HALL',
    capacity: 200,
    location: 'Building 3, Floor 3',
    description: 'Largest lecture hall on campus with tiered seating, dual projectors, and advanced sound system.',
    availabilityWindows: 'Mon-Fri 8AM-10PM',
    status: 'OUT_OF_SERVICE',
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=500&fit=crop',
    createdAt: '2026-01-20T10:00:00',
    updatedAt: '2026-04-01T10:00:00',
  },
  {
    id: 7,
    name: 'Chemistry Lab',
    type: 'LAB',
    capacity: 25,
    location: 'Building 4, Floor 2',
    description: 'Chemistry laboratory with fume hoods, safety equipment, and chemical storage.',
    availabilityWindows: 'Mon-Fri 8AM-5PM',
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=500&fit=crop',
    createdAt: '2026-01-21T10:00:00',
    updatedAt: '2026-01-21T10:00:00',
  },
  {
    id: 8,
    name: 'Conference Room',
    type: 'MEETING_ROOM',
    capacity: 20,
    location: 'Building 1, Floor 4',
    description: 'Professional conference room with presentation screen, video conferencing, and catering access.',
    availabilityWindows: 'Mon-Fri 8AM-8PM',
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&h=500&fit=crop',
    createdAt: '2026-01-22T10:00:00',
    updatedAt: '2026-01-22T10:00:00',
  },
];

class ResourceService {
  private useMockData = false; // Force real API calls, set to true only for offline development

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
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
      console.log('Falling back to mock data for development');
      this.useMockData = true;
      throw error;
    }
  }

  async getAllResources(): Promise<ResourceResponse[]> {
    if (this.useMockData) {
      return mockResources;
    }
    try {
      return await this.request<ResourceResponse[]>('/resources');
    } catch {
      this.useMockData = true;
      return mockResources;
    }
  }

  async getResourceById(id: string): Promise<ResourceResponse> {
    if (this.useMockData) {
      const resource = mockResources.find(r => r.id === parseInt(id));
      if (!resource) {
        throw new Error('Resource not found');
      }
      return resource;
    }
    try {
      return await this.request<ResourceResponse>(`/resources/${id}`);
    } catch {
      this.useMockData = true;
      const resource = mockResources.find(r => r.id === parseInt(id));
      if (!resource) {
        throw new Error('Resource not found');
      }
      return resource;
    }
  }

  async createResource(resource: ResourceRequest): Promise<ResourceResponse> {
    if (this.useMockData) {
      const newResource: ResourceResponse = {
        id: mockResources.length + 1,
        ...resource,
        capacity: resource.capacity || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockResources.push(newResource);
      return newResource;
    }
    return await this.request<ResourceResponse>('/resources', {
      method: 'POST',
      body: JSON.stringify(resource),
    });
  }

  async updateResource(id: string, resource: ResourceRequest): Promise<ResourceResponse> {
    if (this.useMockData) {
      const index = mockResources.findIndex(r => r.id === parseInt(id));
      if (index === -1) {
        throw new Error('Resource not found');
      }
      mockResources[index] = {
        ...mockResources[index],
        ...resource,
        capacity: resource.capacity || null,
        updatedAt: new Date().toISOString(),
      };
      return mockResources[index];
    }
    try {
      return await this.request<ResourceResponse>(`/resources/${id}`, {
        method: 'PUT',
        body: JSON.stringify(resource),
      });
    } catch {
      this.useMockData = true;
      const index = mockResources.findIndex(r => r.id === parseInt(id));
      if (index === -1) {
        throw new Error('Resource not found');
      }
      mockResources[index] = {
        ...mockResources[index],
        ...resource,
        capacity: resource.capacity || null,
        updatedAt: new Date().toISOString(),
      };
      return mockResources[index];
    }
  }

  async deleteResource(id: string): Promise<void> {
    if (this.useMockData) {
      const index = mockResources.findIndex(r => r.id === parseInt(id));
      if (index === -1) {
        throw new Error('Resource not found');
      }
      mockResources.splice(index, 1);
      return;
    }
    try {
      await this.request<void>(`/resources/${id}`, {
        method: 'DELETE',
      });
    } catch {
      this.useMockData = true;
      const index = mockResources.findIndex(r => r.id === parseInt(id));
      if (index === -1) {
        throw new Error('Resource not found');
      }
      mockResources.splice(index, 1);
    }
  }

  async updateResourceStatus(id: string, status: ResourceStatus): Promise<ResourceResponse> {
    if (this.useMockData) {
      const index = mockResources.findIndex(r => r.id === parseInt(id));
      if (index === -1) {
        throw new Error('Resource not found');
      }
      mockResources[index].status = status;
      mockResources[index].updatedAt = new Date().toISOString();
      return mockResources[index];
    }
    try {
      return await this.request<ResourceResponse>(`/resources/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch {
      this.useMockData = true;
      const index = mockResources.findIndex(r => r.id === parseInt(id));
      if (index === -1) {
        throw new Error('Resource not found');
      }
      mockResources[index].status = status;
      mockResources[index].updatedAt = new Date().toISOString();
      return mockResources[index];
    }
  }

  async searchResources(filters: {
    type?: ResourceType;
    minCapacity?: number;
    location?: string;
    status?: ResourceStatus;
  }): Promise<ResourceResponse[]> {
    if (this.useMockData) {
      return mockResources.filter(resource => {
        if (filters.type && resource.type !== filters.type) return false;
        if (filters.minCapacity && (!resource.capacity || resource.capacity < filters.minCapacity)) return false;
        if (filters.location && !resource.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
        if (filters.status && resource.status !== filters.status) return false;
        return true;
      });
    }
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.minCapacity) params.append('minCapacity', filters.minCapacity.toString());
      if (filters.location) params.append('location', filters.location);
      if (filters.status) params.append('status', filters.status);

      return await this.request<ResourceResponse[]>(`/resources/search?${params.toString()}`);
    } catch {
      this.useMockData = true;
      return mockResources.filter(resource => {
        if (filters.type && resource.type !== filters.type) return false;
        if (filters.minCapacity && (!resource.capacity || resource.capacity < filters.minCapacity)) return false;
        if (filters.location && !resource.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
        if (filters.status && resource.status !== filters.status) return false;
        return true;
      });
    }
  }
}

export const resourceService = new ResourceService();
