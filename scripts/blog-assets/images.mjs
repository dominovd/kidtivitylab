/** Rebuild editorial diagrams and Pinterest pins; AI scene originals are kept separately. */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const groups=[
 ['preschool-adaptive-skills-checklist','adaptive-skills','Preschool adaptive skills','Ages 3 to 5 + free printable'],
 ['10-steps-to-identify-your-childs-learning-style','learning-style','How your child learns best','10 steps. No quiz needed.'],
 ['10-tips-to-help-kids-navigate-online-friendships-safely','online-friendships','Online friendship rules','10 tips + free family agreement'],
 ['5-steps-teaching-kids-savings-goals','savings-goals','Teach kids to save for a goal','5 steps + free savings tracker'],
];
const ink='#29463e',sage='#dfeada',coral='#c76851',cream='#fffaf0',gold='#eec77b';
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function text(x,y,s,size=34,weight=500,fill=ink){return `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(s)}</text>`;}
function rect(x,y,w,h,fill=sage,r=24){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;}
function wrap(x,y,s,width,size=32,weight=500){let out='',line='',yy=y;for(const word of s.split(' ')){if((line+' '+word).trim().length>width){out+=text(x,yy,line,size,weight); yy+=size*1.35;line=word;}else line+=(line?' ':'')+word;}return out+text(x,yy,line,size,weight);}
function frame(w,h,title,sub=''){return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${rect(0,0,w,h,cream,0)}${text(60,65,'KIDTIVITY LAB',24,700,coral)}${wrap(60,140,title,Math.floor((w-120)/25),46,700)}${sub?text(60,210,sub,26):''}${text(60,h-42,'kidtivitylab.com  /  Small steps. Everyday practice.',22,500)}`;}
async function save(index,name,w,h,body){const dir=path.join(root,'public/images/blog',groups[index][0]);const sourceDir=path.join(root,'scripts/blog-assets/svg',groups[index][0]);await mkdir(dir,{recursive:true});await mkdir(sourceDir,{recursive:true});const svg=body+'</svg>';await writeFile(path.join(sourceDir,name+'.svg'),svg);await sharp(Buffer.from(svg)).webp({quality:86}).toFile(path.join(dir,name+'.webp'));}
// Age guide: honest examples, with explicit source keys rather than invented milestones.
let s=frame(1080,1350,'Small skills, growing independence','Examples, not a diagnostic test');
const ages=[['3',['Pulls on loose clothing','Uses a fork','Joins other children\'s play','Avoids heat after a warning']],['4',['Opens some buttons','Pours with adult supervision','Likes being a helper','Asks to play with others']],['5',['Closes some buttons','Matches socks or clears table','Takes turns in games','Focuses for 5-10 minutes']]];
ages.forEach(([age,items],i)=>{const x=55+i*325;s+=rect(x,260,300,895,i===1?'#f7e8cc':sage);s+=text(x+28,330,'AGE '+age,38,700);items.forEach((v,j)=>{s+=`<circle cx="${x+40}" cy="${400+j*165}" r="16" fill="${coral}"/>`;s+=wrap(x+25,450+j*165,v,18,28);});});
s+=text(60,1200,'Source: CDC milestones, ages 3, 4, and 5.',25);s+=text(60,1240,'Discuss missed milestones or concerns with your pediatrician.',23);
await save(0,'adaptive-skills-by-age',1080,1350,s);
// A simple garment diagram is more precise than generated instructional text.
// --- jacket steps: backward chaining, the child's part grows from the last step ---
const adultFill='#e7e2d6', adultText='#6f7d77';
s=frame(1200,800,'Start with the last step','');
// legend
s+=rect(60,182,34,34,coral,8)+text(106,209,'Your child does it',25)+rect(360,182,34,34,adultFill,8)+text(406,209,'You help',25);
const steps=['Left arm in','Right arm in','Connect zipper','Pull zipper up'];
const cards=[['Start here','Child pulls the zipper up.'],['Next','Child connects and pulls.'],['Then','Child adds one arm.'],['Goal','Child does it all.']];
cards.forEach(([h,b],i)=>{
  const x=45+i*285, y=240;
  s+=rect(x,y,255,480,i%2?sage:'#f7e8cc');
  const cx=x+127, top=y+28;
  // long-sleeve zip jacket
  s+=`<path d="M${cx-25} ${top} L${cx-52} ${top+12} L${cx-82} ${top+105} L${cx-62} ${top+111} L${cx-44} ${top+52} V${top+118} H${cx+44} V${top+52} L${cx+62} ${top+111} L${cx+82} ${top+105} L${cx+52} ${top+12} L${cx+25} ${top} Q${cx} ${top+18} ${cx-25} ${top} Z" fill="${coral}"/>`;
  s+=`<path d="M${cx} ${top+14}V${top+116}" stroke="${cream}" stroke-width="6"/><circle cx="${cx}" cy="${top+24}" r="9" fill="${gold}"/>`;
  s+=text(x+20,y+188,h,27,700);
  s+=wrap(x+20,y+226,b,19,23);
  const childFrom=3-i; // index of the first step the child does
  steps.forEach((st,j)=>{
    const yy=y+284+j*46, child=j>=childFrom;
    s+=rect(x+16,yy,223,38,child?coral:adultFill,10);
    s+=text(x+30,yy+26,`${j+1}. ${st}`,20,700,child?cream:adultText);
  });
});
await save(0,'adaptive-skills-jacket-steps',1200,800,s);
s=frame(1080,1080,'Our morning, one step at a time','Arrange these reminders to fit your family.');
['Bathroom','Brush teeth','Get dressed','Eat breakfast','Shoes on'].forEach((v,i)=>{let y=255+i*140;s+=rect(65,y,950,115,i%2?'#f7e8cc':sage);s+=`<circle cx="130" cy="${y+58}" r="34" fill="${coral}"/>`;s+=text(120,y+70,String(i+1),32,700,cream)+text(200,y+74,v,38,700);});
await save(0,'adaptive-skills-morning-cards',1080,1080,s);
s=frame(1200,800,'One idea, three connected examples','3 + 2 = 5');
['SEE IT','SAY IT','BUILD IT'].forEach((h,i)=>{const x=45+390*i;s+=rect(x,275,360,390,i===1?'#f7e8cc':sage);s+=text(x+28,330,h,29,700);if(i===1){s+=wrap(x+28,415,'Three blocks and two more make five blocks.',15,32);}else{for(let j=0;j<5;j++){const xx=x+55+(j%3)*100, yy=405+Math.floor(j/3)*105;s+=i===0?`<circle cx="${xx}" cy="${yy}" r="29" fill="${j<3?coral:'#719584'}"/>`:rect(xx-27,yy-27,58,58,j<3?coral:'#719584',8);}}});
await save(1,'learning-style-three-ways',1200,800,s);
s=frame(1080,1350,'Skip the label. Notice what helps.');
s+=text(70,240,'MYTH',28,700,coral)+text(555,240,'WHAT HELPS',28,700);
const myths=[['Only pictures work for me.','Use pictures when they clarify the idea.'],['Liking it means learning it.','Check what is remembered later.'],['More drills today are best.','Return to practice on another day.'],['A slow answer means less ability.','Allow time and check understanding.']];
myths.forEach(([a,b],i)=>{const y=280+235*i;s+=rect(55,y,470,205,'#f7e8cc')+rect(545,y,480,205,sage);s+=wrap(80,y+58,a,22,30)+wrap(570,y+58,b,24,30);});
await save(1,'learning-style-myth-vs-fact',1080,1350,s);
s=frame(1080,1350,'Stop and get a trusted adult','You can leave a chat even if you are not sure.');
['Lots of personal questions','Keep our friendship secret','Move to another app','Who is home? Which room?','Comments about your body','Send a photo or video','Gifts with strings attached','Pressure to meet in person'].forEach((v,i)=>{const x=55+(i%2)*495,y=260+Math.floor(i/2)*235;s+=rect(x,y,475,215,i%2?sage:'#f7e8cc');s+=`<path d="M${x+38} ${y+28}h30l20 20v30l-20 20h-30l-20-20v-30z" fill="${coral}"/>`;s+=text(x+45,y+78,'!',40,700,cream);s+=wrap(x+25,y+145,v,25,29,700);});
s+=text(60,1245,'Adapted from eSafety Commissioner guidance.',23);
await save(2,'online-friendships-red-flags',1080,1350,s);
s=frame(1200,800,'Practice spotting a request for secrecy','Pretend messages. No real accounts or conversations.');
s+=rect(70,270,1060,155,sage)+text(105,325,'GAME TALK',24,700)+text(105,380,'Want to build a bridge in the game?',34);
s+=rect(70,465,1060,170,'#f8e0d5')+text(105,520,'STOP AND TELL AN ADULT',24,700,coral)+text(105,580,'Keep chatting, but don\'t tell your parents.',34);
s+=text(70,705,'You do not need to reply or prove that someone is unsafe.',29,700);
await save(2,'online-friendships-chat-example',1200,800,s);
s=frame(1080,1080,'Three jars, three choices','Choose amounts that fit your family.');
['SPEND','SAVE','SHARE'].forEach((v,i)=>{const x=55+i*340;s+=`<rect x="${x+25}" y="350" width="245" height="360" rx="40" fill="${i===1?sage:'#f7e8cc'}" stroke="${ink}" stroke-width="4"/><rect x="${x+47}" y="325" width="200" height="35" rx="9" fill="${coral}"/>`;for(let j=0;j<3+i;j++)s+=`<ellipse cx="${x+85+(j%3)*55}" cy="${660-Math.floor(j/3)*50}" rx="27" ry="17" fill="${gold}" stroke="${ink}" stroke-width="2"/>`;s+=text(x+60,465,v,32,700);});
s+=wrap(75,820,'A single savings jar is enough to start. More jars are optional.',42,34);s+=text(75,963,'Keep coins away from under-3s and children who mouth objects.',23);
await save(3,'savings-goals-three-jars',1080,1080,s);
s=frame(1080,1350,'Five steps to a savings goal','Small amounts. A visible plan. Weekly practice.');
['Pick one affordable goal','Make the goal and progress visible','Agree where the money comes from','Count together each week','Buy it, then talk about it'].forEach((v,i)=>{let y=270+i*185;s+=rect(60,y,960,155,i%2?'#f7e8cc':sage);s+=`<circle cx="135" cy="${y+78}" r="42" fill="${coral}"/>`;s+=text(121,y+93,String(i+1),42,700,cream)+wrap(215,y+68,v,34,33,700);});
await save(3,'savings-goals-steps',1080,1350,s);
// Pinterest artwork: 110px headlines remain readable at a 250px-wide preview.
const pinHeadlines = [
 ['Preschool', 'adaptive skills', 'checklist'],
 ['How your child', 'learns best'],
 ['10 online', 'friendship rules', 'for kids'],
 ['Teach kids', 'to save for', 'a goal'],
];
const pinSubheads = [
 '25 skills. Ages 3 to 5.',
 '10 practical steps. No quiz needed.',
 'Simple rules. Calm conversations.',
 '5 steps. One achievable goal.',
];
const pinOffers = [
 'FREE PRINTABLE CHECKLIST',
 'FREE OBSERVATION LOG',
 'FREE FAMILY AGREEMENT',
 'FREE SAVINGS TRACKER',
];
for(let i=0;i<groups.length;i++){
 const [slug,prefix]=groups[i];const dir=path.join(root,'public/images/blog',slug);
 const headline=pinHeadlines[i];
 const titleBottom=190+(headline.length-1)*120;
 const imageTop=titleBottom+155;
 const imageHeight=1230-imageTop;
 const img=await sharp(path.join(dir,prefix+'-hero.webp')).resize(880,imageHeight,{fit:'cover'}).png().toBuffer();
 let pin=`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1500" viewBox="0 0 1000 1500">`;
 pin+=rect(0,0,1000,1500,cream,0);
 pin+=text(60,65,'KIDTIVITY LAB',29,700,coral)+rect(60,93,120,8,coral,4);
 headline.forEach((line,j)=>{pin+=text(60,190+j*120,line,110,800);});
 pin+=text(60,titleBottom+80,pinSubheads[i],34,500);
 pin+=`<image x="60" y="${imageTop}" width="880" height="${imageHeight}" href="data:image/png;base64,${img.toString('base64')}"/>`;
 pin+=rect(60,1270,880,150,sage);
 pin+=text(95,1330,pinOffers[i],38,700);
 pin+=text(95,1382,'Read the guide. Try it at home.',32,500);
 pin+=text(60,1470,'kidtivitylab.com',28,700,coral);
 await save(i,prefix+'-pin',1000,1500,pin);
}
console.log('Created 9 diagrams and 4 Pinterest pins. SVG sources: scripts/blog-assets/svg/.');
