export default function Flashcard({card,flipped,onFlip,review=false}) {
  return <div className="flashcard" role="button" tabIndex={0} aria-label="Retourner la flashcard" aria-pressed={flipped} onClick={onFlip} onKeyDown={e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();onFlip();}}}>
    <div className={`flashcard-inner${flipped?' is-flipped':''}`}>
      <div className="flashcard-face" aria-hidden={flipped}><span className="eyebrow">{card.tag}{review?' · À REVOIR':''}</span><p className="flashcard-question">{card.q}</p><span className="helper">{card.kind} · Cliquer pour révéler →</span></div>
      <div className="flashcard-face flashcard-answer" aria-hidden={!flipped}><span className="eyebrow">RÉPONSE</span><p>{card.a}</p><span className="helper">Cliquer pour revenir à la question</span></div>
    </div>
  </div>;
}
