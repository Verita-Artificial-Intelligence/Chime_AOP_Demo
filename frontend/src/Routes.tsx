import React, { FC } from 'react';
import { Switch, Route } from 'react-router-dom';

import { Home, Login, SignUpView, Protected, PrivateRoute } from './views';

export const Routes: FC = () => {
  return (
    <Switch>
      <div className="text-center">
        <header className="bg-primary min-h-screen flex flex-col items-center justify-center text-white text-base">
          <Route path="/login" component={Login} />
          <Route path="/signup" component={SignUpView} />
          <PrivateRoute path="/protected" component={Protected} />
          <Route exact path="/" component={Home} />
        </header>
      </div>
    </Switch>
  );
};
