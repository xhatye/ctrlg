import { useEffect, useRef, useState } from 'react';
import './gizmo-design.css';
import { useTheme } from './theme';
import StudySearch from './StudySearch';

const paths = {
  home:'M3 11 12 3l9 8v10h-7v-7h-4v7H3z', book:'M12 5v16M3 4h5a4 4 0 0 1 4 2 4 4 0 0 1 4-2h5v15h-5a4 4 0 0 0-4 2 4 4 0 0 0-4-2H3z',
  cards:'M5 7h14v14H5zM8 3h13v14', clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 7v5l4 2',
  chart:'M4 4v16h16M8 16v-4M12 16V8M16 16V5', calendar:'M4 6h16v14H4zM4 10h16M8 3v5M16 3v5',
  arrow:'M4 12h16m-6-6 6 6-6 6', check:'m5 12 4 4L19 6', user:'M8 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0M4 21v-2a8 8 0 0 1 16 0v2',
  spark:'m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z', search:'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14m5 12 6 6',
  menu:'M4 6h16M4 12h16M4 18h16', close:'m6 6 12 12M18 6 6 18', logout:'M10 4H4v16h6M13 8l4 4-4 4M8 12h12',
  moon:'M20.5 14.5A9 9 0 0 1 9.5 3.5a9 9 0 1 0 11 11Z',
  sun:'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5',
};
export function StudyIcon({name='spark',size=22}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] || paths.spark}/></svg>;
}
export function StudyBrand({onClick}) {
  return <button className="g-brand" onClick={onClick} aria-label="SIMDCG, mon espace">
    <span className="g-brand-mark" aria-hidden="true">S<span>✦</span></span><span>SIMDCG<small>Votre réussite, UE par UE.</small></span>
  </button>;
}
export function StudyArt() {
  return <svg className="g-study-art" viewBox="0 0 260 210" fill="none" aria-hidden="true">
    <ellipse cx="135" cy="191" rx="85" ry="10" fill="#ddd6fe"/>
    <path d="m44 139 77-22 79 21-76 25z" fill="#c4b5fd"/><path d="M44 139v14l80 25v-15zm80 24v15l76-26v-14z" fill="#a78bfa"/>
    <path d="m54 124 75-24 69 24-73 23z" fill="#fff"/><path d="M54 124v12l71 22v-11zm71 23v11l73-22v-12z" fill="#e9e5f7"/>
    <rect x="98" y="27" width="109" height="116" rx="20" transform="rotate(9 98 27)" fill="#6d28d9"/>
    <rect x="109" y="39" width="86" height="30" rx="8" transform="rotate(9 109 39)" fill="#ede9fe"/>
    <path d="m137 54 9 2m8 1 9 2m8 1 9 2" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round"/>
    {[[113,83],[140,87],[167,91],[109,109],[136,113],[163,117]].map(([x,y],i)=><rect key={i} x={x} y={y} width="18" height="18" rx="5" transform={`rotate(9 ${x} ${y})`} fill={i===5?'#a7f3d0':'#a78bfa'}/>)}
    <path d="m49 49 3 12 12 3-12 3-3 12-3-12-12-3 12-3zm174 102 2 8 8 2-8 2-2 8-2-8-8-2 8-2z" fill="#8b5cf6"/>
    <circle cx="63" cy="100" r="6" fill="#fda4af"/><circle cx="221" cy="65" r="5" fill="#6ee7b7"/>
    <path d="m65 170 17-4m-14 12 10-3" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round"/>
  </svg>;
}
const links = [
  ['dashboard','home','Mon espace'], ['library','book','Mes UE'], ['review_today','cards','À revoir aujourd’hui'],
  ['exams','check','Mode examen'], ['annals','book','Annales'], ['planning','calendar','Mon planning'], ['progress','chart','Ma progression'],
  ['history','clock','Historique'], ['tutor','spark','Tuteur IA'], ['interview_config','user','Préparer l’oral par écrit'], ['account','user','Mon compte'],
];
export function GizmoShell({children,screen,user,onNav,onLogout}) {
  const { theme, toggle } = useTheme();
  const [open,setOpen] = useState(false);
  const [searchOpen,setSearchOpen] = useState(false);
  const shortcut=/Mac|iPhone|iPad/.test(globalThis.navigator?.platform || '')?'⌘ K':'Ctrl K';
  useEffect(()=>{
    const search=e=>{if((e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==='k'){e.preventDefault();if(!e.repeat){setOpen(false);setSearchOpen(v=>!v);}}};
    window.addEventListener('keydown',search);return()=>window.removeEventListener('keydown',search);
  },[]);
  const closeRef = useRef(null),menuRef = useRef(null);
  const go = key => { setOpen(false); onNav(key); };
  useEffect(() => {
    if (!open) return;
    const old = document.body.style.overflow;
    document.body.style.overflow='hidden'; closeRef.current?.focus();
    const escape = e => { if (e.key==='Escape') { setOpen(false); menuRef.current?.focus(); }
      if(e.key==='Tab') { const controls=[...document.querySelectorAll('.g-sidebar button')]; const first=controls[0],last=controls.at(-1);
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();} } };
    document.addEventListener('keydown',escape);
    return () => { document.body.style.overflow=old; document.removeEventListener('keydown',escape); };
  },[open]);
  const streak=Number.isInteger(user.streak)?user.streak: user.streak?.count || 0;
  return <div className={'g-workspace'+(['qcm','flashcards'].includes(screen)?' g-focus-mode':'')}>
    <a className="g-skip" href="#g-main">Aller au contenu</a>
    {open&&<button className="g-menu-scrim" aria-label="Fermer le menu" onClick={()=>setOpen(false)}/>}
    <aside className={'g-sidebar'+(open?' g-sidebar-open':'')} role={open?'dialog':undefined} aria-modal={open?true:undefined} aria-label="Navigation étudiant">
      <div className="g-sidebar-brand"><StudyBrand onClick={()=>go('dashboard')}/><button className="g-close-menu" ref={closeRef} onClick={()=>{setOpen(false);menuRef.current?.focus();}} aria-label="Fermer la navigation"><StudyIcon name="close"/></button></div>
      <div className="g-sidebar-label">MON PARCOURS</div>
      <nav aria-label="Navigation de l’espace étudiant">{links.map(([key,icon,label],i)=>{const active=screen===key||key==='library'&&['subject_hub','qcm','flashcards','resume_cours','cas_pratique'].includes(screen);return <button key={key} className={(active?'active ':'')+'g-nav-'+i} aria-current={active?'page':undefined} onClick={()=>go(key)}>
        <span className="g-nav-icon"><StudyIcon name={icon}/></span><span>{label}</span>{key==='tutor'&&<small>IA</small>}
      </button>;})}</nav>
      <div className="g-sidebar-footer"><div className="g-sidebar-note"><span>✧</span><strong>Un petit pas aujourd’hui.</strong><p>Une notion mieux comprise pour avancer demain.</p></div>
        <button onClick={()=>go('feedback')}>Partager mon retour <StudyIcon name="arrow" size={16}/></button>
        <button onClick={onLogout}><StudyIcon name="logout" size={16}/>Se déconnecter</button>
      </div>
    </aside>
    <div className="g-workspace-column">
      <header className="g-topbar">
        <button className="g-menu-button" ref={menuRef} aria-label="Ouvrir le menu" aria-expanded={open} onClick={()=>setOpen(true)}><StudyIcon name="menu"/></button>
        <button className="g-search-shortcut" onClick={()=>setSearchOpen(true)} aria-label="Rechercher une UE, un chapitre ou une notion" aria-keyshortcuts="Meta+k Control+k"><StudyIcon name="search" size={18}/><span>Une UE, un chapitre, une notion…</span><span className="g-key-hint" aria-hidden="true"><kbd>{shortcut}</kbd></span></button>
        <div className="g-topbar-right"><button className="g-theme-control" onClick={toggle} aria-label={`Passer en mode ${theme==='light'?'sombre':'clair'}`}><StudyIcon name={theme==='light'?'moon':'sun'} size={18}/></button><span className="g-streak"><StudyIcon name="spark" size={17}/>{streak} <span>jour{streak>1?'s':''}</span></span>
          <button className="g-plan-pill" onClick={()=>go(user.isPro?'account':'pricing')}>{user.isPro?'Pro':'Voir les offres'}</button>
          <button className="g-avatar" aria-label="Mon compte" onClick={()=>go('account')}>{user.name?.slice(0,2).toUpperCase() || 'S'}</button></div>
      </header>
      <main id="g-main" className="workspace-main" tabIndex={-1}>{children}</main>
      <StudySearch open={searchOpen} onClose={()=>setSearchOpen(false)} onSelect={item=>onNav(item.kind==='subject'?'subject_hub':'resume_cours',{module:item.module,chapter:item.chapter})}/>
      <nav className="g-mobile-nav" aria-label="Accès rapides">{links.slice(0,4).map(([key,icon,label])=><button key={key} className={screen===key?'active':''} aria-current={screen===key?'page':undefined} onClick={()=>go(key)}><StudyIcon name={icon}/><span>{key==='review_today'?'À revoir':label}</span></button>)}</nav>
    </div>
  </div>;
}
