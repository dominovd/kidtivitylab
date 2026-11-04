import sharp from 'sharp';
import {groups} from './data.mjs';
import {readdir,mkdir} from 'node:fs/promises';
import path from 'node:path';
const out='scripts/blog-assets/previews/backlog';await mkdir(out,{recursive:true});
for (const [slug,prefix] of groups){
 const dir=`public/images/blog/${slug}`;
 const files=(await readdir(dir)).filter(f=>f.endsWith('.webp')&&!f.endsWith('-800.webp')).sort((a,b)=>(a.includes('-hero')?-1:b.includes('-hero')?1:0));
 const tiles=await Promise.all(files.map(async(f,i)=>({input:await sharp(path.join(dir,f)).resize(540,700,{fit:'contain',background:'#eeeeea'}).png().toBuffer(),left:(i%3)*540,top:Math.floor(i/3)*700})));
 await sharp({create:{width:1620,height:Math.ceil(files.length/3)*700,channels:3,background:'#eeeeea'}}).composite(tiles).png().toFile(`${out}/${prefix}.png`);
}
