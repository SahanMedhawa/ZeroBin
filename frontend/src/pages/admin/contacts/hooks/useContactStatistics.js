import { useMemo } from 'react';

/**
 * Custom hook for calculating contact statistics
 * Follows Single Responsibility Principle - handles only statistics calculation
 */
export const useContactStatistics = (contacts) => {
  const statistics = useMemo(() => {
    return {
      total: contacts.length,
      new: contacts.filter(contact => contact.status === 'new').length,
      read: contacts.filter(contact => contact.status === 'read').length,
      responded: contacts.filter(contact => contact.status === 'responded').length
    };
  }, [contacts]);

  return statistics;
};
