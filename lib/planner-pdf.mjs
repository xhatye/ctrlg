// Small, local, text-only PDF exporter. No service, account or document upload.
const latin=s=>String(s).replaceAll('œ','oe').replaceAll('Œ','OE').replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/[–—−]/g,'-').replaceAll('…','...').replaceAll('€','EUR').replace(/[^\x20-\xff\n]/g,' ');
const escape=s=>latin(s).replaceAll('\\','\\\\').replaceAll('(','\\(').replaceAll(')','\\)');
const wrap=(s,width=88)=>{const result=[];let line='';for(const word of latin(s).split(/\s+/)){if(line.length+word.length+1>width&&line){result.push(line);line='';}line+=(line?' ':'')+word;}return [...result,line];};
export function plannerPdf(plan){
 const lines=['MON PLANNING SIMDCG',`${plan.startDate||''} - ${plan.endDate||''}`,`${plan.sessionCount} seances de 30 min - ${plan.totalMinutes/60} heures au total`,'La date cible est exclue des revisions. Adaptez les notions a votre session.',''];
 for(const week of plan.schedule){lines.push(`SEMAINE ${week.week}`);for(const day of week.days){lines.push(day.label);for(const s of day.sessions)lines.push(...wrap(`${s.level} ${s.ue.replace('DSCG','UE')} - 30 min - ${s.title} : ${s.label}`),...wrap(s.instruction));lines.push('');}}
 lines.push('Ce planning organise du temps, sans garantir la couverture du programme.','https://www.simdcg.com/outils/planning-revision');
 const pages=[];for(let i=0;i<lines.length;i+=48)pages.push(lines.slice(i,i+48));
 const objects=['','<< /Type /Catalog /Pages 2 0 R >>','', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'];
 const pageIds=[];for(const [index,page] of pages.entries()){const id=objects.length;pageIds.push(id);const content=['BT /F1 10 Tf 48 790 Td 14 TL',...page.map((line,i)=>(i?'T* ':'')+'('+escape(line)+') Tj'),'ET',`BT /F1 9 Tf 48 32 Td (${index+1} / ${pages.length} - SIMDCG) Tj ET`].join('\n');objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${id+1} 0 R >>`,`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);}
 objects[2]=`<< /Type /Pages /Count ${pages.length} /Kids [${pageIds.map(id=>id+' 0 R').join(' ')}] >>`;
 let pdf='%PDF-1.4\n',offsets=[0];for(let i=1;i<objects.length;i++){offsets.push(pdf.length);pdf+=`${i} 0 obj\n${objects[i]}\nendobj\n`;}const xref=pdf.length;pdf+=`xref\n0 ${objects.length}\n0000000000 65535 f \n`+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
 return Uint8Array.from(pdf,c=>c.charCodeAt(0));
}
