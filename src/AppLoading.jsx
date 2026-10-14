import './app-loading.css';

export default function AppLoading() {
  return (
    <div className="app-loading" role="status" aria-label="Chargement de SIMDCG">
      <svg className="app-loading-logo" viewBox="0 0 64 64" width="84" height="84" aria-hidden="true">
        <rect width="64" height="64" rx="21" fill="#7c3aed" />
        <text x="14" y="49" fontFamily="Segoe UI, Arial, sans-serif" fontWeight="900" fontSize="48" fill="white">S</text>
        <path d="m49 9 2.4 6.6L58 18l-6.6 2.4L49 27l-2.4-6.6L40 18l6.6-2.4z" fill="#e9d5ff" />
      </svg>
      <span className="app-loading-name" aria-hidden="true">SIMDCG</span>
    </div>
  );
}
