import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import apiCallService from '../services/APICallService.js';
import { useToast } from '../context/ToastContext.jsx';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password.length < 6) return error('Password must be at least 6 characters.');
    if (password !== confirmPassword) return error('Passwords do not match.');
    setBusy(true);
    try {
      const { data } = await apiCallService.resetPassword({ token, newPassword: password });
      success(data.message || 'Password reset successfully.');
      navigate('/login', { replace: true });
    } catch (requestError) {
      error(requestError.message || 'Could not reset password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <form onSubmit={handleSubmit} className="card space-y-5 p-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-lagoon-900">Choose a new password</h1>
          <p className="mt-2 text-sm text-lagoon-500">Use at least six characters.</p>
        </div>
        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lagoon-400" />
          <input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} className="input-field pl-10" placeholder="New password" />
        </div>
        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lagoon-400" />
          <input type="password" required minLength={6} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="input-field pl-10" placeholder="Confirm password" />
        </div>
        <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? 'Updating...' : 'Update password'}</button>
        <p className="text-center text-sm text-lagoon-500"><Link to="/login" className="font-semibold text-lagoon-700 hover:underline">Back to login</Link></p>
      </form>
    </div>
  );
}