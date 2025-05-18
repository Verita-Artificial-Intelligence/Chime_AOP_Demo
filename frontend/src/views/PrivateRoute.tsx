import React, { FC } from 'react';
import { Route } from 'react-router-dom';
import { RedirectToSignIn, useUser } from '@clerk/clerk-react';

type PrivateRouteType = {
  component: React.ComponentType<any>;
  path?: string | string[];
};

export const PrivateRoute: FC<PrivateRouteType> = ({
  component: Component,
  ...rest
}: any) => {
  const { isSignedIn } = useUser();
  return (
    <Route
      {...rest}
      render={(props: any) =>
        isSignedIn ? <Component {...props} /> : <RedirectToSignIn />
      }
    />
  );
};
