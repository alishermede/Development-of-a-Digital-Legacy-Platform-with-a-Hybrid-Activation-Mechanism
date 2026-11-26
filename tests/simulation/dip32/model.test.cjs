const {test}=require('node:test'),assert=require('node:assert/strict');
const {rng,sample,evaluate,validate,binomialTail,wilson,nondominated}=require('./model.cjs');
const c={n:3,k:2,interval:7,waiting:7},s={mistakeProbability:0,compromiseProbability:0,availability:1,horizon:90};
const w={phase:0,absence:100,trustees:Array.from({length:5},()=>({mistake:.5,compromise:.5,available:.5,response:0}))};
test('known binomial oracle for two out of three',()=>{assert.ok(Math.abs(binomialTail(3,2,.05)-.00725)<1e-12);assert.equal(binomialTail(5,2,0),0);assert.equal(binomialTail(5,5,1),1)});
test('honest living owner never releases; deceased owner does',()=>{const r=evaluate(c,s,w);assert.equal(r.alive.hybrid,false);assert.equal(r.deceased.hybridMissing,false);assert.equal(r.alive.baseline,true)});
test('k-1 colluders insufficient; k can release and then withhold from deceased owner',()=>{const a=structuredClone(w);a.trustees[0].compromise=0;assert.equal(evaluate(c,{...s,compromiseProbability:.1},a).alive.hybrid,false);a.trustees[1].compromise=0;const r=evaluate(c,{...s,compromiseProbability:.1},a);assert.equal(r.alive.collusiveRelease,true);assert.equal(r.deceased.hybridMissing,true)});
test('cancellation wins at exact release boundary; receipt at horizon counts',()=>{const cfg={...c,waiting:1},world={...w,absence:4+1/24};assert.equal(evaluate(cfg,{...s,mistakeProbability:1},world).alive.hybrid,false);assert.equal(evaluate(cfg,{...s,horizon:4+1/24},world).deceased.hybridMissing,false)});
test('zero availability prevents hybrid delivery',()=>assert.equal(evaluate(c,{...s,availability:0},w).deceased.hybridMissing,true));
test('seeded samples repeat and paired releases respect temporal gates',()=>{const a=rng(42),b=rng(42);for(let i=0;i<1000;i++){const x=sample(a);assert.deepEqual(x,sample(b));const r=evaluate(c,{...s,mistakeProbability:.3,compromiseProbability:.2},x);assert.ok(!r.alive.hybrid||r.alive.baseline)}});
test('rejects invalid security parameters and probabilities',()=>{assert.throws(()=>validate({...c,k:4}));assert.throws(()=>evaluate(c,{...s,availability:2},w))});
test('Wilson zero observations still has positive upper uncertainty',()=>{const ci=wilson(0,5000);assert.ok(ci.high>0);assert.ok(ci.low>=0)});
test('Pareto compares three objectives only inside the same scenario',()=>{const a={scenario:'a',falseReleaseRate:0,nonReceiptRate:.5,deliveryP95Days:10},b={...a,nonReceiptRate:.4},d={...a,scenario:'b'};assert.deepEqual(nondominated([a,b,d]),[b,d]);assert.equal(nondominated([{...a,deliveryP95Days:null},b]).length,1)});
const {sampleStress,coalitionOracle}=require('./model.cjs');
test('correlated coalition oracle preserves marginal q and known mixture probability',()=>{
 assert.ok(Math.abs(coalitionOracle(3,2,{compromiseProbability:.1,correlation:0})-.028)<1e-12);
 assert.ok(Math.abs(coalitionOracle(3,2,{compromiseProbability:.1,correlation:.5})-.064)<1e-12);
 assert.equal(coalitionOracle(5,5,{compromiseProbability:.1,correlation:1}),.1);
});
test('common-mode takeover coordinates all trustees, independent branch keeps individual draws',()=>{
 const cfg={...c,k:3},sc={...s,compromiseProbability:.1,correlation:.5},world={...w,commonSwitch:.2,commonCompromise:.01};
 assert.equal(evaluate(cfg,sc,world).alive.coalition,true);
 assert.equal(evaluate(cfg,sc,{...world,commonCompromise:.8}).alive.coalition,false);
 assert.equal(evaluate(cfg,sc,{...world,commonSwitch:.8}).alive.coalition,false);
 assert.throws(()=>evaluate(cfg,sc,w));
});
test('alternate absence model changes absence only, not deceased-owner outcome',()=>{
 const world={...w,absence:0,absenceQuantile:.999};
 const a=evaluate(c,s,world),b=evaluate(c,{...s,absenceDistribution:'exponential'},world);
 assert.equal(a.alive.baseline,false);assert.equal(b.alive.baseline,true);assert.deepEqual(a.deceased,b.deceased);
 assert.throws(()=>evaluate(c,{...s,absenceDistribution:'exponential'},w));
 assert.throws(()=>evaluate(c,{...s,absenceDistribution:'unknown'},w));
 assert.throws(()=>evaluate(c,{...s,correlation:-1},w));
});
test('stress sampling repeats with fixed seed',()=>{const a=rng(71),b=rng(71);for(let i=0;i<100;i++)assert.deepEqual(sampleStress(a),sampleStress(b));});
