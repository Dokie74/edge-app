// Standardized Realtime Service - Centralized channel management
// Implements peer review recommendation for consistent channel naming

import { supabase } from './supabaseClient';

/**
 * Centralized realtime service with standardized channel naming
 * Channel naming convention: "public:{table_name}" for consistency
 */
export class RealtimeService {
  static channels = new Map();

  /**
   * Subscribe to table changes with standardized channel naming
   * @param {string} table - Table name (e.g., 'kudos', 'notifications')
   * @param {function} callback - Change handler function
   * @param {object} options - Subscription options
   * @returns {object} Channel subscription
   */
  static subscribeToTable(table, callback, options = {}) {
    const {
      event = '*',
      schema = 'public',
      filter = null
    } = options;

    // Use standardized channel naming: "public:table_name"
    const channelName = `public:${table}`;
    
    try {
      // Check if channel already exists to prevent duplicates
      if (this.channels.has(channelName)) {
        console.warn(`Channel ${channelName} already exists. Unsubscribing existing before creating new.`);
        this.unsubscribe(channelName);
      }

      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event,
            schema,
            table,
            ...(filter && { filter })
          },
          callback
        )
        .subscribe();

      // Store channel reference for cleanup
      this.channels.set(channelName, channel);
      
      console.log(`✅ Subscribed to ${channelName}`);
      return channel;
    } catch (error) {
      console.error(`Failed to subscribe to ${channelName}:`, error);
      return null;
    }
  }

  /**
   * Subscribe to kudos changes (public kudos wall)
   * @param {function} callback - Change handler
   * @returns {object} Channel subscription
   */
  static subscribeToKudos(callback) {
    return this.subscribeToTable('kudos', callback, {
      event: '*',
      filter: 'is_public=eq.true'
    });
  }

  /**
   * Subscribe to notifications for specific user
   * @param {string} userId - User ID to filter notifications
   * @param {function} callback - Change handler
   * @returns {object} Channel subscription
   */
  static subscribeToNotifications(userId, callback) {
    return this.subscribeToTable('notifications', callback, {
      event: 'INSERT',
      filter: `recipient_id=eq.${userId}`
    });
  }

  /**
   * Subscribe to assessment changes for real-time updates
   * @param {function} callback - Change handler
   * @returns {object} Channel subscription
   */
  static subscribeToAssessments(callback) {
    return this.subscribeToTable('assessments', callback);
  }

  /**
   * Subscribe to employee changes (admin dashboard)
   * @param {function} callback - Change handler
   * @returns {object} Channel subscription
   */
  static subscribeToEmployees(callback) {
    return this.subscribeToTable('employees', callback);
  }

  /**
   * Subscribe to review cycle changes
   * @param {function} callback - Change handler
   * @returns {object} Channel subscription
   */
  static subscribeToReviewCycles(callback) {
    return this.subscribeToTable('review_cycles', callback);
  }

  /**
   * Unsubscribe from a specific channel
   * @param {string} channelName - Channel name to unsubscribe from
   */
  static unsubscribe(channelName) {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
      console.log(`❌ Unsubscribed from ${channelName}`);
    } else {
      console.warn(`Channel ${channelName} not found for unsubscription`);
    }
  }

  /**
   * Unsubscribe from all channels (cleanup on logout/unmount)
   */
  static unsubscribeAll() {
    console.log(`🧹 Cleaning up ${this.channels.size} realtime channels`);
    
    for (const [channelName, channel] of this.channels) {
      supabase.removeChannel(channel);
      console.log(`❌ Unsubscribed from ${channelName}`);
    }
    
    this.channels.clear();
  }

  /**
   * Get list of active channels (for debugging)
   * @returns {Array} Array of active channel names
   */
  static getActiveChannels() {
    return Array.from(this.channels.keys());
  }

  /**
   * Health check - verify channels are properly subscribed
   * @returns {object} Channel health status
   */
  static getChannelHealth() {
    const activeChannels = this.getActiveChannels();
    const channelDetails = {};
    
    for (const [channelName, channel] of this.channels) {
      channelDetails[channelName] = {
        state: channel.state,
        joinRef: channel.joinRef,
        listeners: channel.bindings ? channel.bindings.length : 0
      };
    }

    return {
      totalChannels: activeChannels.length,
      activeChannels,
      details: channelDetails
    };
  }
}

// Legacy compatibility wrapper for existing NotificationService
export const NotificationService = {
  subscribeToNotifications: (userId, callback) => 
    RealtimeService.subscribeToNotifications(userId, callback),
  
  unsubscribeFromNotifications: (subscription) => {
    // Try to find and remove the channel
    for (const [channelName, channel] of RealtimeService.channels) {
      if (channel === subscription) {
        RealtimeService.unsubscribe(channelName);
        return;
      }
    }
    
    // Fallback to direct removal
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  }
};

export default RealtimeService;