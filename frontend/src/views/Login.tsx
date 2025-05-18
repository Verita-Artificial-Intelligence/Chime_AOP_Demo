import React from 'react';
import { SignIn } from '@clerk/clerk-react';

export const Login: React.FC = () => (
  <div className="p-base m-base shadow-md bg-white rounded-md max-w-md mx-auto">
    <SignIn path="/login" routing="path" signUpUrl="/signup" />
  </div>
);
