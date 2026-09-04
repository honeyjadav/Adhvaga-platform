import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
    role: z.enum(['user', 'admin']).default('user'),
  })
  .refine((vals) => vals.password === vals.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const bookingSchema = z.object({
  startDate: z.string().min(1, 'Please choose a start date'),
  travelers: z
    .number({ invalid_type_error: 'Number of travelers is required' })
    .min(1, 'At least 1 traveler is required')
    .max(20, 'Maximum 20 travelers per booking'),
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  phone: z
    .string()
    .min(7, 'Enter a valid phone number')
    .max(15, 'Enter a valid phone number'),
  specialRequests: z.string().max(500, 'Keep requests under 500 characters').optional(),
});

export const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  comment: z
    .string()
    .min(10, 'Review must be at least 10 characters')
    .max(600, 'Keep your review under 600 characters'),
});

export const tourFormSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  category: z.string().min(1, 'Select a category'),
  destination: z.string().min(2, 'Destination is required'),
  price: z.number({ invalid_type_error: 'Price is required' }).positive('Price must be greater than 0'),
  duration: z.number({ invalid_type_error: 'Duration is required' }).positive('Duration must be at least 1 day'),
  maxTravelers: z.number({ invalid_type_error: 'Required' }).positive('Must be at least 1'),
  availableSlots: z.number({ invalid_type_error: 'Required' }).min(0, 'Cannot be negative'),
  summary: z.string().min(10, 'Summary must be at least 10 characters'),
  heroImage: z.string().url('Provide a valid image URL').optional().or(z.literal('')),
});

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  phone: z.string().optional(),
});
