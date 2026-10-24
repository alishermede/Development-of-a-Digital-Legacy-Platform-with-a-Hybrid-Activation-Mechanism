/* DIP-21/DIP-27: standalone design model, not production/backend validation. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const seed = 20261024;
let state = seed;
function random() {
  state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
  return state / 4294967296;
}
function wilson(successes, total) {
  const z = 1.96, p = successes / total, d = 1 + z*z/total;
  const centre = (p + z*z/(2*total))/d;
  const half = z*Math.sqrt(p*(1-p)/total + z*z/(4*total*total))/d;
  return `${(100*Math.max(0, centre-half)).toFixed(2)}–${(100*Math.min(1, centre+half)).toFixed(2)}%`;
}
const cells = [];
for (const absenceDays of [7, 14, 30, 60]) {
  for (const mistakeProbability of [0, 0.05, 0.2]) {
    let baselineFalse = 0, hybridFalse = 0;
    for (let run=0; run<1000; run++) {
      const mistakes = Array.from({length:3}, () => random() < mistakeProbability).filter(Boolean).length;
      // Day-granularity abstraction: final one-hour response grace is excluded.
      const baseline = absenceDays > 10;
      const hybrid = absenceDays > 17 && mistakes >= 2;
      assert(!hybrid || baseline, 'paired hybrid release cannot precede baseline');
      baselineFalse += Number(baseline);
      hybridFalse += Number(hybrid);
    }
    const analytical = absenceDays > 17 ? 3*mistakeProbability**2*(1-mistakeProbability)+mistakeProbability**3 : 0;
    assert.equal(baselineFalse, absenceDays > 10 ? 1000 : 0);
    if (mistakeProbability===0 || absenceDays<=17) assert.equal(hybridFalse,0);
    cells.push({absenceDays,mistakeProbability,baselineFalse,hybridFalse,analytical});
  }
}

// Small executable transition model to examine outage/recovery invariants.
class NotificationModel {
  constructor() { this.phase='ACTIVE'; this.fault=false; this.version=0; this.waitingDays=7; this.deadline=null; }
  failedCheckin() { this.fault=true; }
  confirmedCheckin() { this.fault=false; this.phase='CHECK-IN PENDING'; }
  missedFinal() { if(!this.fault && this.phase==='CHECK-IN PENDING') this.phase='AWAITING CONFIRMATION'; }
  startWait(day) { this.phase='WAITING PERIOD'; this.deadline=day+this.waitingDays; }
  allOwnerChannelsFailed() { this.fault=true; }
  recoverOwnerNotice(day) { this.fault=false; if(this.phase==='WAITING PERIOD') this.deadline=day+this.waitingDays; }
  cancel() { this.phase='ACTIVE'; this.fault=false; this.deadline=null; this.version++; }
  release(day, jobVersion) {
    if(this.phase==='WAITING PERIOD' && !this.fault && jobVersion===this.version && day>=this.deadline) this.phase='RELEASED';
  }
}
const checks=[];
function check(name, fn) {fn(); checks.push(name);}
check('NR-02: 60 days of undelivered check-ins do not escalate',()=>{
  const m=new NotificationModel();
  for(let day=0;day<60;day++){m.failedCheckin();m.missedFinal();m.release(day,m.version);}
  assert.equal(m.phase,'ACTIVE');
});
check('NR-03: total owner-channel failure blocks old waiting-period deadline',()=>{
  const m=new NotificationModel();m.startWait(10);m.allOwnerChannelsFailed();m.release(90,m.version);
  assert.equal(m.phase,'WAITING PERIOD');m.recoverOwnerNotice(90);m.release(96,m.version);
  assert.equal(m.phase,'WAITING PERIOD');m.release(97,m.version);assert.equal(m.phase,'RELEASED');
});
check('NR-04: serializing/reloading model preserves fault and deadline',()=>{
  const m=new NotificationModel();m.startWait(10);m.allOwnerChannelsFailed();
  const restored=Object.assign(new NotificationModel(),JSON.parse(JSON.stringify(m)));
  restored.release(60,restored.version);assert.equal(restored.phase,'WAITING PERIOD');assert.equal(restored.fault,true);
});
check('NR-07: cancellation rejects a stale release job',()=>{
  const m=new NotificationModel();m.startWait(10);const old=m.version;m.cancel();m.release(60,old);
  assert.equal(m.phase,'ACTIVE');assert.equal(m.deadline,null);
});
const report = [
  '# Pre-defense Design-Model Results', '',
  'Prepared: 24.10.2026. Tasks DIP-21 and DIP-27. Command: `node tests/simulation/pre-defense-model.cjs`.', '',
  '**Evidence level:** standalone specification model. No Spring Boot/Quartz, real provider, cryptographic library or device benchmark was executed. A model pass is not a production/security test pass.', '',
  '## M1b: paired sensitivity experiment', '',
  `LCG seed: ${seed}; 1,000 paired living-owner runs per cell; n=3, k=2; transport succeeds; independent mistaken trustee confirmations with probability p. Absence lengths are fixed conditional cells, not measured population frequencies. Owner returns/cancels at the end of the absence. Day-level abstraction rounds away the final one-hour reply grace.`, '',
  '| Absence (days) | p (ASM) | Baseline false / 1000 | Hybrid false / 1000 | Baseline % | Hybrid % | Hybrid Wilson 95% interval | Analytical hybrid % |',
  '|---|---|---|---|---|---|---|---|',
  ...cells.map(c=>`| ${c.absenceDays} | ${c.mistakeProbability} | ${c.baselineFalse} | ${c.hybridFalse} | ${(c.baselineFalse/10).toFixed(1)} | ${(c.hybridFalse/10).toFixed(1)} | ${wilson(c.hybridFalse,1000)} | ${(c.analytical*100).toFixed(3)} |`), '',
  'The paired model never exceeds the baseline and has zero false releases with p=0. A nonzero p can cause false release while the owner is alive; these numbers do not establish a real-world false-activation rate. Finite-sample deviation from the analytical binomial probability is expected, not automatically an implementation defect.', '',
  '## Notification guard model checks', '',
  ...checks.map(x=>`- PASS (model): ${x}`), '',
  'The reload check serializes a JavaScript object only. It does not test database transactions, Quartz persistence, callback authentication, timing within one hour, rate limits, live deliverability or restart behavior of the backend.', '',
  '## Unexecuted implementation evidence', '',
  '| Metric / evidence | Status |',
  '|---|---|',
  '| M2 / M4: every k-1/k subset and cryptographic reconstruction | Not run; implementation/library harness required |',
  '| M5: canary scan of database, logs and decrypted HTTP payloads | Not run; running application required |',
  '| M6 / M8 / M12 integration and provider tests | Not run; standalone guard model only |',
  '| M10 / M11: 10 MB encryption/sharing and Argon2id, median of 10 runs | Not run; real browser/device and recorded versions required |',
  '| Expert legal interview | Not conducted in the supplied evidence |', ''
].join('\n');
const output=path.resolve(__dirname,'../../docs/verification/pre-defense-model-results.md');
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,report);
console.log(`${checks.length} model checks passed; ${cells.length*1000} synthetic paired runs; wrote ${output}`);
