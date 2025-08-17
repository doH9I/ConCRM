import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Hide loading indicator
const loading = document.getElementById('loading');
if (loading) {
  loading.classList.add('hidden');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);