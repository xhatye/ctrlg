import ProductDemo from './ProductDemo';
import PublicAI from './PublicAI';
import HomeStudyPath from './HomeStudyPath';
import SubjectIcon from './SubjectIcon';
import PreviewGallery from './PreviewGallery';
import LandingReviews from './LandingReviews';
import catalogue from './catalogue.json';
import {publicSubjectPath} from '../lib/public-study-pages.mjs';
import {PublicEvidence} from './PublicStudySite';
const art=name=>'/navigation-3d-v1/'+name+'.webp';
const methods=[['library','Comprendre','Des cours structurés, des fiches et des exemples pour éclaircir une notion.'],['exams','Pratiquer','Des QCM expliqués et des cas corrigés pour mettre votre raisonnement à l’épreuve.'],['review','Retenir','Des flashcards et des rappels pour retrouver ce qui mérite d’être revu.']];
export function RefinedLanding({Nav,Footer,Faq,onNav,onAuth,ues}) {
 return <div className="marketing refined-marketing"><Nav onNav={onNav} onAuth={onAuth}/><main>
  <section className="container refined-hero"><div className="refined-hero-copy"><span className="refined-kicker"><i/> RÉVISIONS DCG & DSCG · IA INCLUSE</span><h1>DCG & DSCG.<br/><span>Révisez avec l’IA.</span></h1><p>Des cours, des QCM expliqués et des flashcards pour travailler vos UE. Et des aides d’intelligence artificielle pour éclaircir un cours, comprendre une erreur et améliorer votre raisonnement.</p><div className="refined-actions"><a className="btn" href="/test-gratuit">Tester mon UE gratuitement</a><a className="refined-text-link" href="/tarifs">Voir les offres</a></div><a className="public-ai-badge" href="#aides-ia">Aides IA incluses dans les deux offres · usage encadré</a><div className="refined-hero-note"><span>13 UE DCG</span><i/><span>7 UE DSCG</span><i/><a href="/tarifs">Dès 15 € / mois</a></div></div><div className="refined-product-preview"><ProductDemo/><img className="refined-companion g-floating-companion" src="/illustrations/study-companion-v1.webp" width="140" height="140" alt="" decoding="async"/></div></section>
  <section className="container refined-library-facts" aria-label="La bibliothèque SIMDCG">{[[catalogue.totals.chapters,'chapitres'],[catalogue.totals.curatedQuestions,'QCM expliqués'],[catalogue.totals.cards,'flashcards']].map(([n,label])=><div key={label}><strong>{n.toLocaleString('fr-FR')}</strong><span>{label}</span></div>)}<p>Des contenus originaux.<br/>Une couverture partielle des programmes, détaillée par UE.</p></section>
  <div className="container" id="aides-ia"><PublicAI/></div>
  <section className="container refined-section" id="methode"><div className="refined-section-heading"><div><span className="refined-kicker">UN FIL CONDUCTEUR</span><h2>Avancer, une notion à la fois.</h2></div><p>Des outils complémentaires.<br/>Un parcours facile à retrouver.</p></div><div className="refined-method-grid">{methods.map(([image,title,text],i)=><article key={title}><div className="refined-method-top"><img src={art(image)} width="76" height="76" alt="" loading="lazy"/><span>0{i+1}</span></div><h3>{title}</h3><p>{text}</p></article>)}</div></section>
  <section className="container refined-section"><div className="refined-section-heading"><div><span className="refined-kicker">VOTRE DIPLÔME, VOS MATIÈRES</span><h2>Choisissez votre prochaine UE.</h2></div><div className="refined-diploma-links"><a href="/dcg">DCG </a><a href="/dscg">DSCG </a></div></div><div className="refined-subjects">{[...ues.filter(u=>u.level==='DCG').slice(0,3),...ues.filter(u=>u.level==='DSCG').slice(0,3)].map(ue=><a href={publicSubjectPath(ue.id)} key={ue.id}><SubjectIcon id={ue.id} size={72}/><div><span>{ue.level} · {ue.id.replace('DSCG','UE')}</span><h3>{ue.label}</h3><small>{catalogue.modules[ue.id].chapters.length} chapitres à explorer</small></div></a>)}</div></section>
  <section className="container refined-annals"><img src={art('annals')} width="108" height="108" alt="" loading="lazy"/><div><span className="refined-kicker">LES SUJETS OFFICIELS</span><h2>Faites place à l’entraînement.</h2><p>Les annales en PDF, un chronomètre adapté à l’UE et un espace pour votre brouillon.</p></div><a className="btn btn-secondary" href="/annales">Explorer les annales </a></section>
  <section className="container growth-home-resources"><div><span className="refined-kicker">POUR COMMENCER</span><h2>Un outil utile. Une notion plus claire.</h2></div><a href="/outils/calcul-moyenne-dcg">Calculer ma moyenne DCG</a><a href="/outils/calcul-moyenne-dscg">Calculer ma moyenne DSCG</a><a href="/outils/planning-revision">Créer mon planning gratuit</a><a href="/fiches">Lire une fiche gratuite</a></section>
  <PublicEvidence/><LandingReviews hideEmpty/>
  <section className="container refined-final-cta"><div><span className="refined-kicker">À VOTRE RYTHME</span><h2>Votre prochaine notion commence ici.</h2><p>Cours, entraînements et aides IA incluses. 15 € par mois ou 29 € pour 90 jours.</p></div><a className="btn" href="/tarifs">Choisir mon accès </a></section><Faq/>
 </main><Footer onNav={onNav}/></div>;
}
const tools=[
 ['library','Cours & fiches','Allez à l’essentiel.','Des chapitres structurés, des tableaux et des exemples pour comprendre et retrouver les points clés.'],
 ['exams','QCM expliqués','Comprenez vos réponses.','Des questions de notions et de raisonnement, avec une explication pour apprendre de chaque réponse.'],
 ['review','Flashcards & textes à trous','Retrouvez sans regarder.','Mobilisez vos connaissances, repérez vos hésitations et reprenez les cartes difficiles.'],
 ['annals','Cas pratiques','Passez de la règle au dossier.','Travaillez une situation concrète puis comparez votre démarche aux éléments du corrigé.'],
 ['planning','Planning & suivi','Gardez votre fil conducteur.','Choisissez vos UE, organisez vos séances et retrouvez votre progression par chapitre.'],
 ['progress','Mode examen','Prenez le temps de raisonner.','Composez sur un sujet original, avec des annexes, un chronomètre et un barème de comparaison.'],
];
export function RefinedFeatures({Nav,Footer,onNav,onAuth}) {
 return <div className="marketing refined-marketing refined-features"><Nav onNav={onNav} onAuth={onAuth}/><main>
  <section className="container refined-features-hero"><span className="refined-kicker">LA MÉTHODE SIMDCG</span><h1>Vos outils de révision.<br/><span>Le coup de pouce de l’IA.</span></h1><p>Comprenez avec le cours, pratiquez avec les exercices et demandez une aide IA lorsque vous en avez besoin. Pour le DCG et le DSCG.</p><a href="/exemple-gratuit" className="btn">Essayer un chapitre gratuit</a></section>
  <div className="container"><PublicAI/></div>
  <section className="container refined-tool-grid" aria-label="Les outils de révision">{tools.map(([image,label,title,text])=><article key={label}><img src={art(image)} width="82" height="82" alt="" loading="lazy"/><span className="refined-tool-label">{label}</span><h2>{title}</h2><p>{text}</p></article>)}</section>
  <section className="container audit-feature-demo"><div><span className="eyebrow">VOYEZ COMMENT ÇA MARCHE</span><h2>Une notion, trois façons de travailler.</h2><p>Essayez une question, retrouvez sa fiche et retournez la carte mémoire.</p></div><ProductDemo/></section>
  <PreviewGallery onSubscribe={()=>onNav('pricing')}/>
  <section className="container refined-annals"><img src={art('annals')} width="100" height="100" alt="" loading="lazy"/><div><span className="refined-kicker">UN RENDEZ-VOUS AVEC L’ÉPREUVE</span><h2>Les annales, dans votre espace.</h2><p>Consultez les PDF des sujets officiels avec leur source et un chronomètre. Les cas SIMDCG restent des exercices originaux distincts.</p></div><a href="/annales" className="btn btn-secondary">Voir les annales </a></section>
  <section className="container refined-tutor-note"><span className="refined-note-icon" aria-hidden="true">✦</span><div><h2>Le tuteur IA reste à portée de main.</h2><p>Posez une question sur votre UE pour retrouver un raisonnement ou demander une explication. Le planning, les rappels et les supports enregistrés complètent ces aides, même sans demande IA.</p></div></section>
  <section className="container refined-final-cta"><div><span className="refined-kicker">VOTRE PROCHAINE ÉTAPE</span><h2>Un espace. Vos UE. Votre rythme.</h2><p>Explorez les chapitres disponibles avant de choisir votre accès.</p></div><a className="btn" href="/dcg">Voir les matières </a></section>
 </main><Footer onNav={onNav}/></div>;
}
