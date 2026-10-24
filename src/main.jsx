import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from './theme';
import { InteractionEffects } from './interactions';
import './design.css';
import './gizmo-pages.css';
import './public-nav.css';
import './fonts.css';
import './public-landing.css';
import './refined-ui.css';
import './starter.css';
import './growth.css';
import { findPublicPage } from '../lib/public-study-pages.mjs';
import { applyPageMetadata } from '../lib/public-seo.mjs';
import { Analytics } from '@vercel/analytics/react';
import { publicAnalyticsEvent } from '../lib/public-analytics.mjs';
const root = ReactDOM.createRoot(document.getElementById('root'));
const preview = import.meta.env.DEV && new URLSearchParams(window.location.search).has('design');
const publicPage = !preview && findPublicPage(window.location.pathname);
if (!preview) applyPageMetadata(window.location.pathname);
async function loadPage() {
  if (preview) return import('./DesignPreview.jsx');
  if (['/','/fonctionnalites'].includes(window.location.pathname)) return import('./PublicPresentation.jsx');
  if (window.location.pathname==='/exemple-gratuit') return import('./SamplePage.jsx');
  if (publicPage) {
    const {default:Page} = await import('./PublicStudySite.jsx');
    return {default:Page};
  }
  return import('./App.jsx');
}
loadPage().then(({ default: App }) => {
  root.render(<React.StrictMode><ThemeProvider><InteractionEffects/><App {...(publicPage?{page:publicPage}:{})}/></ThemeProvider>{import.meta.env.PROD&&<Analytics beforeSend={publicAnalyticsEvent}/>}</React.StrictMode>);
});
