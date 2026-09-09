import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImagePlus, Plus, Trash2 } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import { tourFormSchema } from '../../utils/validationSchemas.js';
import { CATEGORIES } from '../../data/mockData.js';

const EMPTY_VALUES = {
  title: '',
  category: CATEGORIES[0],
  destination: '',
  price: '',
  duration: '',
  maxTravelers: '',
  availableSlots: '',
  summary: '',
  heroImage: '',
  departures: [{ date: '', maxTravelers: '' }],
};

export default function TourFormModal({ isOpen, onClose, onSubmit, initialTour, submitting }) {
  const [preview, setPreview] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
    control,
  } = useForm({
    resolver: zodResolver(tourFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'departures',
  });

  const heroImageValue = watch('heroImage');

  useEffect(() => {
    if (isOpen) {
      reset(
        initialTour
          ? {
              title: initialTour.title,
              category: initialTour.category,
              destination: initialTour.destination,
              price: initialTour.price,
              duration: initialTour.duration,
              maxTravelers: initialTour.maxTravelers,
              availableSlots: initialTour.availableSlots,
              summary: initialTour.summary,
              heroImage: initialTour.heroImage,
              departures: initialTour.departures && initialTour.departures.length > 0
                ? initialTour.departures.map((d) => ({
                    date: d.date ? new Date(d.date).toISOString().split('T')[0] : '',
                    maxTravelers: d.maxTravelers || '',
                  }))
                : [{ date: '', maxTravelers: '' }],
            }
          : EMPTY_VALUES
      );
      setPreview(initialTour?.heroImage || '');
    }
  }, [isOpen, initialTour, reset]);

  useEffect(() => {
    if (heroImageValue) setPreview(heroImageValue);
  }, [heroImageValue]);

  // Simulates an image upload: in production this would POST to a
  // storage endpoint (S3, Cloudinary, etc.) and receive back a URL.
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
  };

  const submitHandler = (values) => {
    onSubmit({
      ...values,
      price: Number(values.price),
      duration: Number(values.duration),
      maxTravelers: Number(values.maxTravelers),
      availableSlots: Number(values.availableSlots),
      heroImage: preview || values.heroImage,
      departures: values.departures.map((d) => ({
        date: new Date(d.date).toISOString(),
        maxTravelers: Number(d.maxTravelers),
      })),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialTour ? 'Edit Tour Package' : 'Add Tour Package'} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-lagoon-700">Tour title</label>
            <input className="input-field" placeholder="e.g. Himalayan Highlands Trek" {...register('title')} />
            {errors.title && <p className="field-error">{errors.title.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-lagoon-700">Category</label>
            <select className="input-field" {...register('category')}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.category && <p className="field-error">{errors.category.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-lagoon-700">Destination</label>
            <input className="input-field" placeholder="e.g. Manali, India" {...register('destination')} />
            {errors.destination && <p className="field-error">{errors.destination.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-lagoon-700">Price (₹)</label>
            <input type="number" className="input-field" {...register('price', { valueAsNumber: true })} />
            {errors.price && <p className="field-error">{errors.price.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-lagoon-700">Duration (days)</label>
            <input type="number" className="input-field" {...register('duration', { valueAsNumber: true })} />
            {errors.duration && <p className="field-error">{errors.duration.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-lagoon-700">Max travelers</label>
            <input type="number" className="input-field" {...register('maxTravelers', { valueAsNumber: true })} />
            {errors.maxTravelers && <p className="field-error">{errors.maxTravelers.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-lagoon-700">Available slots</label>
            <input type="number" className="input-field" {...register('availableSlots', { valueAsNumber: true })} />
            {errors.availableSlots && <p className="field-error">{errors.availableSlots.message}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-lagoon-700">Summary</label>
            <textarea rows={3} className="input-field resize-none" {...register('summary')} />
            {errors.summary && <p className="field-error">{errors.summary.message}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-lagoon-700">Departure Dates (for group travel)</label>
            {errors.departures && <p className="field-error mb-2">{errors.departures.message}</p>}
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="date"
                      className="input-field"
                      {...register(`departures.${index}.date`)}
                    />
                    {errors.departures?.[index]?.date && (
                      <p className="field-error text-xs">{errors.departures[index].date.message}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder="Max travelers"
                      className="input-field"
                      {...register(`departures.${index}.maxTravelers`, { valueAsNumber: true })}
                    />
                    {errors.departures?.[index]?.maxTravelers && (
                      <p className="field-error text-xs">{errors.departures[index].maxTravelers.message}</p>
                    )}
                  </div>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="mt-0.5 rounded-lg bg-red-50 p-2.5 text-red-600 hover:bg-red-100 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => append({ date: '', maxTravelers: '' })}
                className="inline-flex items-center gap-2 rounded-lg border border-lagoon-300 px-3 py-2 text-sm font-medium text-lagoon-600 hover:bg-lagoon-50 transition"
              >
                <Plus size={16} /> Add Departure
              </button>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-lagoon-700">Cover image</label>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-sand-300 bg-sand-50">
                {preview ? (
                  <img src={preview} alt="Cover preview" className="h-full w-full object-cover" />
                ) : (
                  <ImagePlus className="text-sand-300" size={22} />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input type="file" accept="image/*" onChange={handleFileChange} className="text-xs text-lagoon-500" />
                <input
                  className="input-field !py-2 text-xs"
                  placeholder="or paste an image URL"
                  {...register('heroImage')}
                />
                {errors.heroImage && <p className="field-error">{errors.heroImage.message}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Saving...' : initialTour ? 'Save Changes' : 'Add Tour'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
