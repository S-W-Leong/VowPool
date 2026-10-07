import bs58 from 'bs58';
export class Writer {
 private bytes:number[]=[];
 raw(v:Uint8Array|number[]){this.bytes.push(...v);return this;}
 n(v:bigint|number,size:number){let n=BigInt(v);if(n<0n)n+=1n<<BigInt(size*8);for(let i=0;i<size;i++){this.bytes.push(Number(n&255n));n>>=8n;}if(n!==0n)throw new Error('Integer overflow');return this;}
 str(v:string){const b=new TextEncoder().encode(v);return this.n(b.length,4).raw(b);}
 key(v:string){const b=bs58.decode(v);if(b.length!==32)throw new Error('Invalid public key');return this.raw(b);}
 finish(){return Uint8Array.from(this.bytes);}
}
