'use client';
import type {ReactNode} from 'react';

export type Section = 'commitments' | 'reviews' | 'pool';

export function PactHeader({section,onNavigate,reviewCount,wallet}:{section:Section;onNavigate:(s:Section)=>void;reviewCount:number;wallet:ReactNode}){
 return <header className="app-header"><a className="brand" href="/" aria-label="VowPool home"><img src="/ripple-mark.png" alt="" width="42" height="42"/>VowPool</a><nav className="app-nav" aria-label="Main navigation">{(['commitments','reviews','pool'] as const).map(s=><button key={s} className={section===s?'selected':''} aria-current={section===s?'page':undefined} onClick={()=>onNavigate(s)}>{s.charAt(0).toUpperCase()+s.slice(1)}{s==='reviews'&&reviewCount>0?<span className="review-count">{reviewCount}</span>:null}</button>)}</nav><div className="header-wallet"><span className="network-label">Devnet</span>{wallet}</div></header>;
}

export function BalanceSummary({active,refundable,pool,onPool,onRefunds}:{active:string;refundable:string;pool:string;onPool:()=>void;onRefunds:()=>void}){
 return <section className="balance-summary" aria-label="Confirmed balances"><div className="personal-balances"><p><strong>{active}</strong><span>test tokens locked</span></p><button className="refund-summary" onClick={onRefunds}><strong>{refundable}</strong><span>refunds processing</span></button></div><button className="pool-summary" onClick={onPool}><img src="/ripple-mark.png" alt="" width="27" height="27"/><span>Shared pool · {pool} test tokens</span><span aria-hidden="true">→</span></button></section>;
}

export type CommitmentRowData={id:string;goal:string;summary:string;status:string;tone:'neutral'|'pending'|'success'|'attention';action?:string};
export function CommitmentList({rows,onOpen,onAction,busy=false}:{rows:CommitmentRowData[];onOpen:(id:string)=>void;onAction?:(id:string)=>void;busy?:boolean}){
 return <ul className="commitment-list">{rows.map(r=><li className="commitment-row" key={r.id}><div className="commitment-copy"><h2><button className="goal-link" onClick={()=>onOpen(r.id)}>{r.goal}</button></h2><p>{r.summary}</p></div><div className="commitment-next">{r.status?<span className={`row-status ${r.tone}`}>{r.status}</span>:null}<button className={r.action?'quiet row-action':'text-button'} disabled={busy} onClick={()=>r.action&&onAction?onAction(r.id):onOpen(r.id)} aria-label={`${r.action||'View'}: ${r.goal}`}>{r.action||'View'} <span aria-hidden="true">→</span></button></div></li>)}</ul>;
}

export function PactFooter(){return <footer><span>Clear terms. Shared accountability.</span><span>Devnet · Test tokens · Upgrade authority retained</span></footer>;}
