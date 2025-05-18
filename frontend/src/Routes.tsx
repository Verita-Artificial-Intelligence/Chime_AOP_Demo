import React from 'react';
import { Routes as RouterRoutes, Route } from 'react-router-dom';

import { Home, Login, SignUpView, Protected, PrivateRoute } from './views';

export const Routes = () => {
  return (
    <div className="text-center">
      <header className="bg-primary min-h-screen flex flex-col items-center justify-center text-white text-base">
        <RouterRoutes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUpView />} />
          <Route path="/protected" element={<PrivateRoute><Protected /></PrivateRoute>} />
          <Route path="/" element={<Home />} />
        </RouterRoutes>
      </header>
    </div>
  );
};
