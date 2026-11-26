'use strict';
const fs = require('node:fs');
const channels = ['telegram', 'sms'];
const timestamp = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(value) ? Date.parse(value) : NaN;
const quantile = (values, p) => values.length ? [...values].sort((a,b)=>a-b)[Math.ceil(p*values.length)-1] : null;
function analyse(input) {
  if (!input || !['fixture','live'].includes(input.evidence) || !Array.isArray(input.messages)) throw Error('Invalid evidence/messages');
  const observed = timestamp(input.observedUntil);
  if (!Number.isFinite(observed)) throw Error('Invalid observation timestamp');
  const ids = new Set();
  const rows = input.messages.map(m => {
    const allowed = ['id','recipientAlias','channel','startedAt','deadlineAt','attempts'];
    if (Object.keys(m).some(k=>!allowed.includes(k))) throw Error('Unknown message field; remove personal/provider data');
    if (!/^[a-z0-9_-]{1,64}$/i.test(m.id) || ids.has(m.id)) throw Error('Invalid or duplicate id');
    ids.add(m.id);
    if (!/^P\d{2,4}$/.test(m.recipientAlias) || !channels.includes(m.channel)) throw Error('Use recipient aliases and supported channels');
    const start=timestamp(m.startedAt), deadline=timestamp(m.deadlineAt);
    if (!Number.isFinite(start) || !Number.isFinite(deadline) || deadline<start || observed<deadline) throw Error('Observation must cover deadline');
    if (!Array.isArray(m.attempts) || !m.attempts.length) throw Error('Missing attempts');
    let accepted=null, confirmed=null, total=0, unknown=0;
    m.attempts.forEach((a,i)=>{
      if(Object.keys(a).some(k=>!['number','sentAt','acceptedAt','deliveredAt','costKzt'].includes(k))) throw Error('Unknown attempt field');
      const sent=timestamp(a.sentAt);
      if(a.number!==i+1 || !Number.isFinite(sent) || sent<start || sent>observed) throw Error('Invalid attempt');
      let acc=null;
      for(const key of ['acceptedAt','deliveredAt']) {
        if(a[key] == null) continue;
        const t=timestamp(a[key]);
        if(!Number.isFinite(t) || t<sent || t>observed) throw Error('Invalid acknowledgement time');
        if(key==='acceptedAt') { acc=t; accepted=accepted===null?t:Math.min(accepted,t); }
        else {
          if(m.channel!=='sms' || acc===null || t<acc) throw Error('SMS delivery requires prior acceptance');
          confirmed=confirmed===null?t:Math.min(confirmed,t);
        }
      }
      if(a.costKzt == null) unknown++;
      else if(typeof a.costKzt!=='number' || !Number.isFinite(a.costKzt) || a.costKzt<0) throw Error('Invalid cost');
      else total+=a.costKzt;
    });
    // Telegram acceptance is dispatch evidence, not a device delivery/read receipt.
    const transport=m.channel==='telegram'?accepted:confirmed;
    return {channel:m.channel, attempts:m.attempts.length, accepted:accepted!==null, confirmed:transport!==null, onTime:transport!==null && transport<=deadline, latencyMs:transport===null?null:transport-start, costKzt:total, unknownCosts:unknown};
  });
  return {evidence:input.evidence, observedUntil:input.observedUntil, channels:channels.map(channel=>{
    const r=rows.filter(x=>x.channel===channel), lat=r.filter(x=>x.confirmed).map(x=>x.latencyMs);
    const count=key=>r.filter(x=>x[key]).length;
    const unknownCosts=r.reduce((s,x)=>s+x.unknownCosts,0), knownCostKzt=r.reduce((s,x)=>s+x.costKzt,0);
    return {channel, confirmationMeaning:channel==='telegram'?'Bot API acceptance; not device delivery/read':'final provider delivery report; not reading', messages:r.length, attempts:r.reduce((s,x)=>s+x.attempts,0), accepted:count('accepted'), transportConfirmed:count('confirmed'), onTime:count('onTime'), unconfirmed:r.length-count('confirmed'), onTimeFraction:r.length?count('onTime')/r.length:null, conditionalLatencyMs:{p50:quantile(lat,.5),p95:quantile(lat,.95),samples:lat.length}, knownCostKzt, unknownCostAttempts:unknownCosts, totalCostKzt:unknownCosts?null:knownCostKzt};
  })};
}
module.exports={analyse};
if(require.main===module) {
  if(process.argv.length!==3) throw Error('Usage: node analyse.cjs input.json');
  process.stdout.write(JSON.stringify(analyse(JSON.parse(fs.readFileSync(process.argv[2],'utf8').replace(/^\uFEFF/, ''))),null,2)+'\n');
}


