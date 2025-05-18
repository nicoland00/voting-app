import { AnchorProvider, Program, setProvider } from '@coral-xyz/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { useMemo } from 'react';
import idl from './idl.json';

const PROGRAM_ID = new PublicKey('5s3PtT8kLYCv1WEp6dSh3T7EuF35Z6jSu5Cvx4hWG79H');

export interface PollAccount {
  pollName: string;
  pollDescription: string;
  pollVotingStart: number;
  pollVotingEnd: number;
  pollOptionIndex: number;
}

export interface VotingProgram extends Program {
  account: {
    PollAccount: {
      all: () => Promise<{ publicKey: PublicKey; account: PollAccount }[]>;
    };
  };
}

export function useVotingProgram() {
  const wallet = useWallet();

  const program = useMemo(() => {
    if (!wallet?.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      return null;
    }

    const connection = new Connection('https://api.devnet.solana.com');

    const provider = new AnchorProvider(connection, {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions,
    }, { preflightCommitment: 'processed' });

    setProvider(provider);

    return new Program(idl as any, provider) as VotingProgram;
  }, [wallet]);

  return program;
}
