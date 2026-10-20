import { readFileSync,readdirSync,mkdirSync,writeFileSync } from 'node:fs';
const folder=process.argv[2]??'qa-results/scale';
const files=readdirSync(folder).filter(f=>/^lifetimes-\d+\.json$/.test(f));
const reports=files.map(f=>JSON.parse(readFileSync(`${folder}/${f}`,'utf8'))).sort((a,b)=>a.seedOffset-b.seedOffset);
if(reports.length!==40)throw new Error(`Expected 40 successful shards, found ${reports.length}`);
for(let i=0;i<40;i++){const r=reports[i];if(r.seedOffset!==i*2500||r.count!==2500||r.ticks<r.count*900||r.engineVersion!=='1.3.0-alpha.1')throw new Error(`Invalid or overlapping shard ${i}`);}
const result={engineVersion:'1.3.0-alpha.1',sourceGrade:'ASSUMPTION',count:reports.reduce((s,r)=>s+r.count,0),ticks:reports.reduce((s,r)=>s+r.ticks,0),decisions:reports.reduce((s,r)=>s+r.decisions,0),shards:40,modeCounts:{REALISM:reports.reduce((s,r)=>s+r.modeCounts.REALISM,0),HARDSHIP:reports.reduce((s,r)=>s+r.modeCounts.HARDSHIP,0)},seedRange:[0,99999],note:'100k actual full lifetime simulations; synthetic scenario invariants, not population calibration.'};
mkdirSync('qa-results',{recursive:true});writeFileSync('qa-results/scale-summary.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
