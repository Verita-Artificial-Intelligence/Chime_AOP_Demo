import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { ClerkProvider, useUser, RedirectToSignIn } from '@clerk/clerk-react';
import { vi } from 'vitest';
import { Home } from '../views/Home';

vi.mock('@clerk/clerk-react');

const mockedUseUser = useUser as any;
const MockRedirect = RedirectToSignIn as any;

describe('Home', () => {
  it('redirects to sign in when signed out', () => {
    mockedUseUser.mockReturnValue({ isSignedIn: false });
    MockRedirect.mockImplementation(() => <div>Redirecting</div>);

    const home = render(
      <ClerkProvider frontendApi="">
        <Home />
      </ClerkProvider>
    );

    expect(home.getByText('Redirecting')).toBeInTheDocument();
  });

  it('shows content when signed in', () => {
    mockedUseUser.mockReturnValue({ isSignedIn: true });
    MockRedirect.mockImplementation(() => <div>redirect</div>);

    const home = render(
      <ClerkProvider frontendApi="">
        <Home />
      </ClerkProvider>
    );

    expect(home.getByText('Click to make request to backend')).toBeInTheDocument();
    expect(home.getByText('Protected Route')).toBeInTheDocument();
    expect(home.getByText('Logout')).toBeInTheDocument();
  });
});
