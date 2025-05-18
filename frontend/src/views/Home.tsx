import React, { FC, useState } from 'react';

import { getMessage } from '../utils/api';
import { isAuthenticated } from '../utils/auth';

export const Home: FC = () => {
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
      {isAuthenticated() ? (
        <a className="link" href="/logout">
          Logout
        </a>
      ) : (
        <>
          <a className="link" href="/login">
            Login
          </a>
          <a className="link" href="/signup">
            Sign Up
          </a>
        </>
      )}
    </>
  );
};
