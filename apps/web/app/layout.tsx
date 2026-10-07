import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'VowPool · Commit together',description:'A fixed accountability group with Solana Devnet commitment escrow.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
