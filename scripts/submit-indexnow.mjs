// Run once after a READY deployment with meaningful public content changes.
// https://www.indexnow.org/documentation — receipt never means indexing is guaranteed.
import {readFile} from 'node:fs/promises';
import {assertPatchedNode} from '../lib/runtime-security.mjs';
import {indexNowPayload} from '../lib/indexnow.mjs';
assertPatchedNode();
const key=(await readFile(new URL('../public/indexnow.txt',import.meta.url),'utf8')).trim();
const payload=indexNowPayload(key);
const proof=await fetch(payload.keyLocation,{signal:AbortSignal.timeout(20000)});
if(!proof.ok||(await proof.text()).trim()!==key)throw Error('The ownership file is not published. No URLs submitted.');
const published=await fetch('https://'+payload.host+'/public-page-manifest.json',{signal:AbortSignal.timeout(20000)});
if(!published.ok)throw Error('Published public manifest unavailable. No URLs submitted.');
const actual=new Set((await published.json()).pages.map(p=>p.canonical));
if(payload.urlList.some(url=>!actual.has(url)))throw Error('The new public pages are not all published. No URLs submitted.');
const response=await fetch('https://api.indexnow.org/indexnow',{method:'POST',headers:{'Content-Type':'application/json; charset=utf-8'},body:JSON.stringify(payload),signal:AbortSignal.timeout(30000)});
console.log(JSON.stringify({status:response.status,submittedUrls:[200,202].includes(response.status)?payload.urlList.length:0,received:[200,202].includes(response.status),verificationPending:response.status===202,indexingGuaranteed:false}));
if(![200,202].includes(response.status))process.exitCode=1;
