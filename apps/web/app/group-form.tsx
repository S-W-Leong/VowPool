'use client';
import {useState} from 'react';
import {makeGroupSetup} from '../lib/groups';
import {preparedGroup} from '../lib/chain';
import type {PreparedGroup} from '../../../packages/shared/src/group-setup';
import {short} from './detail';
export type DemoConfig={mint:string;policy:PreparedGroup['policy'];developmentFixture:boolean;fundingEnabled:boolean};
export default function GroupForm({owner,config,busy,onCreate,onClose}:{owner:string;config:DemoConfig;busy:boolean;onCreate:(setup:PreparedGroup)=>Promise<void>;onClose:()=>void}){
 const prepared=preparedGroup?.founder===owner?preparedGroup:null;
 const [addresses,setAddresses]=useState(prepared?.roster.filter(a=>a!==owner).join('\n')||''),[treasurer,setTreasurer]=useState(prepared?.treasurer||owner),[error,setError]=useState(''),[review,setReview]=useState<PreparedGroup|null>(null);
 const invited=addresses.split(/[\s,]+/).map(s=>s.trim()).filter(Boolean),roster=[owner,...invited];
 function confirm(event:React.FormEvent){event.preventDefault();try{setReview(makeGroupSetup(owner,invited,treasurer,config.mint,config.policy));setError('');}catch(e){setError(e instanceof Error?e.message:'Check the invited wallet addresses');}}
 return <section className="panel creation" aria-label="Create accountability group"><div className="section-head"><div><p className="eyebrow">BRING YOUR PEOPLE</p><h1>Create your circle.</h1></div><button className="quiet" disabled={busy} onClick={onClose}>Close</button></div>
 {review?<><h3>Review your group</h3><p>You create and sign for this group as <strong>{short(owner)}</strong>.</p><ul className="reviewers">{review.roster.map(a=><li key={a}>{short(a)}{a===owner?' · you':''}{a===review.treasurer?' · treasurer':''}</li>)}</ul><p>The treasurer can withdraw forfeited funds only to their own frozen wallet address. Active stakes and unpaid refunds remain protected.</p><p className="notice">The roster and treasury destination are fixed after creation. Invited members connect their own wallets using your group link.</p><div className="button-row"><button className="quiet" disabled={busy} onClick={()=>setReview(null)}>Edit group</button><button disabled={busy} onClick={()=>onCreate(review)}>{busy?'Preparing your group…':'Create group'}</button></div></>:<form onSubmit={confirm}><p>Invite 1–7 people by their public Solana wallet address. Your wallet is included automatically.</p><label>Invited wallet addresses<textarea required rows={4} value={addresses} onChange={e=>setAddresses(e.target.value)} placeholder="One public wallet address per line" maxLength={400}/></label><label>Treasurer<select value={treasurer} onChange={e=>setTreasurer(e.target.value)}>{[...new Set(roster)].map(a=><option key={a} value={a}>{a===owner?'You':short(a)}</option>)}</select></label><p className="muted">The treasurer receives communal withdrawals. Each commitment owner receives their own refund.</p>{error?<p className="error" role="alert">{error}</p>:null}<button disabled={busy}>Review group →</button></form>}
 <small>Solana Devnet · Custom test tokens · One group per founder wallet. CRE checks use local simulation.</small></section>;
}
