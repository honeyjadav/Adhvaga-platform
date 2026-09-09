import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { Compass, Mail, Lock, KeyRound } from 'lucide-react';
import { loginSchema } from '../utils/validationSchemas.js';
import { login, verifyLoginOtp } from '../redux/slices/authSlice.js';
import { useToast } from '../context/ToastContext.jsx';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error: toastError } = useToast();
  const [step, setStep] = useState('credentials');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: formIsSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onCredentialsSubmit = async (values) => {
    try {
      setEmail(values.email);
      await dispatch(login(values)).unwrap();
      success('Verification code sent to your email!');
      setStep('otp');
    } catch (err) {
      toastError(typeof err === 'string' ? err : 'Login failed. Please check your email and password.');
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toastError('Please enter a valid 6-digit code');
      return;
    }
    setIsSubmitting(true);
    try {
      await dispatch(verifyLoginOtp({ email, otp })).unwrap();
      success('Welcome back!');
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toastError(typeof err === 'string' ? err : 'Invalid or expired verification code.');
      setOtp('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToCredentials = () => {
    setStep('credentials');
    setOtp('');
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-lagoon-600 text-white">
          <Compass size={22} />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold text-lagoon-900">Welcome back</h1>
        <p className="mt-1 text-sm text-lagoon-500">
          {step === 'credentials' ? 'Log in to manage your trips and bookings.' : 'Enter your verification code'}
        </p>
      </div>

      {step === 'credentials' ? (
        <form onSubmit={handleSubmit(onCredentialsSubmit)} className="card space-y-5 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-lagoon-700">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lagoon-400" />
              <input type="email" className="input-field pl-10" placeholder="you@example.com" {...register('email')} />
            </div>
            {errors.email && <p className="field-error">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-lagoon-700">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lagoon-400" />
              <input type="password" className="input-field pl-10" placeholder="••••••••" {...register('password')} />
            </div>
            {errors.password && <p className="field-error">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={formIsSubmitting} className="btn-primary w-full">
            {formIsSubmitting ? 'Verifying...' : 'Continue'}
          </button>

          <div className="text-center text-sm">
            <Link to="/forgot-password" className="font-semibold text-lagoon-700 hover:underline">Forgot password?</Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit} className="card space-y-5 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-lagoon-700">6-digit Verification Code</label>
            <p className="mb-2 text-xs text-lagoon-500">Check your email for the code</p>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lagoon-400" />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="input-field pl-10 tracking-[0.35em]"
                placeholder="000000"
              />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting || otp.length !== 6} className="btn-primary w-full">
            {isSubmitting ? 'Verifying...' : 'Verify & Sign In'}
          </button>

          <button type="button" onClick={handleBackToCredentials} className="btn-secondary w-full">
            Back to Email & Password
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-lagoon-500">
        New to Adhvaga?{' '}
        <Link to="/register" className="font-semibold text-lagoon-700 hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
