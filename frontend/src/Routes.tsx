import React, { FC } from 'react';
import { Switch, Route } from 'react-router-dom';
import { useHistory } from 'react-router';

import { Home, Login, SignUp, Protected, PrivateRoute } from './views';
import { logout } from './utils/auth';

export const Routes: FC = () => {
  const history = useHistory();

  return (
    <Switch>
      <div className="text-center">
        <header className="bg-primary min-h-screen flex flex-col items-center justify-center text-white text-base">
          <Route path="/login" component={Login} />
          <Route path="/signup" component={SignUp} />
          <Route
            path="/logout"
            render={() => {
              logout();
              history.push('/');
              return null;
            }}
          />
          <PrivateRoute path="/protected" component={Protected} />
          <Route exact path="/" component={Home} />
        </header>
      </div>
    </Switch>
  );
};
