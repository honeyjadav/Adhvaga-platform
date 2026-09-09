const Tour = require('../models/Tour');

const tours = [
  {
    title: 'Himalayan Highlands Trek', category: 'Mountain', destination: 'Manali, India', price: 42000, duration: 7,
    maxTravelers: 12, availableSlots: 6, heroImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop',
    summary: 'A seven-day high-altitude trek through pine forests, alpine meadows, and snow ridgelines.', rating: 4.8, reviewCount: 132,
    itinerary: [{ day: 1, title: 'Arrival in Manali', description: 'Settle into base camp and gear check.' }, { day: 2, title: 'Trek to Jobri', description: 'Forest trail walk, first camp under the stars.' }],
  },
  {
    title: 'Goa Coastal Escape', category: 'Beach', destination: 'Goa, India', price: 18500, duration: 4,
    maxTravelers: 20, availableSlots: 14, heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200&auto=format&fit=crop',
    summary: 'Four laid-back days of beach shacks, sunset cruises, and old-town Portuguese lanes.', rating: 4.5, reviewCount: 261,
    itinerary: [{ day: 1, title: 'North Goa arrival', description: 'Check-in and Baga beach sunset.' }],
  },
  {
    title: 'Rajasthan Royal Circuit', category: 'Cultural', destination: 'Jaipur-Udaipur, India', price: 35000, duration: 6,
    maxTravelers: 16, availableSlots: 9, heroImage: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1200&auto=format&fit=crop',
    summary: 'Palaces, forts, and lakeside havelis across six days through the heart of Rajasthan.', rating: 4.9, reviewCount: 198,
    itinerary: [{ day: 1, title: 'Jaipur arrival', description: 'Amber Fort and city palace visit.' }],
  },
  {
    title: 'Kabini Wildlife Safari', category: 'Wildlife', destination: 'Kabini, India', price: 22000, duration: 3,
    maxTravelers: 10, availableSlots: 4, heroImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1200&auto=format&fit=crop',
    summary: 'Three days of jeep and boat safaris through one of India\'s richest wildlife reserves.', rating: 4.6, reviewCount: 87,
    itinerary: [{ day: 1, title: 'Arrival and evening safari', description: 'Check-in followed by a jeep safari.' }],
  },
  {
    title: 'Rishikesh Rapids and Yoga', category: 'Adventure', destination: 'Rishikesh, India', price: 15500, duration: 3,
    maxTravelers: 15, availableSlots: 11, heroImage: 'https://images.unsplash.com/photo-1591117207239-788bf8de6c3b?q=80&w=1200&auto=format&fit=crop',
    summary: 'White-water rafting on the Ganges paired with sunrise yoga sessions on the ghats.', rating: 4.4, reviewCount: 143,
    itinerary: [{ day: 1, title: 'Arrival and Ganga Aarti', description: 'Evening prayer ceremony at the ghats.' }],
  },
  {
    title: 'Mumbai City Weekender', category: 'City Break', destination: 'Mumbai, India', price: 12000, duration: 2,
    maxTravelers: 25, availableSlots: 20, heroImage: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?q=80&w=1200&auto=format&fit=crop',
    summary: 'A fast-paced two-day loop through Mumbai\'s landmarks, food streets, and seafront.', rating: 4.2, reviewCount: 76,
    itinerary: [{ day: 1, title: 'Gateway and Colaba', description: 'Gateway of India and Colaba causeway walk.' }],
  },
];

const seedTours = async () => {
  if ((await Tour.countDocuments()) === 0) {
    await Tour.insertMany(tours);
    console.log(`Seeded ${tours.length} tours`);
  }
};

module.exports = seedTours;