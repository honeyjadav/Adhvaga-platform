import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import apiCallService from '../services/APICallService.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

export default function VerifyEmail() {
  const { token } = useParams();
  const [state, setState] = useState({ status: 'loading', message: '' });

  useEffect(() => {
    apiCallService.verifyEmail(token)
      .then(({ data }) => setState({ status: 'success', message: data.message }))
      .catch((error) => setState({ status: 'error', message: error.message }));
  }, [token]);

  if (state.status === 'loading') return <LoadingSpinner fullPage label="Verifying your email..." />;

  const success = state.status === 'success';
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
      {success ? <CheckCircle2 size={52} className="text-lagoon-600" /> : <XCircle size={52} className="text-rose-600" />}
      <h1 className="mt-5 font-display text-2xl font-semibold text-lagoon-900">
        {success ? 'Email verified' : 'Verification failed'}
      </h1>
      <p className="mt-2 text-sm text-lagoon-500">{state.message}</p>
      <Link to="/login" className="btn-primary mt-6">Go to login</Link>
    </div>
  );
}