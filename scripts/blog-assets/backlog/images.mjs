/** Rebuild backlog editorial graphics and pins. Run after the six hero files exist. */
import sharp from 'sharp';
import {mkdir,writeFile} from 'node:fs/promises';
import {groups,games,crafts} from './data.mjs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const ink='#29463e',sage='#dfeada',coral='#c76851',cream='#fffaf0',gold='#edc77e',muted='#5b7067';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const tx=(x,y,s,z=30,b=500,c=ink)=>`<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${z}" font-weight="${b}" fill="${c}">${esc(s)}</text>`;
const rect=(x,y,w,h,c=sage,r=22)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${c}"/>`;
const line=(x,y,xx,yy,c=ink,w=4)=>`<path d="M${x} ${y}L${xx} ${yy}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
function wrap(x,y,s,max=28,size=29,b=500,c=ink){let a='',row='',yy=y;for(const w of s.split(' ')){if((row+' '+w).trim().length>max){a+=tx(x,yy,row,size,b,c);yy+=size*1.3;row=w;}else row+=(row?' ':'')+w;}return a+tx(x,yy,row,size,b,c);}
function frame(w,h,title,sub){return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${rect(0,0,w,h,cream,0)}${tx(54,60,'KIDTIVITY LAB',23,700,coral)}${tx(54,133,title,44,700)}${tx(54,184,sub,26,500,muted)}${tx(54,h-30,'kidtivitylab.com  /  Play. Notice. Try again.',21,500,muted)}`;}
function icon(kind,x,y,scale=1){let s='';
 if(kind==='bottle')s=`<path d="M-13-38h26v17l12 15v41q0 12-12 12h-26q-12 0-12-12v-41l12-15z" fill="${sage}" stroke="${ink}" stroke-width="3"/>${rect(-15,-47,30,10,coral,3)}${rect(-20,3,40,25,gold,5)}`;
 else if(kind==='leaf')s=`<path d="M-28 30Q-48-31 32-39Q49 23-28 30Z" fill="${sage}" stroke="${ink}" stroke-width="3"/>${line(-28,30,20,-24)}${line(-5,4,-20,-13)}${line(3,-5,22,0)}`;
 else if(kind==='water')s=`<path d="M0-46C-16-19-36 0-33 20C-29 58 29 58 33 20C36 0 16-19 0-46Z" fill="#b8d9db" stroke="${ink}" stroke-width="3"/>${line(-18,16,-12,27,'#fff',5)}`;
 else if(kind==='sun')s=`<circle r="23" fill="${gold}"/>`+Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return line(Math.cos(a)*32,Math.sin(a)*32,Math.cos(a)*46,Math.sin(a)*46,coral,4)}).join('');
 else if(kind==='person')s=`<circle cy="-34" r="13" fill="${coral}"/>${line(0,-17,0,16)}${line(0,-8,-29,-20)}${line(0,-8,29,-25)}${line(0,16,-26,43)}${line(0,16,25,35)}`;
 else if(kind==='book')s=`<path d="M-42-28Q-20-38 0-25Q20-38 42-28V32Q20 23 0 36Q-20 23-42 32Z" fill="${gold}" stroke="${ink}" stroke-width="3"/>${line(0,-24,0,34)}${line(-32,-10,-10,-7)}${line(10,-7,32,-10)}`;
 else if(kind==='ear')s=`<path d="M-18 13C-46-35 31-57 30-9C31 10 13 12 10 28C5 49-17 46-17 25M-8 2C-24-24 17-35 17-11" fill="none" stroke="${ink}" stroke-width="6" stroke-linecap="round"/>`;
 else if(kind==='heart')s=`<path d="M0 33C-75-12-21-58 0-24C23-58 75-12 0 33Z" fill="${coral}"/>`;
 else if(kind==='shapes')s=`<circle cx="-21" cy="-16" r="22" fill="${coral}"/>${rect(0,3,40,40,sage,4)}<path d="M15-40L42-3H-10Z" fill="${gold}"/>`;
 else if(kind==='count')s=[0,1,2].map(i=>`<circle cx="${(i-1)*31}" cy="0" r="12" fill="${i===1?coral:gold}"/>`).join('');
 else if(kind==='pencil')s=`<path d="M-30 25L18-34L35-20L-13 39L-38 45Z" fill="${gold}" stroke="${ink}" stroke-width="3"/>${line(17,-32,33,-19)}<path d="M-37 44l5-16l14 12z" fill="${coral}"/>`;
 else if(kind==='cup')s=`<path d="M-34-32H34L26 38H-26Z" fill="${sage}" stroke="${ink}" stroke-width="3"/>${line(-27,1,28,1,'#80aeb3',5)}`;
 else if(kind==='magnifier')s=`<circle cx="-8" cy="-10" r="28" fill="#e0edef" stroke="${ink}" stroke-width="5"/>${line(13,13,39,42,coral,12)}`;
 else if(kind==='chalk')s=`<path d="M-35 24L17-34L34-19L-18 39Z" fill="${coral}"/>${line(-30,38,36,38,coral,4)}`;
 else if(kind==='jar')s=`${rect(-32,-28,64,70,'#e0edef',12)}${rect(-29,-39,58,14,coral,4)}<path d="M-22 19Q0 2 22 19V30H-22Z" fill="${sage}"/>`;
 else s=`<circle r="33" fill="${gold}"/>${tx(-11,13,'?',38,700)}`;
 return `<g transform="translate(${x},${y}) scale(${scale})">${s}</g>`;
}
async function save(i,name,w,h,s){const dir=path.join(root,'public/images/blog',groups[i][0]),sd=path.join(root,'scripts/blog-assets/svg',groups[i][0]);await mkdir(dir,{recursive:true});await mkdir(sd,{recursive:true});const svg=s+'</svg>';await writeFile(path.join(sd,name+'.svg'),svg);await sharp(Buffer.from(svg)).webp({quality:82}).toFile(path.join(dir,name+'.webp'));}
const diagrams=[];
function add(i,name,w,h,s){diagrams.push({i,name,w,h,s});}
// Three-column age guides with six concrete projects per column.
function columns(title,sub,sets,footer){let s=frame(1080,1350,title,sub);sets.forEach(([head,items],i)=>{const x=45+i*335;s+=rect(x,230,320,940,i===1?'#f6e7ca':sage)+tx(x+22,285,head,32,700);items.forEach(([label,kind],j)=>{const yy=350+j*130;s+=icon(kind,x+47,yy,.53)+wrap(x+90,yy-2,label,15,25,600);});});s+=wrap(55,1225,footer,68,23);return s;}
// Use the same complete list as the printable: 7 + 9 + 9 = 25 crafts.
if(crafts.length!==25)throw Error('Bottle guide must contain exactly 25 crafts');
let craftGuide=frame(1080,1350,'25 bottle crafts, sorted by age','Suggested ages. An adult handles all cutting and piercing.');
const craftGroups=[crafts.slice(0,7),crafts.slice(7,16),crafts.slice(16)];
const craftIcons=['bottle','bottle','bottle','bottle','bottle','count','magnifier','leaf','water','bottle','water','bottle','jar','count','bottle','cup','leaf','jar','leaf','water','water','water','pencil','shapes','sun'];
let craftNumber=0;
craftGroups.forEach((items,col)=>{const x=45+col*335;craftGuide+=rect(x,230,320,940,col===1?'#f6e7ca':sage)+tx(x+20,285,['Ages 2-4','Ages 4-6','Ages 6-10'][col],32,700);
items.forEach(([name],row)=>{const y=350+row*96;const n=craftNumber++;craftGuide+=icon(craftIcons[n],x+32,y,.4)+wrap(x+65,y-6,`${n+1}. ${name}`,18,24,600);});});
craftGuide+=wrap(55,1220,'Loose small parts: only for children past mouthing. Adults fill and seal bottles for younger children.',72,23);
add(0,'bottle-crafts-by-age',1080,1350,craftGuide);
let s=frame(1200,800,'Prep bottles before you craft','Use clean food or drink bottles, never chemical containers.');
[['Rinse','Wash out the bottle.','water'],['Dry','Let it dry completely.','sun'],['Adult cuts','Only if the craft needs it.','bottle'],['Tape edges','Cover every cut edge.','bottle']].forEach(([h,b,k],i)=>{let x=45+i*285;s+=rect(x,245,255,410,i%2?sage:'#f6e7ca')+tx(x+24,293,String(i+1).padStart(2,'0'),26,700,coral)+icon(k,x+127,390,1.05)+tx(x+24,500,h,29,700)+wrap(x+24,548,b,17,25);});
s+=tx(54,715,'Keep caps, scraps, and hot glue out of young children\'s reach.',27,600);add(0,'bottle-crafts-prep',1200,800,s);
s=frame(1080,1080,'Stamp a bottle-bottom garden','An intact bottle, washable paint, and paper.');
s+=rect(65,240,950,640,'#f4eddf');
[[270,450,coral],[550,560,'#d49a58'],[800,405,'#859f87']].forEach(([x,y,c])=>{s+=line(x,y+35,x,795,'#719584',9);s+=`<path d="M${x} ${y+200}q-95-100-95-20q20 60 95 40M${x} ${y+140}q95-100 95-20q-20 60-95 40" fill="${sage}"/>`;for(let j=0;j<5;j++){let a=j*Math.PI*2/5;s+=`<ellipse cx="${x+Math.cos(a)*52}" cy="${y+Math.sin(a)*52}" rx="31" ry="26" fill="${c}" opacity=".85"/>`;}s+=`<circle cx="${x}" cy="${y}" r="24" fill="${gold}"/>`;});
s+=tx(65,944,'Dip the base. Press once. Lift straight up.',32,700);add(0,'bottle-crafts-flower-stamp',1080,1080,s);
add(1,'water-experiments-by-age',1080,1350,columns('Water science by age','Start with a prediction. Watch together. Talk about the result.',[
 ['Ages 2-4',[['Sink or float','water'],['Sponge transfer','water'],['Pouring station','cup'],['Pipe-cleaner fish','water'],['Water painting','pencil'],['Ice melt race','sun']]],
 ['Ages 4-6',[['Walking water','cup'],['Celery drink*','leaf'],['Color mixing','shapes'],['What absorbs?','water'],['Salt + ice','water']]],
 ['Ages 6-8',[['Pepper + soap','water'],['Paper clip float','water'],['Oil + water','cup'],['Water xylophone','cup']]],
],'*Celery needs hours or overnight. Use shallow water; supervise and empty it after play.'));
s=frame(1200,800,'Predict first: will it float?','Test each object gently. Its material, shape, and trapped air matter.');
s+=rect(65,230,1070,440,'#e4eff0');
s+=`<path d="M145 335Q600 300 1055 335L980 610H220Z" fill="#b8d9db" stroke="${ink}" stroke-width="4"/>${line(150,355,1050,355,'#6f9ca4',5)}`;
s+=`<circle cx="330" cy="345" r="48" fill="${coral}"/><path d="M330 297q5-28 30-28" stroke="${ink}" fill="none" stroke-width="5"/>${rect(455,320,95,55,gold,8)}`;
s+=`<ellipse cx="690" cy="550" rx="47" ry="20" fill="#8b9a9a"/>${line(730,550,845,550,'#8b9a9a',16)}<circle cx="900" cy="560" r="32" fill="#9a9385"/>`;
s+=tx(470,275,'FLOATS: apple, dry sponge',27,700)+tx(635,650,'SINKS: metal spoon, stone',27,700)+tx(65,728,'A sponge can change as it fills with water. Try it and notice.',27);add(1,'water-experiments-sink-float',1200,800,s);
s=frame(1080,1080,'A role for every scientist','Swap jobs after each experiment. An adult stays in charge.');
[['Measurer','Gets the supplies ready.','cup'],['Pourer','Adds the ingredient slowly.','water'],['Predictor','Says what might happen.','magnifier'],['Recorder','Draws or writes the result.','pencil']].forEach(([h,b,k],i)=>{let x=55+(i%2)*495,y=240+Math.floor(i/2)*355;s+=rect(x,y,475,325,i%2?sage:'#f6e7ca')+icon(k,x+65,y+70,.75)+tx(x+130,y+80,h,35,700)+wrap(x+30,y+168,b,25,30)+tx(x+30,y+275,'My name: ______________',24);});add(2,'baking-soda-roles',1080,1080,s);
s=frame(1200,800,'Watch the gas inflate a balloon','Adult-led experiment, ages 5+. Everyone wears safety goggles.');
const bottle=(x,y,balloon)=>`<path d="M${x-22} ${y}h44v45l45 35v157q0 20-20 20h-94q-20 0-20-20V${y+80}l45-35z" fill="#e4eff0" stroke="${ink}" stroke-width="4"/>${rect(x-58,y+171,116,71,'#b8d9db',10)}${balloon?`<ellipse cx="${x}" cy="${y-67}" rx="76" ry="91" fill="${coral}"/><path d="M${x-11} ${y+11}l11-30l11 30z" fill="${coral}"/>`:`<path d="M${x-20} ${y+8}Q${x-50} ${y-70} ${x-105} ${y-35}Q${x-130} ${y+5} ${x-60} ${y+30}L${x-20} ${y+18}" fill="${coral}"/>`}`;
s+=`<g transform="translate(0,15) scale(1,.90)">`+bottle(260,425,false)+bottle(900,425,true)+line(460,465,650,465,coral,8)+`<path d="M650 465l-25-17v34z" fill="${coral}"/>`;
s+=`<circle cx="153" cy="416" r="3" fill="${cream}"/><circle cx="163" cy="420" r="3" fill="${cream}"/><circle cx="173" cy="423" r="3" fill="${cream}"/></g>`;
s+=tx(82,240,'1  Baking soda stays in balloon.',27,700)+tx(715,240,'2  Lift balloon; powder falls in.',27,700)+tx(180,664,'Vinegar in bottle',24)+tx(770,664,'Carbon dioxide fills balloon',24);
s+=rect(54,690,1092,50,sage,10)+tx(72,722,'Never add a rigid cap. Small amounts only; adult handles balloon and scraps.',23,600);add(2,'baking-soda-balloon',1200,800,s);
s=frame(1200,800,'Same toy. Two different shadows.','Trace once in the morning, then again around midday.');
[['MORNING','Lower Sun, longer shadow',false],['MIDDAY','Higher Sun, shorter shadow',true]].forEach(([h,b,short],i)=>{const x=55+i*555;s+=rect(x,235,535,435,i?sage:'#f6e7ca')+tx(x+25,285,h,25,700)+icon('sun',x+(short?120:55),short?350:420,.65);s+=`<ellipse cx="${x+(short?300:355)}" cy="560" rx="${short?42:145}" ry="24" fill="#acb2a4" stroke="#fffaf0" stroke-width="5" stroke-dasharray="8 6"/><path d="M${x+210} 495h65v60h-65z" fill="${coral}"/>`;s+=tx(x+25,625,b,25,700);});
s+=tx(55,730,'Shadow points away from the Sun. Shape and length change as the Sun moves.',25);add(3,'outdoor-science-shadow',1200,800,s);
s=frame(1080,1080,'Pack a small nature kit','Bring a question, too: "What do you notice?"');
[['Magnifier','Look closely.','magnifier'],['Sidewalk chalk','Trace a shadow.','chalk'],['Ventilated jar','Brief adult-led viewing.','jar'],['Paper + crayons','Draw what you find.','pencil'],['Collecting bag','Fallen, safe finds only.','leaf']].forEach(([h,b,k],i)=>{let x=55+(i%2)*495,y=235+Math.floor(i/2)*235;s+=rect(x,y,475,210,i%2?sage:'#f6e7ca')+icon(k,x+65,y+65,.68)+tx(x+125,y+60,h,27,700)+wrap(x+25,y+145,b,30,24);});s+=wrap(555,785,'Watch bugs without touching. Leave living things where you found them.',27,27,600);s+=tx(55,1000,'Keep jars open or ventilated; return any observed animal promptly.',21);add(3,'outdoor-science-kit',1080,1080,s);
s=frame(1080,1350,'10 games to get moving','Pick one. Clear a safe space. Finish with a slower game.');
const moves=[['Freeze Dance','2-10','Indoor'],['Follow the Leader','2-7','Indoor / outdoor'],['Animal Walk Race','2-7','Indoor / outdoor'],['Walk This Way','3-10','Indoor / outdoor'],['Animal Yoga','3-8','Indoor'],['Shape Jump','2-6','Indoor'],['Musical Cushions','3-8','Indoor'],['Balloon Keep-Up','3-10','Indoor'],['Chalk Obstacle Course','3-9','Outdoor'],['Four Corners','4-10','Indoor']];
moves.forEach(([h,a,p],i)=>{const x=55+(i%2)*495,y=235+Math.floor(i/2)*202;s+=rect(x,y,475,184,i%2?sage:'#f6e7ca')+icon(i===5?'shapes':i===8?'chalk':'person',x+52,y+59,.55)+tx(x+100,y+48,String(i+1).padStart(2,'0'),24,700,coral)+tx(x+24,y+108,h,27,700)+tx(x+24,y+151,`Ages ${a}  |  ${p}`,22);});add(4,'movement-10-games',1080,1350,s);
s=frame(1080,1080,'How would you move if...','Let your child invent the movement. There is no one right way.');
[['You were melting ice cream.','sun'],['Your robot batteries were low.','person'],['You crossed sticky jelly.','water'],['You tiptoed past a dragon.','person'],['You carried a giant cake.','cup'],['You floated like a feather.','leaf']].forEach(([v,k],i)=>{const x=55+(i%2)*495,y=235+Math.floor(i/2)*245;s+=rect(x,y,475,225,i%2?sage:'#f6e7ca')+icon(k,x+60,y+58,.53)+wrap(x+25,y+126,v,25,30,700);});add(4,'movement-prompts',1080,1080,s);
s=frame(1080,1350,'12 playful ways to practice','Skills to explore, not a test or a milestone checklist.');
const kinds=['shapes','shapes','book','ear','magnifier','shapes','ear','heart','count','count','pencil','bottle'];
games.forEach(([h,skill],i)=>{const x=55+(i%2)*495,y=230+Math.floor(i/2)*173;s+=rect(x,y,475,157,i%2?sage:'#f6e7ca')+icon(kinds[i],x+45,y+45,.45)+tx(x+85,y+44,skill.toUpperCase(),21,700,coral)+wrap(x+23,y+94,`${i+1}. ${h}`,27,26,700);});add(5,'learning-games-4-skills',1080,1350,s);
s=frame(1080,1080,'What 4-year-olds are learning','Selected CDC milestones, not goals for a single play session.');
[['Names a few colors','shapes'],['Predicts a familiar story','book'],['Draws 3+ body parts','pencil'],['Uses sentences of 4+ words','ear'],['Pretends during play','person'],['Comforts someone who is sad','heart']].forEach(([v,k],i)=>{const x=55+(i%2)*495,y=235+Math.floor(i/2)*225;s+=rect(x,y,475,205,i%2?sage:'#f6e7ca')+icon(k,x+58,y+55,.52)+wrap(x+25,y+123,v,26,28,600);});
s+=tx(55,953,'CDC milestones describe what 75% or more of children can do by an age.',23)+tx(55,988,'Not a diagnostic test. Share missed milestones or concerns with your doctor.',22);s+=tx(55,1018,'Source: CDC, Milestones by 4 Years  /  cdc.gov/act-early',20,500,muted);add(5,'learning-games-4-milestones',1080,1080,s);
for(const d of diagrams)await save(d.i,d.name,d.w,d.h,d.s);
for(let i=0;i<groups.length;i++){
 const [slug,prefix,heads,sub,offer]=groups[i];
 const hero=await sharp(path.join(root,'public/images/blog',slug,prefix+'-hero.webp')).resize(880,570,{fit:'cover'}).png().toBuffer();
 let p=`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1500">${rect(0,0,1000,1500,cream,0)}${tx(60,66,'KIDTIVITY LAB',28,700,coral)}`;
 heads.forEach((t,j)=>{p+=tx(60,185+j*112,t,94,800);});
 p+=tx(60,494,sub,31)+`<image x="60" y="550" width="880" height="570" href="data:image/png;base64,${hero.toString('base64')}"/>`+rect(60,1170,880,220,sage)+wrap(90,1235,offer,34,34,700)+tx(90,1345,'Read the guide. Try it together.',30)+tx(60,1460,'kidtivitylab.com',28,700,coral);
 await save(i,prefix+'-pin',1000,1500,p);
}
console.log(`Created ${diagrams.length} diagrams and 6 pins.`);
