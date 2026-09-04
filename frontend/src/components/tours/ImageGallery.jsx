import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageGallery({ images = [], title }) {
  const [active, setActive] = useState(0);

  if (!images.length) return null;

  const prev = () => setActive((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActive((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="space-y-3">
      <div className="relative h-72 w-full overflow-hidden rounded-xl2 sm:h-96">
        <img src={images[active]} alt={`${title} photo ${active + 1}`} className="h-full w-full object-cover" />
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-lagoon-700 shadow-card transition hover:bg-white"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-lagoon-700 shadow-card transition hover:bg-white"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={img + idx}
              onClick={() => setActive(idx)}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                idx === active ? 'border-lagoon-600' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`${title} thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
