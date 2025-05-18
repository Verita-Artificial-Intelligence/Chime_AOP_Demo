import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { ClerkProvider } from '@clerk/clerk-react';
import { Home } from '../views/Home';

it('Home renders correctly', () => {
  const home = render(
    <ClerkProvider frontendApi="">
      <Home />
    </ClerkProvider>
  );
  expect(home.getByText('Protected Route')).toBeInTheDocument();
  expect(home.getByText('Login')).toBeInTheDocument();
  expect(home.getByText('Sign Up')).toBeInTheDocument();
});
