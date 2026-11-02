/** Article 5: WebPs go to public; editable SVGs stay beside the build tooling. */
import sharp from 'sharp';
import { mkdir, writeFile, appendFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const slug='balancing-screen-time-and-social-play-for-kids';
const dir=path.join(root,'public/images/blog',slug);
const sourceDir=path.join(root,'scripts/blog-assets/svg',slug);
await mkdir(dir,{recursive:true});await mkdir(sourceDir,{recursive:true});
const heroSource=process.argv[2];
if(heroSource){for(const width of [1600,800])await sharp(heroSource).resize(width,width*9/16,{fit:'cover'}).webp({quality:80}).toFile(path.join(dir,`screen-social-play-hero${width===800?'-800':''}.webp`));}
const ink='#29463e',sage='#dfeada',coral='#c76851',cream='#fffaf0',sand='#f7e8cc';
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const text=(x,y,s,size=30,bold=false,color=ink)=>`<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-size="${size}" font-weight="${bold?700:500}" fill="${color}">${esc(s)}</text>`;
const rect=(x,y,w,h,fill=sage,r=22)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
function wrap(x,y,s,max=26,size=30,bold=false){let line='',out='',yy=y;for(const w of s.split(' ')){if((line+' '+w).trim().length>max){out+=text(x,yy,line,size,bold);yy+=size*1.3;line=w;}else line+=(line?' ':'')+w;}return out+text(x,yy,line,size,bold);}
function start(w,h,title,sub){return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${rect(0,0,w,h,cream,0)}${text(55,65,'KIDTIVITY LAB',25,true,coral)}${text(55,135,title,44,true)}${text(55,192,sub,26)}${text(55,h-35,'kidtivitylab.com',23,true,coral)}`;}
async function save(name,s){const svg=s+'</svg>';await writeFile(path.join(sourceDir,name+'.svg'),svg);await sharp(Buffer.from(svg)).webp({quality:86}).toFile(path.join(dir,name+'.webp'));}
let s=start(1080,1350,'Screen guidance, with context','Quality, company, and what screens replace all matter.');
s+=text(70,260,'AGE',27,true)+text(235,260,'WHO (2019)',27,true)+text(640,260,'AAP (2026)',27,true);
const ages=[
 ['Under 2','Not recommended under 1 or at age 1.','Prioritize real-world interaction, especially in infancy.'],
 ['2','No more than 1 hour daily. Less is better.','Tailor boundaries. Under 1 hour is its toddler/preschool example.'],
 ['3-4','No more than 1 hour daily. Less is better.','Consider content, co-use, and what gets crowded out.'],
 ['5-10','Not covered by this under-5 guideline.','Tailor recreational limits. School-age examples: 1-2 hours or more.'],
];
ages.forEach(([age,who,aap],i)=>{const y=285+i*218;s+=rect(55,y,970,198,i%2?sand:sage);s+=wrap(75,y+53,age,8,29,true)+wrap(235,y+50,who,23,28)+wrap(640,y+50,aap,22,28);});
s+=text(55,1193,'WHO refers to sedentary screen time. AAP examples are flexible.',24);
s+=text(55,1231,'Protect sleep, movement, reading, play, and family time first.',24);
s+=text(55,1272,'Sources: who.int (under-5 guidance); AAP, doi:10.1542/peds.2025-075320',21);
await save('screen-social-play-guidelines',s);
s=start(1200,800,'Plan the day first. Fit screens around it.','A planning order, not a clock-based schedule or recommended quota.');
const priorities=[['SLEEP + DAILY ROUTINES','Bedtime, school, and getting ready'],['MEALS TOGETHER','Choose a meal with devices away'],['MOVEMENT','Outdoor play or active indoor play'],['PLAY WITH OTHERS','A friend, sibling, or caregiver']];
priorities.forEach(([h,b],i)=>{const x=55+(i%2)*550,y=240+Math.floor(i/2)*155;s+=rect(x,y,520,130,i%2?sand:sage);s+=text(x+25,y+45,h,26,true)+wrap(x+25,y+90,b,34,25);});
s+=rect(55,575,1070,145,'#f5ddd3')+text(80,625,'THEN: A PLANNED SCREEN WINDOW',30,true)+text(80,677,'Choose the content, company, and ending before you start.',29);
await save('screen-social-play-day-plan',s);
s=start(1080,1350,'Eight moments. Easy games to try.','Offer a first action, not just "Go play."');
const swaps=[['Rainy afternoon','Freeze Dance','Clear space. Take turns choosing poses.'],['Friends arrive','Pass the Parcel','Try shared silly prompts.'],['After preschool','Follow the Leader','Let a tired child lead gently.'],['Dinner preparation','Story Chain','Add a sentence from a safe spot.'],['Siblings together','Shadow Puppet Theater','One makes shapes; one narrates.'],['Long drive','A traveling story','Stay buckled. Let the driver focus.'],['Waiting room','Quiet hand-animal guessing','Small shapes. Quiet voices.'],['Before bed','Blanket-fort reading','Read together, then use your usual bed.']];
swaps.forEach(([a,b,c],i)=>{const x=55+(i%2)*495,y=245+Math.floor(i/2)*253;s+=rect(x,y,475,231,i%2?sand:sage);s+=text(x+23,y+40,a,25,true,coral)+wrap(x+23,y+87,b,23,30,true)+wrap(x+23,y+160,c,29,25);});
await save('screen-social-play-swaps',s);
// Match the revised Pinterest style: large headlines, full image, compact offer.
const image=await sharp(path.join(dir,'screen-social-play-hero.webp')).resize(880,625,{fit:'cover'}).png().toBuffer();
s=`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1500" viewBox="0 0 1000 1500">${rect(0,0,1000,1500,cream,0)}${text(60,65,'KIDTIVITY LAB',29,true,coral)}${rect(60,93,120,8,coral,4)}`;
['Screen time +','social play:','a simple balance'].forEach((line,i)=>s+=text(60,190+i*120,line,105,true));
s+=text(60,510,'Make room for people, not just screens.',33);
s+=`<image x="60" y="595" width="880" height="625" href="data:image/png;base64,${image.toString('base64')}"/>`;
s+=rect(60,1270,880,150,sage)+text(95,1330,'FREE WEEKLY PLAN',42,true)+text(95,1382,'Small changes for real family days.',31)+text(60,1470,'kidtivitylab.com',28,true,coral);
await save('screen-social-play-pin',s);
console.log('Built article 5 diagrams, pin, and optional hero exports.');
