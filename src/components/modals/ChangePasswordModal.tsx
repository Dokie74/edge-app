// Forced Password Change Modal for new employees
import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Eye, EyeOff, Lock, AlertTriangle, CheckCircle } from 'lucide-react';

interface ChangePasswordModalProps {
  isRequired: boolean; // Whether this is a forced password change
  onSuccess: () => void;
  onCancel?: () => void; // Only available if not required
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  isValid: boolean;
}

export default function ChangePasswordModal({ isRequired, onSuccess, onCancel }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const evaluatePasswordStrength = (password: string): PasswordStrength => {
    const feedback = [];
    let score = 0;

    if (password.length >= 8) score += 1;
    else feedback.push('At least 8 characters');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Include uppercase letters');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Include numbers');

    if (/[^a-zA-Z\d]/.test(password)) score += 1;
    else feedback.push('Include special characters (!@#$%^&*)');

    if (password.length >= 12) score += 1;

    return {
      score,
      feedback,
      isValid: score >= 4 && password.length >= 8
    };
  };

  const passwordStrength = evaluatePasswordStrength(newPassword);

  const getStrengthColor = (score: number) => {
    if (score <= 2) return 'text-red-400 bg-red-900/20';
    if (score <= 4) return 'text-yellow-400 bg-yellow-900/20';
    return 'text-green-400 bg-green-900/20';
  };

  const getStrengthLabel = (score: number) => {
    if (score <= 2) return 'Weak';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  const validateForm = () => {
    if (!currentPassword.trim()) {
      setError('Current password is required');
      return false;
    }
    if (!passwordStrength.isValid) {
      setError('Password does not meet requirements');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return false;
    }
    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      // Update password with Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw updateError;
      }

      // Update employee record to clear must_change_password flag
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: employeeError } = await supabase
          .from('employees')
          .update({ 
            must_change_password: false,
            temp_password: null // Clear temp password
          })
          .eq('user_id', user.id);

        if (employeeError) {
          console.warn('Error updating employee record:', employeeError);
          // Don't throw - password was updated successfully
        }
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.message?.includes('Invalid login credentials') || 
          error.message?.includes('current password')) {
        setError('Current password is incorrect');
      } else {
        setError(error.message || 'Failed to change password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 text-center">
          <CheckCircle className="mx-auto text-green-400 mb-4" size={48} />
          <h2 className="text-xl font-bold text-white mb-2">Password Changed Successfully!</h2>
          <p className="text-gray-300">You can now access all features of the system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
        <div className="flex items-center mb-6">
          <Lock className="text-cyan-400 mr-3" size={24} />
          <div>
            <h2 className="text-xl font-bold text-white">
              {isRequired ? 'Change Your Password' : 'Update Password'}
            </h2>
            {isRequired && (
              <p className="text-gray-300 text-sm mt-1">
                You must change your password before continuing
              </p>
            )}
          </div>
        </div>

        {isRequired && (
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="text-yellow-400 flex-shrink-0" size={16} />
              <p className="text-yellow-300 text-sm">
                For security, you must create a new password on your first login.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white pr-10"
                placeholder="Enter your current password"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-2 top-2 text-gray-400 hover:text-white"
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white pr-10"
                placeholder="Create a strong password"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-2 top-2 text-gray-400 hover:text-white"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="mt-2">
                <div className={`text-xs px-2 py-1 rounded ${getStrengthColor(passwordStrength.score)}`}>
                  Strength: {getStrengthLabel(passwordStrength.score)}
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <ul className="mt-1 text-xs text-gray-400 space-y-1">
                    {passwordStrength.feedback.map((item, index) => (
                      <li key={index} className="flex items-center space-x-1">
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white pr-10"
                placeholder="Confirm your new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-2 text-gray-400 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading || !passwordStrength.isValid || newPassword !== confirmPassword}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded transition-colors"
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
            
            {!isRequired && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Security Note */}
        <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
          <p className="text-gray-400 text-xs">
            💡 <strong>Security Tip:</strong> Use a unique password that you don't use elsewhere. 
            Consider using a password manager to generate and store strong passwords.
          </p>
        </div>
      </div>
    </div>
  );
}