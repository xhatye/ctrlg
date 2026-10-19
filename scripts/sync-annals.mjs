// Manual refresh only: Vercel builds use the checked-in, verified catalogue.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {ANNAL_SUBJECTS} from '../lib/annal-subjects.mjs';
const base='https://www.sujets-dcg.com/';
const out=path.resolve(process.env.ANNALS_RESEARCH_DIR || '../../outputs/annals-landing/research');
await fs.mkdir(path.join(out,'pdfs'),{recursive:true});
const html=await fetch(base,{signal:AbortSignal.timeout(20000)}).then(r=>{if(!r.ok)throw Error('Source catalogue '+r.status);return r.text();});
const links=[...new Set([...html.matchAll(/href="(https:\/\/documents\.sujets-dcg\.com\/(?:dcg|dscg)\/sujets\/[^"<>]+\.pdf)"/g)].map(m=>m[1]))];
const previous=JSON.parse(await fs.readFile('lib/annals-catalogue.json','utf8'));
const items=[],errors=[];let next=0;
await Promise.all(Array.from({length:4},async()=>{while(next<links.length){const url=links[next++];try{
 const parsed=new URL(url),match=parsed.pathname.match(/^\/(dcg|dscg)\/sujets\/(20\d{2})(-NC)?\/UE(\d+)-/i);if(!match)throw Error('Format non reconnu');
 const level=match[1].toUpperCase(),year=Number(match[2]),region=match[3]?'Nouvelle-Calédonie':'Session nationale',ue=Number(match[4]);if(year>2026||level==='DSCG'&&year>2025)throw Error('Session future');
 const subject=ANNAL_SUBJECTS.find(s=>s.level===level&&s.ue===ue);if(!subject||subject.kind!=='written')throw Error('UE sans épreuve écrite');
 const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('HTTP '+response.status);if(!response.headers.get('content-type')?.includes('application/pdf'))throw Error('Contenu non PDF');
 const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length>8000000||!bytes.subarray(0,5).equals(Buffer.from('%PDF-')))throw Error('PDF invalide');
 const id=level.toLowerCase()+'-'+ue+'-'+year+(match[3]?'-nc':'');await fs.writeFile(path.join(out,'pdfs',id+'.pdf'),bytes);
 items.push({id,subject:subject.id,level,ue,year,region,minutes:subject.minutes,title:subject.title,sourceUrl:url,sourceName:'Sujets-dcg.com',sourcePage:base,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
 }catch(e){errors.push({url,error:e.message});}}}));
items.sort((a,b)=>a.level.localeCompare(b.level)||a.ue-b.ue||b.year-a.year||a.region.localeCompare(b.region));
for(const item of items){const old=previous.items.find(a=>a.id===item.id&&a.sha256===item.sha256);if(old?.pages)item.pages=old.pages;else errors.push({id:item.id,error:'Nouvelle version : vérifier le PDF et son nombre de pages avant publication'});}
const data={verifiedAt:new Date().toISOString().slice(0,10),sourcePage:base,items};if(!errors.length)await fs.writeFile('lib/annals-catalogue.json',JSON.stringify(data,null,2)+'\n');await fs.writeFile(path.join(out,'import-report.json'),JSON.stringify({count:items.length,errors},null,2));console.log(JSON.stringify({count:items.length,errors}));if(errors.length)process.exitCode=1;
