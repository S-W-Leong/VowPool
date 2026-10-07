'use client';
import {useMemo} from 'react';
import dynamic from 'next/dynamic';
import {ConnectionProvider,WalletProvider} from '@solana/wallet-adapter-react';
import {WalletModalProvider} from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import {rpcUrl} from '../lib/chain';
const Dashboard=dynamic(()=>import('./dashboard'),{ssr:false,loading:()=> <main className="shell"><div className="empty" role="status"><h2>Make yourself at home.</h2><p>Opening your circle…</p></div></main>});
export default function WalletApp(){const wallets=useMemo(()=>[],[]);return <ConnectionProvider endpoint={rpcUrl} config={{commitment:'confirmed'}}><WalletProvider wallets={wallets} autoConnect><WalletModalProvider><Dashboard/></WalletModalProvider></WalletProvider></ConnectionProvider>;}
