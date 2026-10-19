import catalogue from './catalogue.json';
const formats=[['reading','Cours'],['sheet','Fiche'],['cloze','Texte à trous'],['qcm','QCM'],['flashcards','Flashcards'],['visuals','Visuels'],['cas_pratique','Cas pratiques']];
export function ChapterFormats({ue,active,onSelect,onNav}){
 const c=catalogue.modules[ue.id]?.chapters.find(c=>c.id===ue.chapter)||catalogue.modules[ue.id]?.chapters[0];
 return <nav className="chapter-format-tabs" aria-label="Supports du chapitre">{formats.filter(([key])=>key!=='cloze'||c?.clozeCount>0).map(([key,label])=><button key={key} aria-current={active===key?'page':undefined} onClick={()=>onSelect?onSelect(key):onNav(['qcm','flashcards','cas_pratique'].includes(key)?key:'resume_cours',{module:ue.id,chapter:ue.chapter||c?.id,format:key})}><span className={'format-tab-symbol format-tab-'+key} aria-hidden="true">{{reading:'▤',sheet:'▧',cloze:'✎',qcm:'✓',flashcards:'▱',visuals:'◈',cas_pratique:'▣'}[key]}</span>{label}</button>)}</nav>;
}
