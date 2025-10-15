import React, { useState, useCallback, useRef, useEffect } from 'react';

const ResolveModal = ({ 
  isOpen, 
  onClose, 
  onResolve, 
  grievance,
  resolving = false 
}) => {
  const [resolutionNote, setResolutionNote] = useState('');
  const textareaRef = useRef(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setResolutionNote('');
    }
  }, [isOpen]);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Memoized onChange handler to prevent re-renders
  const handleResolutionNoteChange = useCallback((e) => {
    const newValue = e.target.value;
    setResolutionNote(newValue);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (resolutionNote.trim()) {
      onResolve(resolutionNote);
    }
  }, [resolutionNote, onResolve]);

  const handleClose = useCallback(() => {
    setResolutionNote('');
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Resolve Grievance</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Resolution Details *</label>
              <textarea
                ref={textareaRef}
                value={resolutionNote}
                onChange={handleResolutionNoteChange}
                placeholder="Describe how the issue was resolved, what actions were taken, and any follow-up needed..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={5}
                maxLength={1000}
                style={{ direction: 'ltr', textAlign: 'left' }}
                dir="ltr"
                required
              />
              <p className="text-xs text-gray-500 mt-1">{resolutionNote.length}/1000 characters</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                <strong>Note:</strong> Once resolved, this grievance will be marked as "Resolved" and the user will be notified.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={resolving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={resolving || !resolutionNote.trim()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {resolving ? 'Resolving...' : 'Resolve Grievance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResolveModal;
