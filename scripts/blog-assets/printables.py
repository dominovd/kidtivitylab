"""Build the four US Letter blog worksheets. Requires reportlab."""
from pathlib import Path
from io import BytesIO
import argparse
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import simpleSplit

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/downloads'
OUT.mkdir(parents=True, exist_ok=True)
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--only', help='Rebuild only the named PDF filename.')
args = parser.parse_args()
INK = HexColor('#263f3b')
GREEN = HexColor('#eaf1e8')
CORAL = HexColor('#bc624b')
GRAY = HexColor('#60716b')

def text(c, x, y, s, size=10, bold=False, color=INK):
    c.setFillColor(color)
    c.setFont('Helvetica-Bold' if bold else 'Helvetica', size)
    c.drawString(x, y, s)

def lines(c, x, y, s, width=510, size=10, leading=14):
    for line in simpleSplit(s, 'Helvetica', size, width):
        text(c,x,y,line,size)
        y-=leading
    return y

def page_frame(c, title, sub, page=1, pages=1):
    c.setFillColor(GREEN); c.roundRect(36,702,540,54,12,fill=1,stroke=0)
    text(c,50,734,'KIDTIVITY LAB',11,True)
    text(c,50,716,'Small steps. Everyday practice.',10)
    text(c,36,674,title,22,True)
    lines(c,36,652,sub,540,10)
    c.setStrokeColor(HexColor('#cbd7cf')); c.line(36,44,576,44)
    text(c,36,28,'kidtivitylab.com  |  Free family printable',9,color=GRAY)
    text(c,537,28,f'{page} / {pages}',9,color=GRAY)

def base(name, title, sub, pages=1):
    target = str(OUT/name) if not args.only or args.only == name else BytesIO()
    c=canvas.Canvas(target, pagesize=(612,792))
    c.setTitle(title)
    c.setAuthor('Kidtivity Lab')
    page_frame(c, title, sub, pages=pages)
    return c

def rule(c,y,x1=36,x2=576):
    c.setStrokeColor(HexColor('#cbd7cf')); c.line(x1,y,x2,y)

def box(c,x,y):
    c.setStrokeColor(INK); c.rect(x,y,10,10,fill=0,stroke=1)

# Each item corresponds to the article's age table. Practice ages are suggestions,
# not published milestones. AAP references cover the broad 4-5-year range.
checklist_sections = [
    ('Dressing', [
        ('Puts on loose pants or a jacket.', '3 / CDC'),
        ('Opens some buttons.', '4 / CDC'),
        ('Closes some buttons.', '5 / CDC'),
        ('Dresses and undresses with little help.', '4-5 / AAP'),
    ]),
    ('Eating', [
        ('Uses a fork.', '3 / CDC'),
        ('Serves food with adult supervision.', '4 / CDC'),
        ('Pours water with adult supervision.', '4 / CDC'),
        ('Uses a spoon.', '4-5 / AAP'),
    ]),
    ('Toileting and hygiene', [
        ('Helps with a step of washing or dressing after toileting.', '3 / practice'),
        ('Practices the bathroom sequence with needed help.', '4 / practice'),
        ('Usually manages their own toilet needs.', '4-5 / AAP'),
        ('Washes and dries hands.', '4-5 / AAP'),
    ]),
    ('Helping at home', [
        ('Carries an unbreakable cup to the counter.', '3 / practice'),
        ('Enjoys being a helper.', '4 / CDC'),
        ('Matches socks.', '5 / CDC'),
        ('Helps clear the table after eating.', '5 / CDC'),
    ]),
    ('Safety', [
        ('Avoids touching something hot after a warning.', '3 / CDC'),
        ('Avoids some playground dangers.', '4 / CDC'),
        ('Practices stopping at the curb with an adult.', '5 / practice'),
    ]),
    ('Playing with others', [
        ('Notices other children and joins their play.', '3 / CDC'),
        ('Asks to play with other children.', '4 / CDC'),
        ('Follows rules or takes turns in games.', '5 / CDC'),
    ]),
    ('Handling feelings', [
        ('Settles within 10 minutes after a caregiver leaves.', '3 / CDC'),
        ('Adjusts behavior to different places.', '4 / CDC'),
        ('Practices asking for a break or help when frustrated.', '5 / practice'),
    ]),
]
assert sum(len(items) for _, items in checklist_sections) == 25
checklist_name = 'preschool-adaptive-skills-checklist.pdf'
target = str(OUT/checklist_name) if not args.only or args.only == checklist_name else BytesIO()
c=canvas.Canvas(target, pagesize=(612,792))
c.setTitle('Preschool adaptive skills checklist')
c.setAuthor('Kidtivity Lab')
item_number = 0
for page_number, sections in enumerate([checklist_sections[:3], checklist_sections[3:]], start=1):
    c.setFillColor(GREEN);c.roundRect(36,738,540,30,8,fill=1,stroke=0)
    text(c,48,749,'KIDTIVITY LAB',11,True)
    text(c,36,712,'Preschool adaptive skills checklist',22,True)
    text(c,36,693,'25 specific skills | Ages 3-5 | Observe familiar routines for a week.',10)
    text(c,36,672,'Child: _____________________  Age: ______  Week of: ______________',10.5)
    text(c,36,652,'Mark one box per item. Supports can count as independent. Keep needed adult supervision.',9)
    text(c,36,636,'Age guide: CDC = 75%+ milestone; AAP = ages 4-5; practice = suggestion, not a deadline.',8.5)
    text(c,36,621,'Not a diagnostic test. Discuss missed milestones, lost skills, or concerns with your pediatrician.',8.5)
    text(c,40,606,'Everyday skill',10,True)
    text(c,335,606,'Age / source',9,True)
    for x,label in [(434,'Alone'),(480,'Help'),(524,'Not yet')]: text(c,x,606,label,9,True)
    y=594
    for area, items in sections:
        c.setFillColor(GREEN);c.roundRect(36,y-20,540,20,5,fill=1,stroke=0)
        text(c,43,y-14,area,10.5,True)
        y-=22
        for task, age in items:
            item_number += 1
            label=f'{item_number:02d}. {task}'
            wrapped=simpleSplit(label,'Helvetica',9.5,283)
            height=max(24, len(wrapped)*12+8)
            for n,line in enumerate(wrapped): text(c,43,y-17-n*12,line,9.5)
            text(c,335,y-17,age,9)
            for x in [443,486,534]:box(c,x,y-20)
            rule(c,y-height)
            y-=height
        y-=6
    # Notes sit directly beneath the table, so both pages remain useful for recording.
    text(c,36,y-15,'Notes / supports used: __________________________________________________',9.5)
    rule(c,y-39)
    if page_number == 2:
        text(c,36,y-61,'One next step: _______________________________________________________',9.5)
        text(c,36,y-85,'Review date: ______________________',9.5)
    else:
        text(c,36,y-62,'Keep both pages together. Continue with items 13-25 on page 2.',9.5,True)
    # Clickable source labels work digitally and fit in the printed footer.
    urls=[
        ('Sources: CDC milestone checklists, ages 3, 4, and 5', 'https://www.cdc.gov/act-early/milestones/'),
        ('AAP: Developmental Milestones, 4 to 5 Year Olds',
         'https://www.healthychildren.org/English/ages-stages/preschool/Pages/Developmental-Milestones-4-to-5-Year-Olds.aspx'),
    ]
    for j,(label,url) in enumerate(urls):
        yy=65-j*12
        text(c,36,yy,label,8,color=GRAY)
        c.linkURL(url,(36,yy-2,310,yy+9),relative=0)
    rule(c,44)
    text(c,36,28,'kidtivitylab.com  |  Free family printable',9,color=GRAY)
    text(c,537,28,f'{page_number} / 2',9,color=GRAY)
    c.showPage()
c.save()

c=base('learning-observation-log.pdf','Two-week learning observation log','Notice the task, what helped, and what your child remembered later. No style labels needed.')
text(c,36,609,'Child: ________________________  Dates: ___________________________',11)
cols=[36,72,215,267,418,576]
headers=['Day','Task / goal','Minutes','What helped','Where they got stuck']
for i,h in enumerate(headers): text(c,cols[i]+5,580,h,8.5,True)
y=568
for n in range(1,15):
    rule(c,y)
    text(c,46,y-20,str(n),10)
    for x in cols: c.setStrokeColor(HexColor('#cbd7cf')); c.line(x,y,x,y-27)
    y-=27
rule(c,y)
text(c,36,167,'Later check: What did they remember after a few days?',10,True)
rule(c,143); rule(c,119)
text(c,36,98,'One adjustment to try next: ______________________________________________',10)
text(c,36,74,'Keep it informal. Share recurring difficulties with your child\'s teacher.',9,color=GRAY)
c.showPage();c.save()

c=base('online-friendship-family-agreement.pdf','Our online friendship agreement','For elementary-age kids and their adults | Read together and adjust as your child grows.')
text(c,36,609,'Games / devices: _____________________________________________________',11)
rules=[
'We play age-appropriate games with the family settings we agreed on.',
'We check with an adult before adding a new contact or changing settings.',
'We keep real names, school, address, location, and passwords private.',
'We tell an adult about requests for secrets, gifts, pictures, or meetings.',
'We do not send photos or start video calls with gaming contacts.',
'We ask before moving a conversation to another app.',
'We never arrange an in-person meeting on our own.',
'We stop uncomfortable conversations and ask an adult to help block or report.',
'We use shared spaces and charge devices in our agreed place at night.',
'Adults listen calmly. Telling is not punished; we make safety changes together.'
]
y=580
for s in rules:
    box(c,38,y-1); y=lines(c,58,y,s,508,10.5,15)-19
text(c,36,199,'My trusted adults: _____________________________________________________',10)
text(c,36,169,'Child: _________________________  Adult: _______________________________',10)
text(c,36,139,'Date: __________________________  Review date: _________________________',10)
lines(c,36,108,'Our promise: You can tell us even if you broke a rule. You do not have to handle a worrying contact alone. We may pause contact or change settings to protect you.',540,10,14)
c.showPage();c.save()

c=base('savings-goal-tracker.pdf','My savings goal','Choose a goal, decide how to save, and count together each week.')
text(c,36,609,'My goal: ____________________________________________________________',11)
text(c,36,581,'It costs $__________  I have $__________  I save $__________ each week.',11)
text(c,36,553,'Each section = $__________  (Goal amount divided by 20.)',11)
c.setStrokeColor(HexColor('#b6c9bf'));c.roundRect(36,345,230,187,10,fill=0)
text(c,51,510,'Draw your goal here',11,True)
# Twenty generous colorable sections inside a jar silhouette.
c.setStrokeColor(INK);c.setLineWidth(2)
c.roundRect(314,340,230,175,18,fill=0)
c.roundRect(335,516,188,17,4,fill=0)
for r in range(4):
    for col in range(5):
        x=325+col*42;y=351+r*39
        c.setLineWidth(.6);c.roundRect(x,y,36,31,3,fill=0)
text(c,319,321,'Color sections only after saving the money.',9)
text(c,36,295,'Weekly counting day: _____________________  Goal date: ________________',10)
text(c,40,266,'Date',10,True);text(c,170,266,'Added',10,True);text(c,300,266,'Total saved',10,True);text(c,438,266,'Still needed',10,True)
for y in [253,223,193,163]: rule(c,y)
text(c,36,137,'After buying: Was it worth the wait? What was hard? What is next?',10,True)
rule(c,112);rule(c,87)
text(c,36,65,'Coins are choking hazards. Keep away from under-3s and children who mouth objects.',8.5,color=GRAY)
c.showPage();c.save()
print('Updated', args.only or 'four US Letter PDFs (checklist: 2 pages; others: 1 page)', 'in', OUT)
