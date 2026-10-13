import { useEffect, useRef } from 'react';

export function InteractionEffects() {
  useEffect(()=>{
    const media=matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let frame=0,active=null;
    const move=e=>{
      if(!media.matches)return;
      const card=e.target.closest?.('.btn,.ue-card,.course-tool,.feature-card,.pricing-card,.chapter-card,.answer-option');
      if(!card){cancelAnimationFrame(frame);active?.classList.remove('pointer-lit');active=null;return;}
      if(active&&active!==card)active.classList.remove('pointer-lit');
      active=card;
      const x=e.clientX,y=e.clientY;
      cancelAnimationFrame(frame);
      frame=requestAnimationFrame(()=>{const r=card.getBoundingClientRect();card.style.setProperty('--pointer-x',`${x-r.left}px`);card.style.setProperty('--pointer-y',`${y-r.top}px`);card.classList.add('pointer-lit');});
    };
    const leave=()=>{cancelAnimationFrame(frame);active?.classList.remove('pointer-lit');active=null;};
    document.addEventListener('pointermove',move,{passive:true});
    document.addEventListener('pointerleave',leave);
    return ()=>{leave();document.removeEventListener('pointermove',move);document.removeEventListener('pointerleave',leave);};
  },[]);
  return null;
}

export function HeroAtmosphere() {
  const ref=useRef(null);
  useEffect(()=>{
    const parent=ref.current.parentElement;
    const media=matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)');
    let frame=0;
    const move=e=>{if(!media.matches)return;const r=parent.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{ref.current?.style.setProperty('--orbit-x',`${x*12}px`);ref.current?.style.setProperty('--orbit-y',`${y*12}px`);});};
    const leave=()=>{cancelAnimationFrame(frame);ref.current?.style.setProperty('--orbit-x','0px');ref.current?.style.setProperty('--orbit-y','0px');};
    parent.addEventListener('pointermove',move,{passive:true});parent.addEventListener('pointerleave',leave);
    return ()=>{leave();parent.removeEventListener('pointermove',move);parent.removeEventListener('pointerleave',leave);};
  },[]);
  return <div className="hero-atmosphere" ref={ref} aria-hidden="true">
    <svg viewBox="0 0 1200 760" fill="none" preserveAspectRatio="xMidYMid slice">
      <defs><pattern id="study-grid" width="72" height="72" patternUnits="userSpaceOnUse"><path d="M72 0H0V72" stroke="currentColor" strokeWidth=".5"/></pattern></defs>
      <rect width="1200" height="760" fill="url(#study-grid)" className="orbit-grid"/>
      <g className="orbit-lines"><path d="M58 200C150 90 280 120 342 58M38 618C158 654 222 584 330 667M705 70C830 116 949 60 1128 162M840 626C980 710 1132 602 1172 462"/><circle cx="1080" cy="196" r="122"/><circle cx="1080" cy="196" r="160" strokeDasharray="2 14"/></g>
      <g className="orbit-dots">{[[58,200],[180,120],[342,58],[38,618],[218,616],[330,667],[705,70],[882,91],[1128,162],[840,626],[1010,666],[1172,462]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i%3===0?3:1.7} style={{animationDelay:`${i*.3}s`}}/>)}</g>
      <g className="orbit-notes"><text x="78" y="190">Actif = Passif</text><text x="800" y="65">FRNG − BFR = Trésorerie</text><text x="78" y="704">Comprendre. Tester. Retenir.</text></g>
    </svg>
  </div>;
}
