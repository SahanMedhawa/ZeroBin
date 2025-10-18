import React from 'react';

/**
 * Contact Row Component
 * Follows Single Responsibility Principle - only displays a single contact row
 */
export const ContactRow = ({ contact, onView, onDelete }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { label: 'New', classes: 'bg-blue-100 text-blue-800' },
      read: { label: 'Read', classes: 'bg-yellow-100 text-yellow-800' },
      responded: { label: 'Responded', classes: 'bg-green-100 text-green-800' }
    };
    
    const config = statusConfig[status] || { label: status, classes: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.classes}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">{contact.name}</div>
          <div className="text-sm text-gray-500">{contact.email}</div>
          {contact.phone && (
            <div className="text-sm text-gray-500">{contact.phone}</div>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">
          {contact.subject || 'No subject'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(contact.status)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(contact.createdAt)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          <button
            onClick={() => onView(contact._id)}
            className="text-blue-600 hover:text-blue-900"
          >
            View
          </button>
          <button
            onClick={() => onDelete(contact)}
            className="text-red-600 hover:text-red-900"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};
