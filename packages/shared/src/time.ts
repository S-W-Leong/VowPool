export function singaporeLocalToUtc(s:string):number {
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s))throw new Error('Use explicit Singapore date and time');
 const ms=Date.parse(`${s}:00+08:00`);
 if(!Number.isFinite(ms)||new Date(ms+8*3600000).toISOString().slice(0,16)!==s)throw new Error('Invalid date');
 return ms/1000;
}
export const displayTime=(seconds:number)=>new Intl.DateTimeFormat('en-SG',{timeZone:'Asia/Singapore',dateStyle:'medium',timeStyle:'short'}).format(seconds*1000);
