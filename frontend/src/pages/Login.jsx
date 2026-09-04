import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { Compass, Mail, Lock } from 'lucide-react';
import { loginSchema } from '../utils/validationSchemas.js';
import { login } from '../redux/slices/authSlice.js';
import { useToast } from '../context/ToastContext.jsx';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error: toastError } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values) => {
    try {
      await dispatch(login(values)).unwrap();
      success('Welcome back!');
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toastError(typeof err === 'string' ? err : 'Login failed. Please try again.');
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-lagoon-600 text-white">
          <Compass size={22} />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold text-lagoon-900">Welcome back</h1>
        <p className="mt-1 text-sm text-lagoon-500">Log in to manage your trips and bookings.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5 p-6">
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

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? 'Logging in...' : 'Log In'}
        </button>

        <div className="rounded-xl bg-sand-100 p-3 text-xs text-lagoon-500">
          Demo accounts — Traveler: <strong>traveler@adhvaga.com</strong> / <strong>password123</strong><br />
          Admin: <strong>admin@adhvaga.com</strong> / <strong>admin123</strong>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-lagoon-500">
        New to Adhvaga?{' '}
        <Link to="/register" className="font-semibold text-lagoon-700 hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
