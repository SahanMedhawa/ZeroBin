import React, { useState } from 'react';
import BaseModal from './BaseModal';

/**
 * Contact Detail Modal Component
 * Follows Single Responsibility Principle - only handles contact detail display and status updates
 * Follows Open/Closed Principle - extends BaseModal without modifying it
 */
const ContactDetailModal = ({ contact, isOpen, onClose, onStatusUpdate }) => {
  const [status, setStatus] = useState(contact?.status || 'new');

  console.log('ContactDetailModal: Props received:', { contact, isOpen, onClose: !!onClose, onStatusUpdate: !!onStatusUpdate });

  // Update status when contact changes
  React.useEffect(() => {
    if (contact) {
      setStatus(contact.status);
    }
  }, [contact]);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    onStatusUpdate(contact._id, newStatus);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!contact) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Contact Details"
      size="md"
    >
      <div className="space-y-6">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <p className="text-sm text-gray-900">{contact.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-sm text-gray-900">{contact.email}</p>
          </div>
          {contact.phone && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <p className="text-sm text-gray-900">{contact.phone}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <p className="text-sm text-gray-900">{formatDate(contact.createdAt)}</p>
          </div>
        </div>

        {/* Subject */}
        {contact.subject && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <p className="text-sm text-gray-900">{contact.subject}</p>
          </div>
        )}

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{contact.message}</p>
          </div>
        </div>

        {/* Status Update */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <div className="flex space-x-2">
            {['new', 'read', 'responded'].map((statusOption) => (
              <button
                key={statusOption}
                onClick={() => handleStatusChange(statusOption)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  status === statusOption
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Close
        </button>
      </div>
    </BaseModal>
  );
};

export default ContactDetailModal;
