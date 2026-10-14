import {useEffect, useRef} from 'react';

// Motion stays inside the public home page; content remains visible without it.
export function useLandingMotion() {
  const root=useRef(null);
  useEffect(()=>{
    const page=root.current;
    if(!page)return;
    const motion=matchMedia('(prefers-reduced-motion: no-preference)');
    const pointer=matchMedia('(hover: hover) and (pointer: fine)');
    const hero=page.querySelector('.hero-campus');
    const targets=[...page.querySelectorAll('.library-numbers>div,.section-heading,.feature-card,.proof-grid>article,.marketing-subjects>a,.roadmap>div,.roadmap li,.cta-band,.faq')];
    let observer,frame=0,active=null;
    const resetCard=()=>{
      active?.classList.remove('landing-pointer-active');
      active?.style.removeProperty('--landing-rx');active?.style.removeProperty('--landing-ry');
      active=null;
    };
    const reset=()=>{
      cancelAnimationFrame(frame);resetCard();
      page.style.setProperty('--landing-x','0px');page.style.setProperty('--landing-y','0px');
    };
    const configure=()=>{
      reset();observer?.disconnect();
      targets.forEach(el=>el.classList.remove('landing-reveal','landing-visible'));
      hero?.classList.remove('landing-in-view');
      if(!motion.matches||!('IntersectionObserver' in window))return;
      observer=new IntersectionObserver(entries=>{
        entries.forEach(({target,isIntersecting})=>{
          if(target===hero){hero.classList.toggle('landing-in-view',isIntersecting);return;}
          if(isIntersecting){target.classList.add('landing-visible');observer.unobserve(target);}
        });
      },{threshold:0.08});
      targets.forEach((el,i)=>{
        el.style.setProperty('--landing-delay',`${i%4*45}ms`);
        el.classList.add('landing-reveal');
        if(el.getBoundingClientRect().top<innerHeight)el.classList.add('landing-visible');
        else observer.observe(el);
      });
      if(hero)observer.observe(hero);
    };
    const move=e=>{
      if(!motion.matches||!pointer.matches||e.pointerType==='touch')return;
      const card=e.target.closest?.('.landing-stage,.landing-people,.feature-card,.marketing-subjects>button,.proof-grid>article,.cta-band');
      if(card!==active){resetCard();active=card;}
      const heroActive=hero?.contains(e.target),x=e.clientX,y=e.clientY;
      cancelAnimationFrame(frame);
      frame=requestAnimationFrame(()=>{
        if(heroActive){const r=hero.getBoundingClientRect();page.style.setProperty('--landing-x',`${((x-r.left)/r.width-.5)*22}px`);page.style.setProperty('--landing-y',`${((y-r.top)/r.height-.5)*18}px`);}
        else{page.style.setProperty('--landing-x','0px');page.style.setProperty('--landing-y','0px');}
        if(card&&active===card){
          const r=card.getBoundingClientRect();
          card.style.setProperty('--landing-rx',`${Math.max(-2,Math.min(2,(.5-(y-r.top)/r.height)*4))}deg`);
          card.style.setProperty('--landing-ry',`${Math.max(-2,Math.min(2,((x-r.left)/r.width-.5)*4))}deg`);
          card.classList.add('landing-pointer-active');
        }
      });
    };
    const out=e=>{if(active&&!active.contains(e.relatedTarget))resetCard();};
    const focus=e=>{const target=e.target.closest?.('.landing-reveal');if(target){target.classList.add('landing-visible');observer?.unobserve(target);}};
    configure();motion.addEventListener('change',configure);pointer.addEventListener('change',reset);
    page.addEventListener('pointermove',move,{passive:true});page.addEventListener('pointerout',out,{passive:true});page.addEventListener('pointerleave',reset);
    page.addEventListener('focusin',focus);
    window.addEventListener('blur',reset);
    return()=>{reset();observer?.disconnect();motion.removeEventListener('change',configure);pointer.removeEventListener('change',reset);page.removeEventListener('pointermove',move);page.removeEventListener('pointerout',out);page.removeEventListener('pointerleave',reset);page.removeEventListener('focusin',focus);window.removeEventListener('blur',reset);};
  },[]);
  return root;
}
