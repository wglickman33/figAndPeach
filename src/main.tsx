import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import favicon from './assets/FNPBrowserTab.png'
import './index.css'
import App from './App.tsx'

function setFavicon(href: string) {
  const existing = document.querySelector<HTMLLinkElement>("link[rel='icon']");
  const link = existing ?? document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';
  link.href = href;
  if (!existing) {
    document.head.appendChild(link);
  }

  const apple = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
  const appleLink = apple ?? document.createElement('link');
  appleLink.rel = 'apple-touch-icon';
  appleLink.href = href;
  if (!apple) {
    document.head.appendChild(appleLink);
  }
}

setFavicon(favicon)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
