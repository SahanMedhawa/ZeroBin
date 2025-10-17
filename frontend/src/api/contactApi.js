import axios from 'axios';

const API_URL = 'http://localhost:5000/api/contacts';

// Helper function to convert contacts to CSV
const convertToCSV = (contacts) => {
  const headers = ['Name', 'Email', 'Phone', 'Subject', 'Message', 'Status', 'Created At'];
  const csvContent = [
    headers.join(','),
    ...contacts.map(contact => [
      `"${contact.name || ''}"`,
      `"${contact.email || ''}"`,
      `"${contact.phone || ''}"`,
      `"${contact.subject || ''}"`,
      `"${contact.message || ''}"`,
      `"${contact.status || ''}"`,
      `"${new Date(contact.createdAt).toLocaleString()}"`
    ].join(','))
  ].join('\n');
  
  return csvContent;
};

// Get auth token from localStorage
const getAuthToken = () => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const user = JSON.parse(userInfo);
    console.log('Contact API: User token found:', user.token ? 'Yes' : 'No');
    return user.token;
  }
  console.log('Contact API: No user info found in localStorage');
  return null;
};

// Get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Use cookies for authentication like other APIs
});

// Contact API functions
export const contactApi = {
  // Get all contacts (Admin only)
  getAllContacts: async () => {
    try {
      console.log('Fetching contacts from:', API_URL);
      const response = await api.get('/');
      console.log('Contacts response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },

  // Get single contact by ID (Admin only)
  getContactById: async (id) => {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contact:', error);
      throw error;
    }
  },

  // Update contact status (Admin only)
  updateContactStatus: async (id, status) => {
    try {
      const response = await api.put(`/${id}`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating contact status:', error);
      throw error;
    }
  },

  // Delete contact (Admin only)
  deleteContact: async (id) => {
    try {
      const response = await api.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  },

  // Create contact (Public)
  createContact: async (contactData) => {
    try {
      const response = await api.post('/', contactData);
      return response.data;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  },

  // Get contact statistics (Admin only)
  getContactStatistics: async () => {
    try {
      const response = await api.get('/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching contact statistics:', error);
      throw error;
    }
  },

  // Export contacts to CSV (Admin only)
  exportContacts: async (filters = {}) => {
    try {
      // Get contacts data first
      const contactsResponse = await contactApi.getAllContacts();
      if (contactsResponse.success) {
        const csvData = convertToCSV(contactsResponse.data);
        const blob = new Blob([csvData], { type: 'text/csv' });
        return blob;
      }
      throw new Error('No contacts data available');
    } catch (error) {
      console.error('Error exporting contacts:', error);
      throw error;
    }
  }
};

export default contactApi;
