import React from 'react';
import { RedirectToSignIn, useUser } from '@clerk/clerk-react';

type PrivateRouteProps = {
  children: React.ReactNode;
};

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isSignedIn } = useUser();
  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }
  return <>{children}</>;
};
