import {test,expect} from 'bun:test';
import {setup} from './helpers';
import {BN} from '@coral-xyz/anchor';
test('A/B acknowledgments are distinct from approvals and required before funding',async()=>{
 const h=await setup(),c=await h.create();await expect(h.act('activate',c)).rejects.toThrow();
 for(const k of [h.owner,h.outsider])await expect(h.act('acknowledge',c,k)).rejects.toThrow();
 await h.act('acknowledge',c,h.reviewer);expect(h.read(c).approvals).toBe(0);
 await h.act('activate',c);expect(h.balance(h.vault)).toBe(1250000n);
 for(const k of [h.owner,h.outsider])await expect(h.act('approve',c,k)).rejects.toThrow();
 await h.act('approve',c,h.reviewer);expect(h.read(c).status).toEqual({succeeded:{}});expect(h.readGroup().refundable.toString()).toBe('1250000');
});
test('B requires unanimity; duplicate approval never counts twice',async()=>{
 const h=await setup(),c=await h.create(1,[h.reviewer.publicKey,h.other.publicKey]);
 await h.act('acknowledge',c,h.reviewer);await expect(h.act('activate',c)).rejects.toThrow();await h.act('acknowledge',c,h.other);await h.act('activate',c);
 await h.act('approve',c,h.reviewer);await expect(h.act('approve',c,h.reviewer)).rejects.toThrow();expect(h.read(c).status).toEqual({active:{}});
 await h.act('approve',c,h.other);expect(h.read(c).status).toEqual({succeeded:{}});
});
test('C accepts any eligible non-owner member without role acknowledgment',async()=>{
 const h=await setup(),c=await h.create(2,[]);await h.act('activate',c);await expect(h.act('approve',c,h.owner)).rejects.toThrow();await expect(h.act('approve',c,h.outsider)).rejects.toThrow();await h.act('approve',c,h.other);expect(h.read(c).status).toEqual({succeeded:{}});
});
test('creation rejects self, duplicate and outsider reviewers, invalid mode and deadlines',async()=>{
 const h=await setup();for(const reviewers of [[h.owner.publicKey],[h.outsider.publicKey],[h.reviewer.publicKey,h.reviewer.publicKey]])await expect(h.create(1,reviewers)).rejects.toThrow();
 await expect(h.create(9,[])).rejects.toThrow();await expect(h.create(0,[h.reviewer.publicKey],{reviewDeadline:new BN(1100)})).rejects.toThrow();
});
test('approval cutoff is inclusive and expiry strictly later; outcome is final',async()=>{
 const h=await setup(),c=await h.create(2,[]);await h.act('activate',c);h.clock(1200);await expect(h.act('settleExpired',c)).rejects.toThrow();await h.act('approve',c,h.other);h.clock(1201);await expect(h.act('settleExpired',c)).rejects.toThrow();
});
test('unapproved commitment forfeits once and late approval fails',async()=>{
 const h=await setup(),c=await h.create(2,[]);await h.act('activate',c);h.clock(1201);await expect(h.act('approve',c,h.other)).rejects.toThrow();await h.act('settleExpired',c,h.outsider);expect(h.readGroup().pool.toString()).toBe('1250000');await expect(h.act('settleExpired',c)).rejects.toThrow();
});
