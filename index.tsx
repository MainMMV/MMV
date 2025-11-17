// Import necessary libraries from React.
import React from 'react';
import ReactDOM from 'react-dom/client';
// Import the main application component.
import App from './App';

// Find the root DOM element where the React app will be mounted.
const rootElement = document.getElementById('root');
// Throw an error if the root element is not found to prevent the app from crashing silently.
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Create a React root for the specified DOM element.
const root = ReactDOM.createRoot(rootElement);
// Render the main App component within React's StrictMode for additional checks and warnings.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
