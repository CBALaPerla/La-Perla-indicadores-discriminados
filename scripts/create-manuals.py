from pathlib import Path
from io import BytesIO
import re,base64,json
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_LEFT
root=Path(__file__).resolve().parents[1]
for name,file in [('Perla','DejaVuSans.ttf'),('PerlaBold','DejaVuSans-Bold.ttf')]:
 pdfmetrics.registerFont(TTFont(name,'/usr/share/fonts/truetype/dejavu/'+file))
logo=ImageReader(BytesIO(base64.b64decode(re.search(r'<img src="data:image/png;base64,([^"]+)"',(root/'app/index.html').read_text()).group(1))))
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='TitlePerla',fontName='PerlaBold',fontSize=23,leading=28,textColor=HexColor('#063653'),spaceAfter=12))
styles.add(ParagraphStyle(name='SubPerla',fontName='Perla',fontSize=10.4,leading=15,textColor=HexColor('#526b7c'),spaceAfter=16))
styles.add(ParagraphStyle(name='HeadingPerla',fontName='PerlaBold',fontSize=11.1,leading=16,textColor=HexColor('#007aa4'),spaceAfter=4))
styles.add(ParagraphStyle(name='BodyPerla',fontName='Perla',fontSize=9.5,leading=14.4,textColor=HexColor('#193e52'),spaceAfter=13))
site='https://la-perla-indicadores-2026.esumer-3704.chatgpt.site/'
def draw(c,d):
 c.setFillColor(HexColor('#007aa4'));c.rect(0,830,595,12,fill=1,stroke=0)
 c.drawImage(logo,42,770,width=108,height=50,mask='auto',preserveAspectRatio=True)
 c.setFont('Perla',8);c.setFillColor(HexColor('#526b7c'));c.drawRightString(553,801,'LA PERLA  /  GUÍA DEL DASHBOARD');c.drawRightString(553,786,'15 de octubre de 2026')
 c.setStrokeColor(HexColor('#dce8ee'));c.line(42,44,553,44)
 c.setFont('Perla',8);c.drawString(42,28,d.title);c.drawRightString(553,28,f'{d.page} / 3')
for manual in json.loads((root/'manuales/manuales.json').read_text()):
 story=[]
 for i,page in enumerate(manual['pages']):
  if i:story.append(PageBreak())
  story.append(Paragraph(escape(page['title']),styles['TitlePerla']))
  story.append(Paragraph(escape(manual['subtitle'] if i==0 else manual['title']),styles['SubPerla']))
  story.append(Paragraph(escape(page['intro']),styles['BodyPerla']))
  for title,body in page['sections']:
   story.append(KeepTogether([Paragraph(escape(title),styles['HeadingPerla']),Paragraph(escape(body),styles['BodyPerla'])]))
  if i==0:story.append(Paragraph('<link href="'+site+'" color="#007aa4">Abrir el dashboard de La Perla</link>',styles['BodyPerla']))
 doc=SimpleDocTemplate(str(root/'manuales'/manual['file']),pagesize=(595.28,841.89),rightMargin=42,leftMargin=42,topMargin=95,bottomMargin=58,title=manual['title'],author='CBA La Perla')
 doc.build(story,onFirstPage=draw,onLaterPages=draw)
 print(manual['file'])
