import './app-loading.css';

export default function AppLoading() {
  return (
    <div className="app-loading" role="status" aria-label="Chargement de SIMDCG">
      <img className="app-loading-logo" src="/brand-mark.svg?v=3" alt="" width="84" height="84" />
      <span className="app-loading-name" aria-hidden="true">SIMDCG</span>
    </div>
  );
}
