/* DIP-32: single-episode sensitivity model, independent of production code. */
const GRACE_DAYS = 1 / 24;
const ticks = days => Math.round(days * 86400000); // Millisecond resolution avoids floating-point boundary drift.
function rng(seed) {
  let state = seed >>> 0;
  return () => { state += 0x6D2B79F5; let t = state; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function validate(c) {
  if (!Number.isInteger(c.n) || c.n < 2 || c.n > 5 || !Number.isInteger(c.k) || c.k < 2 || c.k > c.n) throw Error('Require 2 <= k <= n <= 5');
  if (!Number.isInteger(c.interval) || c.interval < 1 || c.interval > 180 || !Number.isInteger(c.waiting) || c.waiting < 1 || c.waiting > 60) throw Error('Invalid interval/waiting');
}
function validateScenario(s) {
  for (const key of ['mistakeProbability','compromiseProbability','availability']) if (!Number.isFinite(s[key]) || s[key] < 0 || s[key] > 1) throw Error('Invalid probability: '+key);
  if (!Number.isFinite(s.horizon) || s.horizon <= 0) throw Error('Invalid horizon');
}
function sample(random) {
  // Each pair shares one world. The array prefix couples sweeps across n, k and timing.
  const u = Math.max(random(), Number.EPSILON);
  const normal = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random());
  return { absence: Math.min(180, Math.exp(Math.log(10) + .9 * normal)), phase: random(),
    trustees: Array.from({length:5},()=>({mistake:random(),compromise:random(),available:random(),response:random()})) };
}
function evaluate(c,s,w) {
  validate(c); validateScenario(s);
  const detection = c.interval * w.phase + 3 + GRACE_DAYS;
  const trustees = w.trustees.slice(0,c.n);
  const coalition = trustees.filter(t=>t.compromise < s.compromiseProbability);
  const falseVotes = trustees.filter(t=>t.compromise < s.compromiseProbability || (t.available < s.availability && t.mistake < s.mistakeProbability));
  const falseTimes = falseVotes.map(t=>t.compromise < s.compromiseProbability ? 0 : 2*t.response).sort((a,b)=>a-b);
  const falseRelease = falseTimes.length >= c.k ? detection + falseTimes[c.k-1] + c.waiting : Infinity;
  // Living owner always cancels immediately on return; equality means cancellation wins.
  const alive = { baseline: ticks(detection) < ticks(w.absence), hybrid: ticks(falseRelease) < ticks(w.absence),
    coalition: coalition.length >= c.k, collusiveRelease: coalition.length >= c.k && ticks(detection+c.waiting) < ticks(w.absence) };
  // Deceased owner: honest available trustees confirm, compromised trustees withhold.
  const trueTimes = trustees.filter(t=>t.compromise >= s.compromiseProbability && t.available < s.availability).map(t=>2*t.response).sort((a,b)=>a-b);
  const trueRelease = trueTimes.length >= c.k ? detection + trueTimes[c.k-1] + c.waiting : Infinity;
  return { alive, deceased:{ baselineMissing: ticks(detection) > ticks(s.horizon), hybridMissing: ticks(trueRelease) > ticks(s.horizon),
    baselineDelay:detection, hybridDelay:trueRelease } };
}
function wilson(count,total) {
  if(!total)return null;
  const z=1.95996398454,p=count/total,d=1+z*z/total,centre=(p+z*z/(2*total))/d,half=z*Math.sqrt(p*(1-p)/total+z*z/(4*total*total))/d;
  return {low:Math.max(0,centre-half),high:Math.min(1,centre+half)};
}
function binomialTail(n,k,p) {
  let sum=0;for(let j=k;j<=n;j++){let choose=1;for(let i=1;i<=j;i++)choose=choose*(n-i+1)/i;sum+=choose*p**j*(1-p)**(n-j);}return sum;
}
function quantile(xs,p){if(!xs.length)return null;const sorted=[...xs].sort((a,b)=>a-b);return sorted[Math.ceil(p*sorted.length)-1];}
function nondominated(rows) {
  // Only compare policies inside one assumption set; minimise all three objectives.
  const value=r=>[r.falseReleaseRate,r.nonReceiptRate,r.deliveryP95Days??Infinity];
  return rows.filter(a=>!rows.some(b=>{if(a===b||a.scenario!==b.scenario)return false;const av=value(a),bv=value(b);return bv.every((x,i)=>x<=av[i])&&bv.some((x,i)=>x<av[i]);}));
}
module.exports={GRACE_DAYS,rng,validate,validateScenario,sample,evaluate,wilson,binomialTail,quantile,nondominated};
