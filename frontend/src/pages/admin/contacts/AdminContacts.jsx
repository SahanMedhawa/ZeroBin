import React, { useState } from 'react';
import AdminDrawer from '../components/AdminDrawer';
import { useContacts } from './hooks/useContacts';
import { useContactFilters } from './hooks/useContactFilters';
import { useContactStatistics } from './hooks/useContactStatistics';
import ContactStatistics from './components/ContactStatistics';
import ContactFilters from './components/ContactFilters';
import ContactTable from './components/ContactTable';
import ContactDetailModal from './components/modals/ContactDetailModal';
import DeleteConfirmationModal from './components/modals/DeleteConfirmationModal';

/**
 * Admin Contacts Component
 * Follows Single Responsibility Principle - orchestrates contact management
 * Follows Dependency Inversion Principle - depends on abstractions (hooks) not concrete implementations
 * Follows Open/Closed Principle - open for extension through composition
 */
const AdminContacts = () => {
  // Custom hooks for separation of concerns
  const {
    contacts,
    loading,
    updateContactStatus,
    deleteContact,
    getContactById,
    exportContacts
  } = useContacts();

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    filteredContacts,
    clearFilters
  } = useContactFilters(contacts);

  const statistics = useContactStatistics(contacts);

  // Modal state management
  const [selectedContact, setSelectedContact] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);

  // Event handlers following Single Responsibility Principle
  const handleViewContact = async (contactId) => {
    try {
      console.log('AdminContacts: Viewing contact with ID:', contactId);
      const contact = await getContactById(contactId);
      console.log('AdminContacts: Retrieved contact:', contact);
      setSelectedContact(contact);
      setShowDetailModal(true);
      console.log('AdminContacts: Modal should be open now');
    } catch (error) {
      console.error('AdminContacts: Error viewing contact:', error);
      // Error handling is done in the hook
    }
  };

  const handleDeleteContact = async () => {
    if (!contactToDelete) return;
    
    const success = await deleteContact(contactToDelete._id);
    if (success) {
      setShowDeleteModal(false);
      setContactToDelete(null);
    }
  };

  const handleStatusUpdate = async (contactId, newStatus) => {
    const success = await updateContactStatus(contactId, newStatus);
    if (success) {
      setShowDetailModal(false);
    }
  };

  const handleExportContacts = async () => {
    const filters = {
      status: statusFilter !== 'all' ? statusFilter : undefined,
      dateRange: dateFilter !== 'all' ? dateFilter : undefined
    };
    await exportContacts(filters);
  };

  const handleDeleteClick = (contact) => {
    setContactToDelete(contact);
    setShowDeleteModal(true);
  };

  // Loading state
  if (loading) {
    return (
      <AdminDrawer>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AdminDrawer>
    );
  }

  return (
    <AdminDrawer>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-indigo-800 bg-clip-text text-transparent mb-2">
                Contact Management
              </h1>
              <p className="text-gray-600">Manage and respond to user inquiries</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExportContacts}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <ContactStatistics statistics={statistics} />

        {/* Filters */}
        <ContactFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          onClearFilters={clearFilters}
        />

        {/* Contacts Table */}
        <ContactTable
          contacts={filteredContacts}
          onViewContact={handleViewContact}
          onDeleteContact={handleDeleteClick}
        />
      </div>

      {/* Modals */}
      <ContactDetailModal
        contact={selectedContact}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onStatusUpdate={handleStatusUpdate}
      />

      <DeleteConfirmationModal
        contact={contactToDelete}
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setContactToDelete(null);
        }}
        onConfirm={handleDeleteContact}
      />
    </AdminDrawer>
  );
};

export default AdminContacts;
