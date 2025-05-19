import React, { useState } from 'react';

import { getMessage } from '../utils/api';
import {
  SignOutButton,
  RedirectToSignIn,
  useUser,
} from '@clerk/clerk-react';

export const Home = () => {
  const { isSignedIn } = useUser();
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const queryBackend = async () => {
    try {
      const message = await getMessage();
      setMessage(message);
    } catch (err) {
      setError(String(err));
    }
  };

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  return (
    <>
      {!message && !error && (
        <a className="link" href="#" onClick={() => queryBackend()}>
          Click to make request to backend
        </a>
      )}
      {message && (
        <p>
          <code>{message}</code>
        </p>
      )}
      {error && (
        <p>
          Error: <code>{error}</code>
        </p>
      )}
      <a className="link" href="/protected">
        Protected Route
      </a>
      <SignOutButton>Logout</SignOutButton>
    </>
  );
};
