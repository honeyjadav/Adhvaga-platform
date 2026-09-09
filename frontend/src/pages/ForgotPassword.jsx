import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import apiCallService from '../services/APICallService.js';
import { useToast } from '../context/ToastContext.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const { data } = await apiCallService.forgotPassword(email.trim());
      setSent(true);
      success(data.message || 'Check your email for a reset link.');
    } catch (requestError) {
      error(requestError.message || 'Could not request a password reset.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="card space-y-5 p-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-lagoon-900">Reset your password</h1>
          <p className="mt-2 text-sm text-lagoon-500">Enter your account email and we will send a reset link.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lagoon-400" />
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="input-field pl-10" placeholder="you@example.com" />
          </div>
          <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? 'Sending...' : 'Send reset link'}</button>
        </form>
        {sent && <p className="rounded-xl bg-sand-100 p-3 text-sm text-lagoon-600">Check your inbox, including spam or promotions.</p>}
        <p className="text-center text-sm text-lagoon-500"><Link to="/login" className="font-semibold text-lagoon-700 hover:underline">Back to login</Link></p>
      </div>
    </div>
  );
}