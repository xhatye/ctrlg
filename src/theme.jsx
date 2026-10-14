import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'simdcg-theme-v2';
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light'; } catch { return 'light'; } });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#17141f' : '#f8f9fc');
    try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* Private browsing may disable storage. */ }
  }, [theme]);
  useEffect(() => {
    const sync = event => {
      if (event.key === STORAGE_KEY) setTheme(event.newValue === 'light' ? 'light' : 'dark');
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  return <ThemeContext.Provider value={{ theme, toggle: () => setTheme(current => current === 'dark' ? 'light' : 'dark') }}>
    {children}
    <ThemeToggle />
  </ThemeContext.Provider>;
}

function ThemeToggle() {
  const { theme, toggle } = useContext(ThemeContext);
  const label = `Passer en mode ${theme === 'dark' ? 'clair' : 'sombre'}`;
  return <button className="theme-toggle" onClick={toggle} aria-label={label} title={label}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
      {theme === 'dark' ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></> : <path d="M20.5 14.5A9 9 0 0 1 9.5 3.5a9 9 0 1 0 11 11Z" />}
    </svg>
    <span>Mode {theme === 'dark' ? 'clair' : 'sombre'}</span>
  </button>;
}
