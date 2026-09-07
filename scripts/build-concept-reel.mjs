import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
const temp=path.resolve('docs/qa-wolff/media-temp');mkdirSync(temp,{recursive:true});
const names=['brand-film','identity-system','package-system','campaign-graphic','space-experience','creative-collaboration','brand-activation','film-production'];
function run(args){const r=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{stdio:'inherit'});if(r.status!==0)throw Error('FFmpeg failed');}
for(const [i,name]of names.entries()){
 run(['-loop','1','-i',path.resolve(`public/assets/work-generated/v2/${name}-01.webp`),'-vf',`scale=1600:900:force_original_aspect_ratio=increase,crop=1600:900,zoompan=z='min(zoom+0.001,1.08)':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=45:s=1280x720:fps=30`,'-frames:v','45','-c:v','libx264','-preset','fast','-crf','21','-pix_fmt','yuv420p',path.join(temp,`${i}.mp4`)]);
}
writeFileSync(path.join(temp,'list.txt'),names.map((_,i)=>`file '${i}.mp4'`).join('\n'));
run(['-f','concat','-safe','0','-i',path.join(temp,'list.txt'),'-c','copy','-movflags','+faststart',path.resolve('public/assets/osmu-concept-reel-v2.mp4')]);
console.log('Created 12-second OSMU concept-image reel (1280×720, 30 fps, silent H.264).');
