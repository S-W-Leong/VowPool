import {addressSchema} from '../../../packages/shared/src/schema';

export function addInvitations(existing:string[],text:string,owner:string){
 const addresses=[...existing],remaining:string[]=[],errors=new Set<string>();
 for(const address of text.split(/[\s,]+/).filter(Boolean)){
  if(!addressSchema.safeParse(address).success){remaining.push(address);errors.add('Enter a valid public Solana wallet address.');}
  else if(address===owner||addresses.includes(address)){errors.add('That wallet is already included.');}
  else if(addresses.length>=7){remaining.push(address);errors.add('You can invite up to 7 people. Remove an address to add another.');}
  else addresses.push(address);
 }
 return {addresses,remaining:remaining.join(' '),error:[...errors].join(' ')};
}
