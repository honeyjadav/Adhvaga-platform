import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { Compass, Mail, Lock, User as UserIcon } from 'lucide-react';
import { registerSchema } from '../utils/validationSchemas.js';
import { register as registerUser } from '../redux/slices/authSlice.js';
import { useToast } from '../context/ToastContext.jsx';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'user' },
  });

  const onSubmit = async (values) => {
    try {
      await dispatch(registerUser(values)).unwrap();
      success('Account created — welcome to Adhvaga!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toastError(typeof err === 'string' ? err : 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-lagoon-600 text-white">
          <Compass size={22} />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold text-lagoon-900">Create your account</h1>
        <p className="mt-1 text-sm text-lagoon-500">Start planning your next trip in minutes.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5 p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-lagoon-700">Full name</label>
          <div className="relative">
            <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lagoon-400" />
            <input className="input-field pl-10" placeholder="Jane Doe" {...register('name')} />
          </div>
          {errors.name && <p className="field-error">{errors.name.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-lagoon-700">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lagoon-400" />
            <input type="email" className="input-field pl-10" placeholder="you@example.com" {...register('email')} />
          </div>
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-lagoon-700">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lagoon-400" />
              <input type="password" className="input-field pl-10" placeholder="••••••••" {...register('password')} />
            </div>
            {errors.password && <p className="field-error">{errors.password.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-lagoon-700">Confirm</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lagoon-400" />
              <input type="password" className="input-field pl-10" placeholder="••••••••" {...register('confirmPassword')} />
            </div>
            {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-lagoon-700">Account type</label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-3">
                {['user', 'admin'].map((role) => (
                  <button
                    type="button"
                    key={role}
                    onClick={() => field.onChange(role)}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-semibold capitalize transition ${
                      field.value === role
                        ? 'border-lagoon-600 bg-lagoon-600 text-white'
                        : 'border-sand-200 text-lagoon-600 hover:border-lagoon-300'
                    }`}
                  >
                    {role === 'user' ? 'Traveler' : 'Admin'}
                  </button>
                ))}
              </div>
            )}
          />
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-lagoon-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-lagoon-700 hover:underline">Log in</Link>
      </p>
    </div>
  );
}
