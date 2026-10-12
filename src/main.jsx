import React from 'react'
import ReactDOM from 'react-dom/client'
const root = ReactDOM.createRoot(document.getElementById('root'));
const preview = import.meta.env.DEV && new URLSearchParams(window.location.search).has('design');
(preview ? import('./DesignPreview.jsx') : import('./App.jsx')).then(({ default: App }) => {
  root.render(<React.StrictMode><App /></React.StrictMode>);
});
