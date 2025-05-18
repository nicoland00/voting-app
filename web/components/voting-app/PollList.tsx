'use client';

import { useEffect, useState } from 'react';
import { useVotingProgram } from '@/lib/useVotingProgram';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';

interface PollAccount {
  pollName: string;
  pollDescription: string;
  pollVotingStart: number;
  pollVotingEnd: number;
  pollOptionIndex: number;
}

export default function PollList() {
  const program = useVotingProgram();
  const { publicKey } = useWallet();
  const [polls, setPolls] = useState<{ publicKey: PublicKey; account: PollAccount }[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<string | null>(null);
  const [result, setResult] = useState('');

  useEffect(() => {
    if (!program) return;
  
    (async () => {
      try {
        const allPolls = await program.account.PollAccount.all();
        setPolls(allPolls);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [program]);
  

  const handleVote = async (pollPubkey: PublicKey, optionIndex: number) => {
    if (!program || !publicKey) return;
    setSelectedPoll(pollPubkey.toBase58());
    setResult('');

    try {
      await program.methods
        .vote(optionIndex)
        .accountsPartial({
          poll: pollPubkey,
          voter: publicKey,
        })
        .rpc();

      setResult(`✅ Voted for option ${optionIndex + 1}`);
    } catch (err) {
      if (err instanceof Error) {
        setResult(`❌ Error: ${err.message}`);
      } else {
        setResult(`❌ Unknown error occurred`);
      }
      console.error(err);
    } finally {
      setSelectedPoll(null);
    }
  };

  if (!program) return <div className="text-center">Connect wallet to view polls.</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 space-y-6">
      <h2 className="text-xl font-bold text-center">🗳️ Active Polls</h2>

      {loading && <p>Loading polls...</p>}

      {!loading && polls.length === 0 && (
        <p className="text-center text-gray-500">No polls found</p>
      )}

      {polls.map(({ publicKey, account }) => (
        <div key={publicKey.toBase58()} className="p-4 border rounded-md bg-base-100 space-y-2">
          <h3 className="font-semibold">{account.pollName}</h3>
          <p className="text-sm text-gray-600">{account.pollDescription}</p>
          <div className="space-y-2">
            {Array.from({ length: account.pollOptionIndex }, (_, i) => (
              <button
                key={i}
                className="btn btn-sm btn-outline w-full"
                disabled={selectedPoll === publicKey.toBase58()}
                onClick={() => handleVote(publicKey, i)}
              >
                ✅ Option {i + 1}
              </button>
            ))}
          </div>
        </div>
      ))}

      {result && <div className="alert alert-info mt-4">{result}</div>}
    </div>
  );
}
