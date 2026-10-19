// Visual word reveals keep one complete, readable heading for assistive technology.
export default function PlayfulHeading({text,lines,as:Tag='h2',className='',id}) {
  const rows=lines || [text];
  let index=0;
  return <Tag id={id} className={'playful-heading '+className} aria-label={rows.join(' ')}>
    {rows.map((line,row)=><span className="playful-heading-line" aria-hidden="true" key={row}>{line.split(' ').map((word,i)=><span key={i} className="playful-word" style={{'--word-order':index++}}>{word}{i<line.split(' ').length-1?'\u00a0':''}</span>)}</span>)}
  </Tag>;
}
