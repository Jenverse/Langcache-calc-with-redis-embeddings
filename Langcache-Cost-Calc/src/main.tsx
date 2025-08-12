import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

console.log('Starting application initialization...');

try {
  const rootElement = document.getElementById('root');
  console.log('Looking for root element:', rootElement);

  if (!rootElement) {
    throw new Error('Failed to find root element!');
  }

  console.log('Creating React root...');
  const root = createRoot(rootElement);

  console.log('Attempting to render App component...');
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log('Initial render complete');
} catch (error) {
  console.error('Fatal error during application startup:', error);
}

window.addEventListener('load', () => {
  console.log('Window load event fired');
  console.log('Current DOM content:', document.body.innerHTML);
});

window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});
