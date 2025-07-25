import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Edit3, Save, X, User, Clock, MessageSquare, Target, Star } from 'lucide-react';
import { useApp } from '../../contexts';
import { Button, LoadingSpinner, ErrorMessage } from '../ui';
import { formatDate } from '../../utils';
import ManagerPlaybookService from '../../services/ManagerPlaybookService';

const ManagerPlaybook = () => {
  const { userRole } = useApp();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'medium'
  });

  useEffect(() => {
    if (userRole !== 'manager' && userRole !== 'admin') {
      setError('Access denied. Manager Playbook is only available to managers and admins.');
      setLoading(false);
      return;
    }
    fetchEmployees();
  }, [userRole]);

  useEffect(() => {
    if (selectedEmployee) {
      fetchEmployeeNotes(selectedEmployee.employee_id);
    }
  }, [selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await ManagerPlaybookService.getManagerEmployees();
      setEmployees(data);
      
      if (data.length > 0) {
        setSelectedEmployee(data[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeNotes = async (employeeId) => {
    try {
      const data = await ManagerPlaybookService.getEmployeeNotes(employeeId);
      setNotes(data);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setNotes([]);
    }
  };

  const handleSaveNote = async () => {
    try {
      // Validate note
      if (!newNote.title.trim() || !newNote.content.trim()) {
        alert('Please provide both title and content for the note.');
        return;
      }

      const noteData = {
        employee_id: selectedEmployee.employee_id,
        title: newNote.title,
        content: newNote.content,
        category: newNote.category,
        priority: newNote.priority
      };

      await ManagerPlaybookService.saveManagerNote(noteData);
      
      // Refresh notes list
      await fetchEmployeeNotes(selectedEmployee.employee_id);
      
      setNewNote({ title: '', content: '', category: 'general', priority: 'medium' });
      setShowAddNote(false);
      
    } catch (err) {
      alert('Error saving note: ' + err.message);
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNewNote({
      title: note.title,
      content: note.content,
      category: note.category,
      priority: note.priority
    });
    setShowAddNote(true);
  };

  const handleUpdateNote = async () => {
    try {
      const noteData = {
        title: newNote.title,
        content: newNote.content,
        category: newNote.category,
        priority: newNote.priority
      };

      await ManagerPlaybookService.updateManagerNote(editingNote.id, noteData);
      
      // Refresh notes list
      await fetchEmployeeNotes(selectedEmployee.employee_id);
      
      setEditingNote(null);
      setNewNote({ title: '', content: '', category: 'general', priority: 'medium' });
      setShowAddNote(false);
      
    } catch (err) {
      alert('Error updating note: ' + err.message);
    }
  };

  const handleCancelNote = () => {
    setShowAddNote(false);
    setEditingNote(null);
    setNewNote({ title: '', content: '', category: 'general', priority: 'medium' });
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.job_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    { value: 'general', label: 'General Notes', color: 'bg-gray-600' },
    { value: 'performance', label: 'Performance', color: 'bg-blue-600' },
    { value: 'development', label: 'Development', color: 'bg-green-600' },
    { value: 'personal', label: 'Personal', color: 'bg-purple-600' },
    { value: 'goals', label: 'Goals', color: 'bg-yellow-600' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-gray-400' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
    { value: 'high', label: 'High', color: 'text-red-400' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
  ];

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" message="Loading Manager Playbook..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorMessage error={error} title="Manager Playbook Error" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center">
              <BookOpen className="mr-3 text-cyan-400" size={36} />
              Manager's Playbook
            </h1>
            <p className="text-gray-400 mt-2">
              Private notes and coaching insights for your direct reports
            </p>
          </div>
          <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4 border border-blue-700">
            <p className="text-blue-200 text-sm font-medium">🔒 Confidential</p>
            <p className="text-blue-300 text-xs">Notes are private and visible only to you</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Employee List */}
        <div className="bg-gray-800 rounded-lg shadow-2xl">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Team Members</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
            {filteredEmployees.map(employee => (
              <button
                key={employee.employee_id}
                onClick={() => setSelectedEmployee(employee)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedEmployee?.employee_id === employee.employee_id
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <User size={16} className="text-cyan-400" />
                  <div>
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-xs opacity-75">{employee.job_title}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Notes Section */}
        <div className="lg:col-span-2 space-y-6">
          {selectedEmployee ? (
            <>
              {/* Employee Header */}
              <div className="bg-gray-800 rounded-lg shadow-2xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center">
                      <User className="text-white" size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedEmployee.name}</h2>
                      <p className="text-gray-400">{selectedEmployee.job_title}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowAddNote(true)}
                    variant="primary"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Note
                  </Button>
                </div>
              </div>

              {/* Add/Edit Note Form */}
              {showAddNote && (
                <div className="bg-gray-800 rounded-lg shadow-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      {editingNote ? 'Edit Note' : 'Add New Note'}
                    </h3>
                    <button
                      onClick={handleCancelNote}
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={newNote.title}
                        onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="Brief note title..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Category
                        </label>
                        <select
                          value={newNote.category}
                          onChange={(e) => setNewNote(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        >
                          {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Priority
                        </label>
                        <select
                          value={newNote.priority}
                          onChange={(e) => setNewNote(prev => ({ ...prev, priority: e.target.value }))}
                          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        >
                          {priorities.map(priority => (
                            <option key={priority.value} value={priority.value}>{priority.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Content *
                      </label>
                      <textarea
                        value={newNote.content}
                        onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        rows={4}
                        placeholder="Your private notes about this team member..."
                      />
                    </div>

                    <div className="flex justify-end space-x-3">
                      <Button
                        onClick={handleCancelNote}
                        variant="secondary"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={editingNote ? handleUpdateNote : handleSaveNote}
                        variant="primary"
                      >
                        <Save size={16} className="mr-2" />
                        {editingNote ? 'Update Note' : 'Save Note'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes List */}
              <div className="bg-gray-800 rounded-lg shadow-2xl">
                <div className="p-6 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">
                    Notes for {selectedEmployee.name} ({notes.length})
                  </h3>
                </div>

                <div className="p-6">
                  {notes.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare size={48} className="mx-auto text-gray-500 mb-4" />
                      <h4 className="text-white text-lg mb-2">No notes yet</h4>
                      <p className="text-gray-400 mb-6">
                        Start building your coaching insights by adding the first note for {selectedEmployee.name}.
                      </p>
                      <Button
                        onClick={() => setShowAddNote(true)}
                        variant="primary"
                      >
                        <Plus size={16} className="mr-2" />
                        Add First Note
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notes.map(note => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          categories={categories}
                          priorities={priorities}
                          onEdit={handleEditNote}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-800 rounded-lg shadow-2xl p-12 text-center">
              <User size={64} className="mx-auto text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Select a Team Member
              </h3>
              <p className="text-gray-400">
                Choose a team member from the list to view and manage their coaching notes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Note Card Component
const NoteCard = ({ note, categories, priorities, onEdit }) => {
  const category = categories.find(c => c.value === note.category);
  const priority = priorities.find(p => p.value === note.priority);

  return (
    <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="text-white font-medium">{note.title}</h4>
            <span className={`px-2 py-1 text-xs rounded ${category?.color} text-white`}>
              {category?.label}
            </span>
            <span className={`text-xs font-medium ${priority?.color}`}>
              {priority?.label} Priority
            </span>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{note.content}</p>
        </div>
        <button
          onClick={() => onEdit(note)}
          className="text-gray-400 hover:text-cyan-400 transition-colors ml-4"
        >
          <Edit3 size={16} />
        </button>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center">
          <Clock size={12} className="mr-1" />
          {formatDate(note.created_at)}
        </span>
        {note.updated_at && note.updated_at !== note.created_at && (
          <span>Updated {formatDate(note.updated_at)}</span>
        )}
      </div>
    </div>
  );
};

export default ManagerPlaybook;