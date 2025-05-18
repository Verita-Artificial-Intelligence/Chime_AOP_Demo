import React from 'react';
import { SignUp } from '@clerk/clerk-react';

export const SignUpView = () => (
  <div className="p-base m-base shadow-md bg-white rounded-md max-w-md mx-auto">
    <SignUp path="/signup" routing="path" signInUrl="/login" />
  </div>
);
