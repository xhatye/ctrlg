import {useEffect,useRef,useState} from 'react';
const samples=[
 {title:'Le cours',text:'Notions, schémas et applications.',src:'/previews-v3/course.png',alt:'Capture réelle d’un cours SIMDCG avec données de départ, formules et résultats d’amortissement.'},
 {title:'Le dossier',text:'Documents, chronomètre et barème.',width:1044,height:734,src:'/previews-v4/exam.webp',alt:'Capture réelle d’un dossier original SIMDCG avec annexes et réponse rédigée en mode examen.'},
 {title:'Le corrigé',text:'Points attendus et erreurs à repérer.',width:990,height:545,src:'/previews-v4/correction.webp',alt:'Capture réelle du corrigé SIMDCG et de ses critères de comparaison personnelle.'}
];
export default function PreviewGallery({onSubscribe}){
 const [selected,setSelected]=useState(null),dialog=useRef(null);
 useEffect(()=>{if(selected!==null&&!dialog.current.open)dialog.current.showModal();},[selected]);
 const close=()=>{dialog.current?.close();setSelected(null);};
 return <section className="container section proof-gallery" id="voir-simdcg"><div className="section-heading"><div><span className="eyebrow">DANS VOTRE ESPACE</span><h2>Vos révisions, en images.</h2></div><p>Captures de l’interface. Exemple de copie illustratif.</p></div><div className="proof-grid">{samples.map((s,i)=><article className="panel" key={s.src}><button className="proof-image" aria-label={'Agrandir : '+s.title} onClick={()=>setSelected(i)}><img src={s.src} alt={s.alt} loading="lazy" width={s.width || 1118} height={s.height || 1200}/><span>Agrandir la capture </span></button><h3>{s.title}</h3><p>{s.text}</p></article>)}</div><button className="btn" onClick={onSubscribe}>Voir les offres DCG / DSCG</button><dialog ref={dialog} className="proof-dialog" onCancel={()=>setSelected(null)} onClose={()=>setSelected(null)} onClick={e=>{if(e.target===e.currentTarget)close();}} aria-label="Capture SIMDCG agrandie"><button autoFocus className="btn btn-secondary" onClick={close}>Fermer la capture</button>{selected!==null&&<><h2>{samples[selected].title}</h2><p>Sur téléphone, faites défiler l’image pour lire les détails.</p><div className="proof-full-image" tabIndex={0} role="region" aria-label="Capture défilable"><img src={samples[selected].src} alt={samples[selected].alt}/></div></>}</dialog></section>;
}
