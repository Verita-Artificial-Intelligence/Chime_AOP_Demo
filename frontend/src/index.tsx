import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { CLERK_PUBLISHABLE_KEY } from './config';
import './index.css';
import App from './App';

ReactDOM.render(
  <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} navigate={(to) => window.history.pushState(null, '', to)}>
    <Router>
      <App />
    </Router>
  </ClerkProvider>,
  document.getElementById('root')
);
