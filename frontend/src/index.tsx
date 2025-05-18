import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { CLERK_PUBLISHABLE_KEY } from './config';
import './index.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ClerkProvider
    publishableKey={CLERK_PUBLISHABLE_KEY}
    routerPush={(to: string) => window.history.pushState(null, '', to)}
    routerReplace={(to: string) => window.history.pushState(null, '', to)}
  >
    <Router>
      <App />
    </Router>
  </ClerkProvider>
);
