export default function Flashcard({card,flipped,onFlip,review=false}) {
  return <div className="flashcard" role="button" tabIndex={0} aria-label="Retourner la flashcard" aria-pressed={flipped} onClick={onFlip} onKeyDown={e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();onFlip();}}}>
    <div className={`flashcard-inner${flipped?' is-flipped':''}`}>
      <div className="flashcard-face" aria-hidden={flipped}><span className="eyebrow">{card.tag}{review?' · À REVOIR':''}</span><p className="flashcard-question">{card.q}</p><span className="helper">{card.kind} · Cliquer pour révéler</span></div>
      <div className="flashcard-face flashcard-answer" aria-hidden={!flipped}><span className="eyebrow">{card.exampleAnswer?'EXEMPLE DE RÉPONSE':'RÉPONSE ATTENDUE'}</span><p>{card.a}</p>{card.explanation&&<div className="flashcard-application"><strong>POURQUOI ?</strong><p>{card.explanation}</p></div>}{card.example&&<div className="flashcard-application"><strong>MISE EN PRATIQUE</strong><p>{card.example}</p>{card.pitfall&&<p className="flashcard-pitfall">À éviter : {card.pitfall}</p>}</div>}<span className="helper">Comparez le sens de votre réponse ; une reformulation correcte convient.</span></div>
    </div>
  </div>;
}
