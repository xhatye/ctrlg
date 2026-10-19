import {readFile} from 'node:fs/promises';
const catalogue=JSON.parse(await readFile(new URL('./annals-catalogue.json',import.meta.url),'utf8'));
const allowed=new Map(catalogue.items.map(a=>[a.id,a]));
export const MAX_PDF_BYTES=8000000;
export function annalForRequest(id){return typeof id==='string'?allowed.get(id):undefined;}
// Only a verified catalogue ID is accepted. This is never an arbitrary URL proxy.
export async function fetchAnnalPdf(item,fetcher=fetch){
 const url=new URL(item.sourceUrl);
 if(url.origin!=='https://documents.sujets-dcg.com'||!/^\/(dcg|dscg)\/sujets\//.test(url.pathname))throw Error('Source invalide');
 const response=await fetcher(url.href,{redirect:'error',signal:AbortSignal.timeout(20000)});
 if(!response.ok||!response.headers.get('content-type')?.includes('application/pdf')||Number(response.headers.get('content-length'))>MAX_PDF_BYTES)throw Error('PDF indisponible');
 const chunks=[];let length=0;
 for await(const chunk of response.body){length+=chunk.length;if(length>MAX_PDF_BYTES)throw Error('PDF trop volumineux');chunks.push(chunk);}
 const bytes=Buffer.concat(chunks);
 if(bytes.length<5||bytes.subarray(0,5).toString()!=='%PDF-')throw Error('PDF invalide');
 return bytes;
}
export async function annalFileHandler(req,res){
 res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Méthode non autorisée'});}
 const id=new URL(req.url,'http://localhost').searchParams.get('id'),item=annalForRequest(id);
 if(!item)return res.status(404).json({error:'Sujet introuvable'});
 try{
  const bytes=await fetchAnnalPdf(item);
  res.setHeader('Content-Type','application/pdf');res.setHeader('Content-Disposition',`inline; filename="${item.id}.pdf"`);
  res.setHeader('Cache-Control','public, max-age=3600, s-maxage=86400');
  return res.status(200).send(bytes);
 }catch{res.setHeader('Cache-Control','no-store');return res.status(502).json({error:'Le diffuseur du sujet est momentanément indisponible. Réessayez dans quelques instants.'});}
}
