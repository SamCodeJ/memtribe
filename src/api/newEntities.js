import { apiClient } from './client.js';

/**
 * Entity base class with CRUD operations
 */
class Entity {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  async list(sort, params = {}) {
    const queryParams = new URLSearchParams();
    if (sort) queryParams.append('sort', sort);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    const queryString = queryParams.toString();
    return apiClient.get(`${this.endpoint}${queryString ? `?${queryString}` : ''}`);
  }

  async get(id) {
    return apiClient.get(`${this.endpoint}/${id}`);
  }

  async create(data) {
    return apiClient.post(this.endpoint, data);
  }

  async update(id, data) {
    return apiClient.put(`${this.endpoint}/${id}`, data);
  }

  async delete(id) {
    return apiClient.delete(`${this.endpoint}/${id}`);
  }

  async filter(filters, sort) {
    return apiClient.post(`${this.endpoint}/filter`, { filters, sort });
  }
}

/**
 * User/Auth Entity
 */
class UserEntity {
  async register(data) {
    const response = await apiClient.post('/auth/register', data);
    if (response.token) {
      apiClient.setToken(response.token);
    }
    return response.user;
  }

  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.token) {
      apiClient.setToken(response.token);
    }
    return response.user;
  }

  async loginWithRedirect(redirectUrl) {
    // For now, redirect to a login page
    // In production, you might want to implement OAuth or similar
    window.location.href = `/login?redirect=${encodeURIComponent(redirectUrl)}`;
  }

  async logout() {
    apiClient.setToken(null);
    window.location.href = '/';
  }

  async me() {
    const response = await apiClient.get('/auth/me');
    return response.user;
  }

  async updateMyUserData(data) {
    const response = await apiClient.put('/auth/me', data);
    return response.user;
  }

  async list() {
    const response = await apiClient.get('/auth/users');
    return response;
  }

  async update(userId, data) {
    const response = await apiClient.put(`/auth/users/${userId}`, data);
    return response.user;
  }

  async refreshToken() {
    const token = apiClient.getToken();
    const response = await apiClient.post('/auth/refresh', { token });
    if (response.token) {
      apiClient.setToken(response.token);
    }
    return response.user;
  }
}

/**
 * Package Entity with additional methods
 */
class PackageEntity extends Entity {
  constructor() {
    super('/packages');
  }

  async getBySlug(slug) {
    return apiClient.get(`${this.endpoint}/slug/${slug}`);
  }

  async getFeatures(packageId) {
    return apiClient.get(`${this.endpoint}/${packageId}/features`);
  }
}

/**
 * Feature Entity
 */
class FeatureEntity extends Entity {
  constructor() {
    super('/features');
  }
}

/**
 * PackageFeature Entity (for querying package features)
 */
class PackageFeatureEntity extends Entity {
  constructor() {
    super('/package-features');
  }

  async filter(filters) {
    // Query package features based on package_id or feature_id
    return apiClient.post(`${this.endpoint}/filter`, { filters });
  }
}

/**
 * System Settings Entity
 */
class SystemSettingsEntity extends Entity {
  constructor() {
    super('/system-settings');
  }

  async list() {
    const response = await apiClient.get(this.endpoint);
    // Parse JSON values from the response
    return response.map(setting => {
      try {
        const parsed = JSON.parse(setting.value);
        return {
          id: setting.id,
          key: setting.key,
          ...parsed
        };
      } catch {
        // If not JSON, return as-is
        return setting;
      }
    });
  }

  async getByKey(key) {
    return apiClient.get(`${this.endpoint}/${key}`);
  }

  async updateByKey(key, value) {
    return apiClient.put(`${this.endpoint}/${key}`, { value });
  }
}

// Export entity instances
export const Event = new Entity('/events');
export const RSVP = new Entity('/rsvps');
export const Media = new Entity('/media');
export const User = new UserEntity();
export const Package = new PackageEntity();
export const Feature = new FeatureEntity();
export const PackageFeature = new PackageFeatureEntity();
export const SystemSettings = new SystemSettingsEntity();
