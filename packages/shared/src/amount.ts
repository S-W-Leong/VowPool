export const U64_MAX = (1n << 64n) - 1n;
export function parseTokenAmount(value:string,decimals:number):bigint {
 if(!Number.isInteger(decimals)||decimals<0||decimals>18||! /^(0|[1-9]\d*)(\.\d+)?$/.test(value)||value.length>40) throw new Error('Invalid token amount');
 const [whole,fraction='']=value.split('.');
 if(fraction.length>decimals) throw new Error('Excess fractional precision');
 const amount=BigInt(whole)*10n**BigInt(decimals)+BigInt(fraction.padEnd(decimals,'0')||'0');
 if(amount>U64_MAX) throw new Error('Token amount exceeds u64');
 return amount;
}
export function formatTokenAmount(value:bigint,decimals:number):string {
 if(value<0n||value>U64_MAX||!Number.isInteger(decimals)||decimals<0||decimals>18)throw new Error('Invalid amount');
 const scale=10n**BigInt(decimals);const fraction=(value%scale).toString().padStart(decimals,'0').replace(/0+$/,'');
 return `${value/scale}${fraction?'.'+fraction:''}`;
}
