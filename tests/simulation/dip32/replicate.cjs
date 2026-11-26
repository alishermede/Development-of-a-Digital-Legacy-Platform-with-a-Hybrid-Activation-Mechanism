const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {rng,sampleStress,evaluate,quantile,nondominated,wilson,coalitionOracle}=require('./model.cjs');
const cfg=JSON.parse(fs.readFileSync(path.join(__dirname,'replication.json')));
if(new Set(cfg.seeds).size!==cfg.seeds.length||cfg.seeds.length<2||!Number.isInteger(cfg.trials)||cfg.trials<100)throw Error('Distinct replication seeds and >=100 trials required');
const rows=[],aggregate=new Map();
const key=r=>r.method==='baseline'?`${r.scenario}:baseline:${r.interval}`:`${r.scenario}:hybrid:${r.n}:${r.k}:${r.interval}:${r.waiting}`;
for(const seed of cfg.seeds){
 const random=rng(seed),worlds=Array.from({length:cfg.trials},()=>sampleStress(random)),batch=[];
 for(const s of cfg.scenarios)for(let n=2;n<=5;n++)for(let k=2;k<=n;k++)for(const interval of cfg.intervals)for(const waiting of cfg.waitingPeriods){
  const c={n,k,interval,waiting},h={false:0,missing:0,coalition:0,delays:[]},b={false:0,missing:0,coalition:0,delays:[]};
  for(const w of worlds){const r=evaluate(c,s,w);h.false+=+r.alive.hybrid;b.false+=+r.alive.baseline;h.missing+=+r.deceased.hybridMissing;b.missing+=+r.deceased.baselineMissing;h.coalition+=+r.alive.coalition;if(!r.deceased.hybridMissing)h.delays.push(r.deceased.hybridDelay);if(!r.deceased.baselineMissing)b.delays.push(r.deceased.baselineDelay);if(r.alive.hybrid&&!r.alive.baseline)throw Error('Paired subset violation');}
  for(const [method,z] of [['hybrid',h],['baseline',b]]){
   const row={seed,scenario:s.id,method,...c,trials:cfg.trials,falseReleases:z.false,nonReceipts:z.missing,coalitions:z.coalition,falseReleaseRate:z.false/cfg.trials,nonReceiptRate:z.missing/cfg.trials,deliveryP95Days:quantile(z.delays,.95)};
   batch.push(row);const id=key(row);let a=aggregate.get(id);
   // Baseline is paired repeatedly but contributes once per seed/interval.
   if(method==='baseline'&&a?.seeds.includes(seed))continue;
   if(!a){a={scenario:s.id,method,n:method==='hybrid'?n:null,k:method==='hybrid'?k:null,interval,waiting:method==='hybrid'?waiting:0,trials:0,falseReleases:0,nonReceipts:0,coalitions:0,seeds:[],seedFalseRates:[],seedMissingRates:[],seedDelayP95:[],frontierAppearances:0,delays:[],coalitionOracle:method==='hybrid'?coalitionOracle(n,k,s):null};aggregate.set(id,a);}
   a.trials+=cfg.trials;a.falseReleases+=z.false;a.nonReceipts+=z.missing;a.coalitions+=z.coalition;a.seeds.push(seed);a.seedFalseRates.push(row.falseReleaseRate);a.seedMissingRates.push(row.nonReceiptRate);a.seedDelayP95.push(row.deliveryP95Days);a.delays.push(...z.delays);
  }
 }
 const unique=Array.from(new Map(batch.map(r=>[key(r),r])).values());const front=new Set(nondominated(unique).map(key));for(const r of batch){r.pareto=front.has(key(r));}for(const id of front)aggregate.get(id).frontierAppearances++;
 rows.push(...batch);console.log(`Seed ${seed}: ${unique.length} distinct policy/scenario rows`);
}
const range=xs=>{const a=xs.filter(x=>x!==null);return a.length?[Math.min(...a),Math.max(...a)]:null;};
const pooled=Array.from(aggregate.values()).map(a=>{const {delays,...rest}=a;return {...rest,falseReleaseRate:a.falseReleases/a.trials,nonReceiptRate:a.nonReceipts/a.trials,coalitionRate:a.coalitions/a.trials,falseReleaseCI:wilson(a.falseReleases,a.trials),nonReceiptCI:wilson(a.nonReceipts,a.trials),coalitionCI:wilson(a.coalitions,a.trials),deliveryP95Days:quantile(delays,.95),falseRateSeedRange:range(a.seedFalseRates),missingRateSeedRange:range(a.seedMissingRates),delayP95SeedRange:range(a.seedDelayP95),frontierFrequency:a.frontierAppearances/cfg.seeds.length};});
const pooledFront=new Set(nondominated(pooled).map(key));for(const p of pooled)p.pooledPareto=pooledFront.has(key(p));
const metadata={...cfg,sourceHashes:Object.fromEntries(['model.cjs','replicate.cjs','replication.json'].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,f))).digest('hex')])),pairedEvaluations:cfg.seeds.length*cfg.trials*cfg.scenarios.length*160,
 distinctWorlds:cfg.seeds.length*cfg.trials,scope:'Single-episode synthetic sensitivity; seed ranges are descriptive, not confidence intervals. No H1 significance claim.'};
const out=path.resolve(__dirname,'../../../docs/verification/dip32/replication');fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({metadata,pooled},null,2)+'\n');
const cols=['seed','scenario','method','n','k','interval','waiting','trials','falseReleases','nonReceipts','coalitions','falseReleaseRate','nonReceiptRate','deliveryP95Days','pareto'];fs.writeFileSync(path.join(out,'per-seed.csv'),cols.join(',')+'\n'+rows.map(r=>cols.map(k=>r[k]??'').join(',')).join('\n')+'\n');
const pct=x=>(x*100).toFixed(2)+'%',fmt=x=>x===null?'n/a':x.toFixed(2);
const lines=['# DIP-32: distribution and correlation stress experiment','',`Model ${cfg.modelVersion}; ${cfg.seeds.length} seeds x ${cfg.trials} worlds = ${metadata.distinctWorlds} distinct synthetic worlds, shared across ${cfg.scenarios.length} assumption sets and policies. ${metadata.pairedEvaluations} paired evaluations.`,
 '', '## Reference: n=3, k=2, interval=7, waiting=7 days','', '| Assumptions | Method | False release, pooled | False rate across seeds | Non-receipt by 90d | Pooled delivery p95 | Coalition: simulated / exact |','|---|---|---|---|---|---|---|'];
for(const r of pooled.filter(r=>r.interval===7&&(r.method==='baseline'||r.n===3&&r.k===2&&r.waiting===7)))lines.push(`| ${r.scenario} | ${r.method} | ${pct(r.falseReleaseRate)} | ${r.falseRateSeedRange.map(pct).join(' - ')} | ${pct(r.nonReceiptRate)} | ${fmt(r.deliveryP95Days)} days | ${r.method==='hybrid'?pct(r.coalitionRate)+' / '+pct(r.coalitionOracle):'n/a'} |`);
lines.push('','## Frontier stability','', '| Assumptions | Pooled hybrid frontier | Hybrid on frontier in every seed | Hybrid on frontier in at least one seed |','|---|---|---|---|');
for(const s of cfg.scenarios){const h=pooled.filter(p=>p.scenario===s.id&&p.method==='hybrid');lines.push(`| ${s.id} | ${h.filter(p=>p.pooledPareto).length} | ${h.filter(p=>p.frontierFrequency===1).length} | ${h.filter(p=>p.frontierFrequency>0).length} |`);}
lines.push('','## Interpretation and limits','', '- Positive dependence can change quorum risk even when every trustee retains the same marginal compromise probability q=0.1. With n=3,k=2 the independent coalition probability is 2.8%; the rho=0.5 mixture gives 6.4%. Neither is an observed real-world rate.', '- Both absence distributions have median 10 days before capping at 180 days, but different tails. Comparing paired distributions shows dependence on an assumed absence model; this is not calibration to actual owners.', '- No claim of a uniquely optimal configuration: pooled Pareto membership and frequency across five seeds are descriptive. Sparse zero events and conditional p95 can change dominance. All objectives and counts are retained in raw results.', '- Pooled Wilson intervals in JSON quantify Monte Carlo error at a fixed policy/scenario. Rows share worlds; they are not independent experiments. Seed min/max ranges are not 95% intervals. No H1 p-value or confirmed H1 is reported.', '- The baseline/hybrid subset relation is still built into timing/gates. This study does not validate the backend, cryptography, delivery, annual hazards or authentication.', '', 'See ../replication-method.md for the common-mode mixture and remaining work.','');fs.writeFileSync(path.join(out,'summary.md'),lines.join('\n'));
console.log(`Saved ${rows.length} per-seed rows and ${pooled.length} unique pooled policies to ${out}`);
