import React, { useState, useEffect } from 'react';
import { Plus, FileText } from 'lucide-react';
import { useLongStayNotesStore } from '../../stores/useLongStayNotesStore';
import { formatDate, formatTime } from '../../utils/dateFormat';

interface LongStayNotesProps {
  patientId: number;
  isOpen: boolean;
  onClose: () => void;
}

const LongStayNotes: React.FC<LongStayNotesProps> = ({ patientId, isOpen, onClose }) => {
  const { notes, loading, error, fetchNotes, addNote } = useLongStayNotesStore();
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  useEffect(() => {
    if (isOpen && patientId) {
      fetchNotes(patientId);
    }
  }, [isOpen, patientId, fetchNotes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      await addNote(patientId, newNote);
      setNewNote('');
      setIsAddingNote(false);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Long Stay Notes</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {!isAddingNote && (
            <button
              onClick={() => setIsAddingNote(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 mb-6"
            >
              <Plus className="h-4 w-4" />
              <span>Add Note</span>
            </button>
          )}

          {isAddingNote && (
            <form onSubmit={handleSubmit} className="mb-6">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent mb-4"
                placeholder="Enter your note..."
                required
              />
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNote(false);
                    setNewNote('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save Note
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-red-600 bg-red-50 p-4 rounded-lg">
              {error}
            </div>
          ) : notes[patientId]?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2" />
              <p>No notes available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes[patientId]?.map((note) => (
                <div
                  key={note.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {note.created_by.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(note.created_at)} at {formatTime(note.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-600 whitespace-pre-wrap">{note.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LongStayNotes;