import React, { FC, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { useHistory } from 'react-router';

import { login, isAuthenticated } from '../utils/auth';

export const Login: FC = () => {
  const history = useHistory();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (_: React.MouseEvent) => {
    setError('');
    try {
      const data = await login(email, password);

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
        {error && <div className="text-red hover:text-red-hover">{error}</div>}
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-xs">
            <input type="checkbox" className="mr-xs" />
            <span>Remember me</span>
          </label>
          <button className="btn bg-transparent text-blue hover:underline" type="button">
            Forgot password ?
          </button>
        </div>
        <div className="flex justify-center space-x-sm mt-md">
          <button
            type="button"
            className="btn bg-white text-blue border border-blue"
            onClick={() => history.push('/signup')}
          >
            Sign Up
          </button>
          <button type="button" className="btn" onClick={handleSubmit}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
};
