// ManagerPlaybookService.js - Service for manager private notes functionality
import { supabase } from './supabaseClient';
import logger from '../utils/secureLogger';

export class ManagerPlaybookService {
  // Get manager's direct reports with note counts
  static async getManagerEmployees() {
    try {
      const { data, error } = await supabase.rpc('get_manager_employees');
      if (error) throw error;
      
      // Parse JSON response
      if (typeof data === 'string') {
        return JSON.parse(data);
      }
      return Array.isArray(data) ? data : (data || []);
    } catch (error) {
      console.error('Error fetching manager employees:', error);
      throw new Error(`Failed to fetch employees: ${error.message}`);
    }
  }

  // Get all notes for a specific employee
  static async getEmployeeNotes(employeeId) {
    try {
      if (!employeeId) {
        throw new Error('Employee ID is required');
      }

      const { data, error } = await supabase.rpc('get_employee_notes', {
        p_employee_id: employeeId
      });
      
      if (error) throw error;
      
      // Check for authorization error in response
      if (data?.error) {
        throw new Error(data.error);
      }
      
      // Parse JSON response
      if (typeof data === 'string') {
        return JSON.parse(data);
      }
      return Array.isArray(data) ? data : (data || []);
    } catch (error) {
      console.error('Error fetching employee notes:', error);
      throw new Error(`Failed to fetch notes: ${error.message}`);
    }
  }

  // Save a new manager note
  static async saveManagerNote(noteData) {
    try {
      // Validate required fields
      if (!noteData.employee_id) {
        throw new Error('Employee ID is required');
      }
      if (!noteData.title?.trim()) {
        throw new Error('Note title is required');
      }
      if (!noteData.content?.trim()) {
        throw new Error('Note content is required');
      }

      logger.logUserAction('save_manager_note_attempt', null, { 
        employee_id: noteData.employee_id,
        category: noteData.category 
      });

      const { data: result, error } = await supabase.rpc('save_manager_note', {
        p_employee_id: noteData.employee_id,
        p_title: noteData.title.trim(),
        p_content: noteData.content.trim(),
        p_category: noteData.category || 'general',
        p_priority: noteData.priority || 'medium'
      });
      
      if (error) throw error;
      
      if (result?.error) {
        logger.logSecurity('manager_note_save_failed', 'warn', { error: result.error });
        throw new Error(result.error);
      }

      logger.logUserAction('save_manager_note_success', null, { 
        employee_id: noteData.employee_id,
        note_id: result.note_id 
      });
      
      return result;
    } catch (error) {
      logger.logError(error, { action: 'save_manager_note', data: noteData });
      throw new Error(`Failed to save note: ${error.message}`);
    }
  }

  // Update an existing manager note
  static async updateManagerNote(noteId, noteData) {
    try {
      // Validate required fields
      if (!noteId) {
        throw new Error('Note ID is required');
      }
      if (!noteData.title?.trim()) {
        throw new Error('Note title is required');
      }
      if (!noteData.content?.trim()) {
        throw new Error('Note content is required');
      }

      logger.logUserAction('update_manager_note_attempt', null, { note_id: noteId });

      const { data: result, error } = await supabase.rpc('update_manager_note', {
        p_note_id: noteId,
        p_title: noteData.title.trim(),
        p_content: noteData.content.trim(),
        p_category: noteData.category || 'general',
        p_priority: noteData.priority || 'medium'
      });
      
      if (error) throw error;
      
      if (result?.error) {
        logger.logSecurity('manager_note_update_failed', 'warn', { 
          note_id: noteId,
          error: result.error 
        });
        throw new Error(result.error);
      }

      logger.logUserAction('update_manager_note_success', null, { note_id: noteId });
      
      return result;
    } catch (error) {
      logger.logError(error, { action: 'update_manager_note', note_id: noteId });
      throw new Error(`Failed to update note: ${error.message}`);
    }
  }

  // Delete a manager note
  static async deleteManagerNote(noteId) {
    try {
      if (!noteId) {
        throw new Error('Note ID is required');
      }

      logger.logUserAction('delete_manager_note_attempt', null, { note_id: noteId });

      const { data: result, error } = await supabase.rpc('delete_manager_note', {
        p_note_id: noteId
      });
      
      if (error) throw error;
      
      if (result?.error) {
        logger.logSecurity('manager_note_delete_failed', 'warn', { 
          note_id: noteId,
          error: result.error 
        });
        throw new Error(result.error);
      }

      logger.logUserAction('delete_manager_note_success', null, { note_id: noteId });
      
      return result;
    } catch (error) {
      logger.logError(error, { action: 'delete_manager_note', note_id: noteId });
      throw new Error(`Failed to delete note: ${error.message}`);
    }
  }
}

export default ManagerPlaybookService;