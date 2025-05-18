import React, { FC, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { useHistory } from 'react-router';

import { signUp, isAuthenticated } from '../utils/auth';

export const SignUp: FC = () => {
  const history = useHistory();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (_: React.MouseEvent) => {
    // Password confirmation validation
    if (password !== passwordConfirmation) setError('Passwords do not match');
    else {
      setError('');
      try {
        const data = await signUp(email, password, passwordConfirmation);

        if (data) {
          history.push('/');
        }
      } catch (err) {
        if (err instanceof Error) {
          // handle errors thrown from frontend
          setError(err.message);
        } else {
          // handle errors thrown from backend
          setError(String(err));
        }
      }
    }
  };

  return isAuthenticated() ? (
    <Redirect to="/" />
  ) : (
    <div className="p-base m-base shadow-md bg-white rounded-md max-w-md mx-auto">
      <div className="space-y-md">
        <input
          id="email"
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.currentTarget.value)
          }
          required
          autoFocus
        />
        <input
          id="password"
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.currentTarget.value)
          }
          required
        />
        <input
          id="passwordConfirmation"
          className="input"
          type="password"
          placeholder="Confirm password"
          value={passwordConfirmation}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPasswordConfirmation(e.currentTarget.value)
          }
          required
        />
        {error && <div className="text-red hover:text-red-hover">{error}</div>}
        <div className="flex justify-center mt-md">
          <button type="button" className="btn" onClick={handleSubmit}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};
