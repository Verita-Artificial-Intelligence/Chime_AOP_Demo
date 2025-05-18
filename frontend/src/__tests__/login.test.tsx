import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { ClerkProvider } from '@clerk/clerk-react';
import { Login } from '../views';

it('Login renders correctly', () => {
  const login = render(
    <ClerkProvider frontendApi="">
      <Login />
    </ClerkProvider>
  );
  expect(login.getByText(/sign in/i)).toBeInTheDocument();
});
