import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Instagram, Facebook, Twitter, MapPin, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-sand-200 bg-lagoon-900 text-sand-100">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lagoon-600 text-white">
                <Compass size={18} />
              </span>
              <span className="font-display text-xl font-semibold text-white">Adhvaga</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-sand-200/80">
              Thoughtfully curated tours across India, booked end-to-end in one clear, calm flow.
            </p>
            <div className="mt-5 flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
                  aria-label="Social link"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-sand-200/60">Explore</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/tours" className="hover:text-white">All Tours</Link></li>
              <li><Link to="/tours?category=Mountain" className="hover:text-white">Mountain Treks</Link></li>
              <li><Link to="/tours?category=Beach" className="hover:text-white">Beach Getaways</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-sand-200/60">Account</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link to="/login" className="hover:text-white">Log In</Link></li>
              <li><Link to="/register" className="hover:text-white">Sign Up</Link></li>
              <li><Link to="/dashboard" className="hover:text-white">My Bookings</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-sand-200/60">Contact</h4>
            <ul className="mt-4 space-y-3 text-sm text-sand-200/80">
              <li className="flex items-center gap-2"><MapPin size={15} /> Bengaluru, India</li>
              <li className="flex items-center gap-2"><Mail size={15} /> hello@adhvaga.com</li>
              <li className="flex items-center gap-2"><Phone size={15} /> +91 98765 43210</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-sand-200/60 sm:flex-row">
          <p>© {new Date().getFullYear()} Adhvaga Tours. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
