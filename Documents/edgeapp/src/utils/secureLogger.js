// secureLogger.js - Secure logging utility that prevents sensitive data exposure

/**
 * Secure logger that masks sensitive information
 */
class SecureLogger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.sensitiveFields = [
      'password', 'email', 'token', 'key', 'secret', 
      'auth', 'session', 'user_id', 'api_key'
    ];
  }

  /**
   * Mask sensitive data in objects
   */
  maskSensitiveData(data) {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.maskSensitiveData(item));
    }

    const masked = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = this.sensitiveFields.some(field => 
        lowerKey.includes(field)
      );

      if (isSensitive && typeof value === 'string') {
        // Mask email addresses
        if (value.includes('@')) {
          masked[key] = value.replace(/(.{2}).*@(.*)/, '$1***@$2');
        } else {
          // Mask other sensitive strings
          masked[key] = '***';
        }
      } else if (typeof value === 'object') {
        masked[key] = this.maskSensitiveData(value);
      } else {
        masked[key] = value;
      }
    }

    return masked;
  }

  /**
   * Mask email addresses specifically
   */
  maskEmail(email) {
    if (typeof email !== 'string' || !email.includes('@')) {
      return email;
    }
    return email.replace(/(.{2}).*@(.*)/, '$1***@$2');
  }

  /**
   * Log with automatic sensitive data masking
   */
  log(level, message, data = null) {
    if (!this.isDevelopment && level === 'debug') {
      return; // Skip debug logs in production
    }

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message
    };

    if (data) {
      logEntry.data = this.maskSensitiveData(data);
    }

    // Use appropriate console method
    switch (level) {
      case 'error':
        console.error(`[${timestamp}] ERROR:`, message, data ? logEntry.data : '');
        break;
      case 'warn':
        console.warn(`[${timestamp}] WARN:`, message, data ? logEntry.data : '');
        break;
      case 'info':
        console.info(`[${timestamp}] INFO:`, message, data ? logEntry.data : '');
        break;
      case 'debug':
        if (this.isDevelopment) {
          console.log(`[${timestamp}] DEBUG:`, message, data ? logEntry.data : '');
        }
        break;
      default:
        console.log(`[${timestamp}] LOG:`, message, data ? logEntry.data : '');
    }
  }

  /**
   * Convenience methods
   */
  debug(message, data) {
    this.log('debug', message, data);
  }

  info(message, data) {
    this.log('info', message, data);
  }

  warn(message, data) {
    this.log('warn', message, data);
  }

  error(message, data) {
    this.log('error', message, data);
  }

  /**
   * Log authentication events securely
   */
  logAuth(action, userId = null, success = true) {
    this.info(`Auth: ${action}`, {
      user_id: userId ? `***${userId.slice(-4)}` : null,
      success,
      action
    });
  }

  /**
   * Log user actions securely
   */
  logUserAction(action, userId, details = {}) {
    this.info(`User Action: ${action}`, {
      user_id: userId ? `***${userId.slice(-4)}` : null,
      action,
      details: this.maskSensitiveData(details)
    });
  }

  /**
   * Log security events
   */
  logSecurity(event, severity = 'info', details = {}) {
    this.log(severity, `Security: ${event}`, {
      security_event: event,
      details: this.maskSensitiveData(details)
    });
  }

  /**
   * Log errors without sensitive data
   */
  logError(error, context = {}) {
    this.error('Application Error', {
      message: error.message,
      stack: this.isDevelopment ? error.stack : null,
      context: this.maskSensitiveData(context)
    });
  }
}

// Create singleton instance
const logger = new SecureLogger();

export default logger;

// Export convenience methods
export const { debug, info, warn, error, logAuth, logUserAction, logSecurity, logError } = logger;