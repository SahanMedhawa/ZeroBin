import React, { useState, useCallback, useRef, useEffect } from 'react';

const AddNoteModal = ({ 
  isOpen, 
  onClose, 
  onAddNote, 
  addingNote = false 
}) => {
  const [noteContent, setNoteContent] = useState('');
  const textareaRef = useRef(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setNoteContent('');
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
  const handleNoteContentChange = useCallback((e) => {
    const newValue = e.target.value;
    setNoteContent(newValue);
  }, []);

  const handleClose = useCallback(() => {
    setNoteContent('');
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (noteContent.trim()) {
      try {
        await onAddNote(noteContent);
        // Close modal after successful note addition
        handleClose();
      } catch (error) {
        // Error handling is done in the parent component
        console.error('Error adding note:', error);
      }
    }
  }, [noteContent, onAddNote, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Add Update</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Update Message</label>
              <textarea
                ref={textareaRef}
                value={noteContent}
                onChange={handleNoteContentChange}
                placeholder="Provide an update on the progress, additional information, or next steps..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                maxLength={500}
                style={{ direction: 'ltr', textAlign: 'left' }}
                dir="ltr"
                required
              />
              <p className="text-xs text-gray-500 mt-1">{noteContent.length}/500 characters</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={addingNote}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addingNote || !noteContent.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {addingNote ? 'Adding...' : 'Add Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNoteModal;
