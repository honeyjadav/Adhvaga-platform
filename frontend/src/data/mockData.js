export const CATEGORIES = ['Mountain', 'Beach', 'Cultural', 'Wildlife', 'Adventure', 'City Break'];

export const REVIEWS = [
  {
    id: 'r1',
    tourId: 't1',
    userName: 'Ananya Rao',
    rating: 5,
    comment: 'Breathtaking views every single day. The guides were incredibly knowledgeable and safety-focused.',
    createdAt: '2026-07-10',
  },
  {
    id: 'r2',
    tourId: 't1',
    userName: 'Karan Mehta',
    rating: 4,
    comment: 'Tough but rewarding trek. Food at the camps could be improved slightly.',
    createdAt: '2026-06-28',
  },
  {
    id: 'r3',
    tourId: 't2',
    userName: 'Priya Nair',
    rating: 5,
    comment: 'Perfect relaxed pace, loved the sunset cruise. Will book again with Adhvaga.',
    createdAt: '2026-05-30',
  },
  {
    id: 'r4',
    tourId: 't3',
    userName: 'Rohan Iyer',
    rating: 5,
    comment: 'The Udaipur lake palace view alone was worth the trip. Extremely well organized.',
    createdAt: '2026-04-22',
  },
];

export const TESTIMONIALS = [
  {
    id: 'te1',
    name: 'Sneha Kapoor',
    quote: 'Adhvaga planned our anniversary trip down to the last detail. Genuinely stress-free travel.',
    location: 'Bengaluru',
  },
  {
    id: 'te2',
    name: 'Vikram Shah',
    quote: 'Booking, payment, and support all in one place. The Himalayan trek was the trip of a lifetime.',
    location: 'Pune',
  },
  {
    id: 'te3',
    name: 'Ishita Sen',
    quote: 'Transparent pricing and a beautifully simple booking flow. Highly recommend for family trips.',
    location: 'Kolkata',
  },
];

export const BOOKINGS = [
  {
    id: 'b1',
    tourId: 't1',
    tourTitle: 'Himalayan Highlands Trek',
    userId: 'u1',
    travelers: 2,
    startDate: '2026-10-12',
    totalPrice: 84000,
    status: 'confirmed',
    createdAt: '2026-08-01',
  },
  {
    id: 'b2',
    tourId: 't2',
    tourTitle: 'Goa Coastal Escape',
    userId: 'u1',
    travelers: 3,
    startDate: '2026-09-20',
    totalPrice: 55500,
    status: 'pending',
    createdAt: '2026-08-15',
  },
  {
    id: 'b3',
    tourId: 't4',
    tourTitle: 'Kabini Wildlife Safari',
    userId: 'u2',
    travelers: 1,
    startDate: '2026-09-05',
    totalPrice: 22000,
    status: 'cancelled',
    createdAt: '2026-07-25',
  },
];

export const USERS = [
  {
    id: 'u1',
    name: 'Demo Traveler',
    email: 'traveler@adhvaga.com',
    role: 'user',
    password: 'password123',
    wishlist: ['t3', 't5'],
  },
  {
    id: 'admin1',
    name: 'Adhvaga Admin',
    email: 'admin@adhvaga.com',
    role: 'admin',
    password: 'admin123',
    wishlist: [],
  },
];

