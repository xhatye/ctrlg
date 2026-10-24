"""Regenerate first-party sharing previews from a JSON metadata file; local authoring only."""
import json, sys, textwrap
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
root=Path(__file__).resolve().parents[1]
rows=json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
target=root/'public'/'social'; target.mkdir(exist_ok=True)
font_path=Path('C:/Windows/Fonts/seguisb.ttf')
regular=Path('C:/Windows/Fonts/segoeui.ttf')
for row in rows:
    card=Image.new('RGB',(1200,630),'#f8f9fc'); d=ImageDraw.Draw(card)
    d.rounded_rectangle((34,34,1166,596),radius=32,fill='#ffffff',outline='#e9e4f3',width=2)
    logo=Image.open(root/'public'/'brand-mark.png').convert('RGBA'); logo.thumbnail((62,62));card.paste(logo,(78,70),logo)
    d.text((158,78),'SIMDCG',font=ImageFont.truetype(str(font_path),34),fill='#182033')
    label='OUTIL GRATUIT' if row['path'].startswith('/outils') else 'COURS ET MÉTHODES' if row['path'].startswith('/guides') else 'RÉVISIONS DCG & DSCG'
    d.text((80,179),label,font=ImageFont.truetype(str(font_path),19),fill='#7736e8')
    title=row['title'].replace(' | SIMDCG','')
    size=49 if len(title)<80 else 43
    font=ImageFont.truetype(str(font_path),size)
    lines=[]; line=''
    for word in title.split():
        trial=(line+' '+word).strip()
        if d.textlength(trial,font=font)>760 and line:lines.append(line);line=word
        else:line=trial
    if line:lines.append(line)
    d.multiline_text((78,225),'\n'.join(lines[:4]),font=font,fill='#182033',spacing=12)
    image='finance' if any(x in row['path'] for x in ['moyenne','amortissement','van']) else 'law' if 'droit' in row['path'] else 'systems' if 'systeme' in row['path'] else None
    source=root/'public'/'subjects-3d-v1'/(image+'.webp') if image else root/'public'/'navigation-3d-v1'/'library.webp'
    art=Image.open(source).convert('RGBA');art.thumbnail((230,230));card.paste(art,(875,235),art)
    d.rounded_rectangle((78,520,1118,560),radius=13,fill='#f1ebfd')
    d.text((97,527),'simdcg.com  ·  Un chapitre offert, sans compte',font=ImageFont.truetype(str(regular),19),fill='#57328c')
    slug='site' if row['path']=='/' else row['path'][1:].replace('/','__')
    card.save(target/(slug+'.png'),optimize=True)
print(f'{len(rows)} original social previews generated at 1200 × 630.')
