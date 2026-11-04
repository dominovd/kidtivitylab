"""Rebuild five US Letter printables for the six backlog articles."""
from pathlib import Path
import json
import argparse
from io import BytesIO
parser=argparse.ArgumentParser()
parser.add_argument("--only", help="Only write the named PDF; leave other outputs unchanged.")
args=parser.parse_args()
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import simpleSplit
ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'public/downloads'
OUT.mkdir(parents=True,exist_ok=True)
DATA=json.loads(Path(__file__).with_name('printable-data.json').read_text())
INK=HexColor('#29463e'); SAGE=HexColor('#e8eee4'); CORAL=HexColor('#b65f49'); GRAY=HexColor('#66766d'); RULE=HexColor('#cbd5cc')
def text(c,x,y,s,z=10,b=False,color=INK):
 c.setFillColor(color);c.setFont('Helvetica-Bold' if b else 'Helvetica',z);c.drawString(x,y,s)
def lines(c,x,y,s,width,z=10,b=False,leading=None):
 for row in simpleSplit(s,'Helvetica-Bold' if b else 'Helvetica',z,width):
  text(c,x,y,row,z,b);y-=leading or z*1.35
 return y

def line(c,x,y,xx,yy):
 c.setStrokeColor(RULE);c.setLineWidth(.65);c.line(x,y,xx,yy)
def box(c,x,y,w,h,fill=False):
 c.setStrokeColor(RULE);c.setFillColor(SAGE);c.roundRect(x,y,w,h,7,stroke=1,fill=int(fill))
def check(c,x,y):
 c.setStrokeColor(INK);c.setLineWidth(.7);c.rect(x,y,10,10)
def start(name,title,sub):
 c=canvas.Canvas(str(OUT/name) if not args.only or args.only==name else BytesIO(),pagesize=(612,792));c.setTitle(title);c.setAuthor('Kidtivity Lab');c.setSubject('Free family printable');return c

def frame(c,title,sub,page=1,pages=1):
 c.setFillColor(SAGE);c.roundRect(36,733,540,30,7,fill=1,stroke=0);text(c,48,744,'KIDTIVITY LAB',11,True)
 text(c,36,700,title,23,True);lines(c,36,679,sub,540,10)
 line(c,36,44,576,44);text(c,36,28,'kidtivitylab.com  |  Free family printable',9,color=GRAY);text(c,540,28,f'{page}/{pages}',9,color=GRAY)
# Two pages: readable rows, with explicit adult tasks and room for checks.
name='bottle-craft-picker.pdf';c=start(name,'Pick a bottle craft','')
for p,items in enumerate([DATA['crafts'][:16],DATA['crafts'][16:]],1):
 frame(c,'Pick a bottle craft','25 ideas | Suggested ages and approximate hands-on times; allow drying time.',p,2)
 text(c,36,644,'Name: _________________________   Date: ______________________',10)
 text(c,36,620,'Adult handles cutting, piercing, hot glue, and all loose small parts.',10,True)
 lines(c,36,602,'Loose caps, rice, pom-poms, and small objects are for children past mouthing only. For younger children, an adult fills and securely seals bottles before play.',540,9.5)
 cols=[36,305,357,443,535,576];top=556
 c.setFillColor(SAGE);c.rect(36,top-27,540,27,stroke=0,fill=1)
 for x,h in zip(cols,['Craft','Ages','Minutes','Adult cuts?','Done']):text(c,x+6,top-18,h,9,True)
 y=top-27
 for i,(craft,age,mins,cut) in enumerate(items,start=1 if p==1 else 17):
  height=25
  text(c,42,y-17,f'{i:02d}. {craft}',9.6);text(c,311,y-17,age,9.5);text(c,363,y-17,mins,9.5);text(c,449,y-17,cut,9.5);check(c,550,y-19);line(c,36,y-height,576,y-height);y-=height
 if p==1:
  lines(c,36,104,'"No" means no bottle cutting. Adults may still need to prepare parts. Bubble snake: blow out only, never suck in. Catch cup: adult supervises the cord and small ball.',540,9)
 else:
  text(c,36,273,'My pick for today: ___________________________________________',12,True)
  text(c,36,243,'What we need: ______________________________________________',10.5)
  line(c,36,217,576,217);line(c,36,190,576,190)
  text(c,36,164,'One thing we would change next time:',10.5,True);line(c,36,137,576,137)
  lines(c,36,107,'Use washed food or drink bottles. Tape cut edges. Secure filled caps; check for leaks. LED lights only, never flames. Keep button batteries inaccessible. Store cords and small parts away.',540,9)
 c.showPage()
c.save()
# Two matching experiments per sheet, each with a large drawing frame.
name='water-experiment-card.pdf';c=start(name,'My water experiment','');frame(c,'My water experiment','Predict. Try it together. Draw what you noticed.')
text(c,36,645,'Name: _________________________   Date: ______________________',10)
for i,top in enumerate([620,356],1):
 box(c,36,top-244,540,244)
 text(c,50,top-22,f'EXPERIMENT {i}',10,True,color=CORAL)
 text(c,50,top-45,'We used: _________________________________________________',10)
 text(c,50,top-72,'I think: ___________________________________________________',10)
 line(c,50,top-94,562,top-94)
 text(c,50,top-115,'What happened: ___________________________________________',10)
 box(c,50,top-229,512,98);text(c,61,top-150,'Draw it here',9,color=GRAY)
lines(c,36,87,'Adult stays close and watches constantly. Use shallow water; empty it after play. Keep small objects away from children who mouth them. No tasting or hot water.',540,9)
c.showPage();c.save()
# Role cards plus four-entry log.
name='baking-soda-family-roles.pdf';c=start(name,'Our family science roles','');frame(c,'Our family science roles','Swap roles each round. An adult prepares and supervises every experiment.')
roles=[('MEASURER','Gets the supplies ready.'),('POURER','Adds ingredients slowly.'),('PREDICTOR','Says what might happen.'),('RECORDER','Draws or writes the result.')]
for i,(title,desc) in enumerate(roles):
 x=36+(i%2)*276;top=636-(i//2)*104;box(c,x,top-92,264,92,True);text(c,x+13,top-23,title,12,True,color=CORAL);text(c,x+13,top-43,desc,10);text(c,x+13,top-72,'Name: ________________________',10)
text(c,36,400,'Our experiment log',14,True)
cols=[36,160,343,576];top=384
for x,t in zip(cols,['Experiment / date','We predicted...','We noticed...']):text(c,x+5,top-14,t,9,True)
for j in range(5):line(c,36,top-26-j*49,576,top-26-j*49)
for x in cols:line(c,x,top,x,top-222)
lines(c,36,128,'Family question: What would we change and try next?',540,10,True)
line(c,36,104,576,104)
lines(c,36,84,'Wear goggles. No tasting. Work on a tray. Never cap a reacting bottle. An adult handles balloons and scraps; keep them away from young children.',540,9)
c.showPage();c.save()
# The outdoor journal gives most of its area to an actual drawing.
name='nature-notebook.pdf';c=start(name,'My nature notebook','');frame(c,'My nature notebook','Look closely. Draw something real. Ask one new question.')
text(c,36,645,'Name: _________________________   Date: ______________________',10)
text(c,36,620,'Place: _________________________   Weather: ___________________',10)
box(c,36,292,540,304);text(c,50,573,'Draw what you noticed',12,True)
text(c,36,264,'I saw...',12,True);line(c,36,241,576,241);line(c,36,216,576,216)
text(c,36,187,'I wonder...',12,True);line(c,36,164,576,164);line(c,36,139,576,139)
lines(c,36,110,'Grown-ups can write down the child\'s exact words. There is no right answer.',540,10)
lines(c,36,84,'Stay with an adult. Watch animals without touching. Do not taste plants, berries, or mushrooms. Collect only where allowed and wash hands after exploring.',540,9)
c.showPage();c.save()
# Printable game list includes skills but makes no milestone promise.
name='learning-games-4-list.pdf';c=start(name,'12 learning games for age 4','');frame(c,'12 learning games for age 4','No worksheets. Pick a game, play together, and stop while it is still fun.')
text(c,36,644,'Name: _________________________   Week of: ___________________',10)
text(c,36,617,'Practice ideas, not a developmental test. These skills can overlap.',10)
cols=[36,330,484,576];top=592
c.setFillColor(SAGE);c.rect(36,top-28,540,28,fill=1,stroke=0)
for x,t in zip(cols,['Game','Practice','Tried it']):text(c,x+7,top-19,t,10,True)
y=top-28
for i,(game,skill,slug) in enumerate(DATA['games'],1):
 text(c,44,y-22,f'{i:02d}. {game}',10.5);text(c,338,y-22,skill,9.5);check(c,523,y-25)
 if slug:c.linkURL(f'https://kidtivitylab.com/activities/{slug}/',(44,y-29,320,y-7),relative=0)
 line(c,36,y-35,576,y-35);y-=35
text(c,36,116,'Our favorite: __________________________________________________',10.5)
lines(c,36,88,'Adult supervises. Keep small parts away from children who mouth objects.',540,9)
c.showPage();c.save()
print('Updated', args.only or '5 PDFs (6 US Letter pages).')
