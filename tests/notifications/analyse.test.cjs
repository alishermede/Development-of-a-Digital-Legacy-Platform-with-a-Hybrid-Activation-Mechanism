const {test}=require('node:test');
const assert=require('node:assert/strict');
const {analyse}=require('./analyse.cjs');
const fixture=require('./example.fixture.json');
const copy=()=>structuredClone(fixture);
test('acceptance alone never counts as SMS delivery; late delivery is not timely',()=>{
 const sms=analyse(copy()).channels[1];
 assert.equal(sms.accepted,2); assert.equal(sms.transportConfirmed,1); assert.equal(sms.onTime,0); assert.equal(sms.unconfirmed,1); assert.equal(sms.conditionalLatencyMs.p95,360000); assert.equal(sms.totalCostKzt,null);
});
test('Telegram acceptance is explicitly labelled and denominator is logical messages',()=>{
 const tg=analyse(copy()).channels[0]; assert.equal(tg.onTimeFraction,1); assert.equal(tg.messages,1); assert.match(tg.confirmationMeaning,/not device/);
});
test('rejects incomplete observation, duplicate messages and personal fields',()=>{
 let x=copy(); x.observedUntil='2026-11-26T10:01:00Z'; assert.throws(()=>analyse(x));
 x=copy(); x.messages.push(x.messages[0]); assert.throws(()=>analyse(x));
 x=copy(); x.messages[0].phone='+70000000000'; assert.throws(()=>analyse(x));
});
test('rejects delivery without acceptance and impossible timestamp',()=>{
 let x=copy(); delete x.messages[2].attempts[0].acceptedAt; assert.throws(()=>analyse(x));
 x=copy(); x.messages[0].attempts[0].acceptedAt='2026-11-26T09:59:00Z'; assert.throws(()=>analyse(x));
});
test('retries increase attempts and costs, never the message denominator',()=>{
 const x=copy(); x.messages[0].attempts.push({number:2,sentAt:'2026-11-26T10:01:00Z',acceptedAt:'2026-11-26T10:01:01Z',costKzt:1});
 const tg=analyse(x).channels[0]; assert.equal(tg.messages,1); assert.equal(tg.attempts,2); assert.equal(tg.totalCostKzt,1); assert.equal(tg.conditionalLatencyMs.p50,1000);
});
