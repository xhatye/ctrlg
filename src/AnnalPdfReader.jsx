import {useEffect,useRef,useState} from 'react';
import {getDocument,GlobalWorkerOptions,TextLayer} from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
GlobalWorkerOptions.workerSrc=workerUrl;
export default function AnnalPdfReader({annal,page,onPage,onReady}){
 const [pdf,setPdf]=useState(null),[error,setError]=useState(''),[retry,setRetry]=useState(0),[zoom,setZoom]=useState(1),[width,setWidth]=useState(700),[rendered,setRendered]=useState(false),[local,setLocal]=useState(null),[notice,setNotice]=useState('');
 const host=useRef(null),canvasHost=useRef(null),textHost=useRef(null),full=useRef(null);
 useEffect(()=>{const observer=new ResizeObserver(([e])=>setWidth(Math.max(240,Math.floor(e.contentRect.width))));if(host.current)observer.observe(host.current);return()=>observer.disconnect();},[error]);
 useEffect(()=>{
  let active=true;setPdf(null);setError('');setRendered(false);onReady(false);
  const task=getDocument(local?{data:local.slice(),isEvalSupported:false}:{url:'/api/annal-file?id='+encodeURIComponent(annal.id),isEvalSupported:false});
  task.promise.then(doc=>{if(active){setPdf(doc);if(page>doc.numPages)onPage(1);}}).catch(()=>{if(active)setError('Le PDF ne peut pas être chargé. Réessayez ou ouvrez votre propre fichier ci-dessous.');});
  return()=>{active=false;task.destroy().catch(()=>{});};
 },[annal.id,retry,local]);
 useEffect(()=>{
  if(!pdf||!canvasHost.current)return;
  let active=true,renderTask,textLayer;setRendered(false);
  // Each render owns a fresh canvas, including during rapid page changes.
  const canvas=document.createElement('canvas');canvasHost.current.replaceChildren(canvas);textHost.current.replaceChildren();
  pdf.getPage(Math.max(1,Math.min(page,pdf.numPages))).then(async p=>{
   if(!active)return;
   const scale=(width-24)/p.getViewport({scale:1}).width*zoom,viewport=p.getViewport({scale}),ratio=Math.min(devicePixelRatio||1,2);
   canvas.width=Math.ceil(viewport.width*ratio);canvas.height=Math.ceil(viewport.height*ratio);canvas.style.width=viewport.width+'px';canvas.style.height=viewport.height+'px';
   const wrap=canvasHost.current.parentElement;wrap.style.width=viewport.width+'px';wrap.style.height=viewport.height+'px';wrap.style.setProperty('--scale-factor',scale);wrap.style.setProperty('--total-scale-factor',scale);
   renderTask=p.render({canvasContext:canvas.getContext('2d'),viewport,transform:ratio===1?undefined:[ratio,0,0,ratio,0,0]});
   await renderTask.promise;if(!active)return;setRendered(true);onReady(true);
   const content=await p.getTextContent();if(!active)return;textLayer=new TextLayer({textContentSource:content,container:textHost.current,viewport});await textLayer.render();
  }).catch(e=>{if(active&&e.name!=='RenderingCancelledException')setError('Cette page ne peut pas être affichée. Réessayez de charger le document.');});
  return()=>{active=false;renderTask?.cancel();textLayer?.cancel();};
 },[pdf,page,width,zoom]);
 const changePage=n=>{onPage(Math.max(1,Math.min(pdf?.numPages||1,Number.isFinite(n)?Math.trunc(n):1)));host.current?.scrollTo({top:0,left:0});};
 const chooseLocal=async e=>{try{const file=e.target.files?.[0];if(!file)return;if(file.size>8000000){setNotice('Choisissez un PDF de moins de 8 Mo.');return;}const bytes=new Uint8Array(await file.arrayBuffer());if(new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-'){setNotice('Ce fichier n’est pas un PDF valide.');return;}setNotice('PDF personnel : il reste sur cet appareil. Sélectionnez-le à nouveau après rechargement.');setLocal(bytes);onPage(1);}catch{setNotice('Ce fichier ne peut pas être lu.');}};
 return <section className="annal-pdf" ref={full} aria-label="Lecteur du sujet PDF"><div className="annal-pdf-toolbar"><div className="annal-pagination"><button aria-label="Page précédente" disabled={!pdf||page<=1} onClick={()=>changePage(page-1)}>←</button><label>Page <input aria-label="Numéro de page" type="number" min="1" max={pdf?.numPages||1} value={page} disabled={!pdf} onChange={e=>changePage(Number(e.target.value)||1)}/><span>/ {pdf?.numPages||annal.pages}</span></label><button aria-label="Page suivante" disabled={!pdf||page>=pdf.numPages} onClick={()=>changePage(page+1)}>→</button></div><div className="annal-zoom"><button aria-label="Réduire le zoom" disabled={zoom<=.75} onClick={()=>setZoom(z=>Math.max(.75,z-.25))}>−</button><button onClick={()=>setZoom(1)} aria-label="Ajuster à la largeur">{Math.round(zoom*100)} %</button><button aria-label="Agrandir le zoom" disabled={zoom>=2} onClick={()=>setZoom(z=>Math.min(2,z+.25))}>+</button><button aria-label="Afficher le PDF en plein écran" onClick={async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await full.current.requestFullscreen();}catch{setNotice('Le plein écran n’est pas disponible dans ce navigateur.');}}}>⛶</button></div></div>
 {error?<div className="annal-pdf-error" role="alert"><p>{error}</p><button className="btn" onClick={()=>{setLocal(null);setRetry(n=>n+1);}}>Réessayer</button></div>:<div ref={host} className="annal-pdf-viewport" tabIndex="0" aria-label={'Sujet PDF, page '+page}><div className="annal-pdf-sheet"><div ref={canvasHost} role="img" aria-label={'Page '+page+' du sujet '+annal.level+' UE'+annal.ue}/><div ref={textHost} className="textLayer"/></div>{!rendered&&<p className="annal-pdf-loading" role="status">Chargement de la page…</p>}</div>}
 <div className="annal-pdf-source"><a href={annal.sourceUrl} target="_blank" rel="noopener noreferrer">PDF original · {annal.sourceName} ↗</a><label className="annal-local-file">Ouvrir mon PDF<input type="file" accept="application/pdf,.pdf" onChange={chooseLocal}/></label></div>{notice&&<p className="helper" role="status">{notice}</p>}</section>;
}
