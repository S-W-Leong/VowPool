import {expect,it} from 'vitest';
import {Keypair} from '@solana/web3.js';
import {addInvitations} from '../lib/invitation-input';

const owner=Keypair.generate().publicKey.toBase58();
const wallets=Array.from({length:8},()=>Keypair.generate().publicKey.toBase58());

it('accepts a pasted list separated by commas, spaces and newlines',()=>{
 const result=addInvitations([],`${wallets[0]}, ${wallets[1]}\n${wallets[2]}`,owner);
 expect(result.addresses).toEqual(wallets.slice(0,3));
 expect(result.remaining).toBe('');
 expect(result.error).toBe('');
});
it('preserves invalid entries for correction while accepting valid entries',()=>{
 const result=addInvitations([],`${wallets[0]},bad-address,${wallets[1]}`,owner);
 expect(result.addresses).toEqual(wallets.slice(0,2));
 expect(result.remaining).toBe('bad-address');
 expect(result.error).toMatch(/valid.*Solana/i);
});
it('does not add duplicates or the automatically included founder',()=>{
 const result=addInvitations([wallets[0]],`${wallets[0]},${owner},${wallets[1]}`,owner);
 expect(result.addresses).toEqual(wallets.slice(0,2));
 expect(result.remaining).toBe('');
 expect(result.error).toMatch(/already included/i);
});
it('keeps overflow editable and accepts it after a pill is removed',()=>{
 const result=addInvitations(wallets.slice(0,6),wallets.slice(6).join(','),owner);
 expect(result.addresses).toEqual(wallets.slice(0,7));
 expect(result.remaining).toBe(wallets[7]);
 expect(result.error).toMatch(/7/);
 const retry=addInvitations(result.addresses.slice(1),result.remaining,owner);
 expect(retry.addresses).toEqual(wallets.slice(1));
 expect(retry.remaining).toBe('');
});
