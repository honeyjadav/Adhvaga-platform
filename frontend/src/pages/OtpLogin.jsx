import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Compass, Mail, KeyRound } from 'lucide-react';
import { requestOtp, verifyOtp } from '../redux/slices/authSlice.js';
import { useToast } from '../context/ToastContext.jsx';

export default function OtpLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error: toastError } = useToast();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const sendCode = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await dispatch(requestOtp(email.trim())).unwrap();
      setSent(true);
      success(result.message || 'Check your email for the OTP.');
    } catch (err) {
      toastError(typeof err === 'string' ? err : 'Could not send OTP.');
    } finally {
      setBusy(false);
    }
  };

  const confirmCode = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await dispatch(verifyOtp({ email: email.trim(), otp })).unwrap();
      success('Welcome back!');
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      toastError(typeof err === 'string' ? err : 'OTP verification failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-lagoon-600 text-white">
          <Compass size={22} />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold text-lagoon-900">Sign in with email OTP</h1>
        <p className="mt-1 text-sm text-lagoon-500">We will send a one-time code to your email.</p>
      </div>

      <form onSubmit={sent ? confirmCode : sendCode} className="card space-y-5 p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-lagoon-700">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lagoon-400" />
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="input-field pl-10" placeholder="you@example.com" />
          </div>
        </div>

        {sent && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-lagoon-700">6-digit OTP</label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lagoon-400" />
              <input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))} className="input-field pl-10 tracking-[0.35em]" placeholder="123456" />
            </div>
          </div>
        )}

        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? 'Please wait...' : sent ? 'Verify & Sign In' : 'Send OTP'}
        </button>
        {sent && <button type="button" onClick={sendCode} disabled={busy} className="btn-secondary w-full">Resend OTP</button>}
      </form>

      <p className="mt-6 text-center text-sm text-lagoon-500">
        Prefer a password? <Link to="/login" className="font-semibold text-lagoon-700 hover:underline">Sign in normally</Link>
      </p>
    </div>
  );
}