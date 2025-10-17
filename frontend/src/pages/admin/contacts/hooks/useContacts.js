import { useState, useEffect, useCallback } from 'react';
import { contactApi } from '../../../../api/contactApi';
import { toast } from 'react-toastify';

/**
 * Custom hook for managing contact data and operations
 * Follows Single Responsibility Principle - handles only contact-related state and operations
 */
export const useContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('useContacts: Starting to fetch contacts...');
      
      const response = await contactApi.getAllContacts();
      console.log('useContacts: Received response:', response);
      
      if (response.success) {
        setContacts(response.data);
        console.log('useContacts: Set contacts:', response.data);
      } else {
        console.error('useContacts: Response not successful:', response);
        throw new Error('Failed to fetch contacts');
      }
    } catch (err) {
      console.error('useContacts: Error fetching contacts:', err);
      setError(err.message);
      
      // For debugging - set some mock data if API fails
      console.log('useContacts: Setting mock data for debugging...');
      setContacts([
        {
          _id: 'mock-1',
          name: 'Test User',
          email: 'test@example.com',
          phone: '1234567890',
          subject: 'Test Subject',
          message: 'This is a test message',
          status: 'new',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
      
      toast.error('Failed to fetch contacts - using mock data for debugging');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateContactStatus = useCallback(async (contactId, newStatus) => {
    try {
      const response = await contactApi.updateContactStatus(contactId, newStatus);
      if (response.success) {
        // Update local state
        setContacts(prevContacts =>
          prevContacts.map(contact =>
            contact._id === contactId
              ? { ...contact, status: newStatus }
              : contact
          )
        );
        toast.success('Contact status updated successfully');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating contact status:', err);
      toast.error('Failed to update contact status');
      return false;
    }
  }, []);

  const deleteContact = useCallback(async (contactId) => {
    try {
      const response = await contactApi.deleteContact(contactId);
      if (response.success) {
        // Remove from local state
        setContacts(prevContacts =>
          prevContacts.filter(contact => contact._id !== contactId)
        );
        toast.success('Contact deleted successfully');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting contact:', err);
      toast.error('Failed to delete contact');
      return false;
    }
  }, []);

  const getContactById = useCallback(async (contactId) => {
    try {
      const response = await contactApi.getContactById(contactId);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to fetch contact details');
    } catch (err) {
      console.error('Error fetching contact details:', err);
      toast.error('Failed to fetch contact details');
      throw err;
    }
  }, []);

  const exportContacts = useCallback(async (filters = {}) => {
    try {
      const response = await contactApi.exportContacts(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contacts-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Contacts exported successfully');
      return true;
    } catch (err) {
      console.error('Error exporting contacts:', err);
      toast.error('Failed to export contacts');
      return false;
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return {
    contacts,
    loading,
    error,
    fetchContacts,
    updateContactStatus,
    deleteContact,
    getContactById,
    exportContacts
  };
};
