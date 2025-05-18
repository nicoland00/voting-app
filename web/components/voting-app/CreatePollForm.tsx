'use client';

import { useState } from 'react';
import { useVotingProgram } from '@/lib/useVotingProgram';
import { web3 } from '@coral-xyz/anchor';
import { useWallet } from '@solana/wallet-adapter-react';

export default function CreatePollForm() {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const program = useVotingProgram();
  const { publicKey } = useWallet();

  const handleOptionChange = (value: string, index: number) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => setOptions([...options, '']);

  const handleCreatePoll = async () => {
    if (!program || !publicKey || !title || options.some(o => o.trim() === '')) return;

    setLoading(true);
    try {
      const pollKeypair = web3.Keypair.generate();

      await program.methods
        .createPoll(title, options)
        .accountsPartial({
          poll: pollKeypair.publicKey,
          authority: publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([pollKeypair])
        .rpc();

      setResult(`✅ Poll created at: ${pollKeypair.publicKey.toBase58()}`);
    } catch (err) {
      console.error(err);
      setResult('❌ Error creating poll. Check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-4 border rounded-lg bg-base-200 space-y-4">
      <h2 className="text-xl font-bold">Create New Poll</h2>

      <input
        type="text"
        placeholder="Poll Title"
        className="input input-bordered w-full"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="space-y-2">
        {options.map((opt, i) => (
          <input
            key={i}
            type="text"
            placeholder={`Option ${i + 1}`}
            className="input input-bordered w-full"
            value={opt}
            onChange={(e) => handleOptionChange(e.target.value, i)}
          />
        ))}
      </div>

      <button onClick={addOption} className="btn btn-sm btn-ghost">
        ➕ Add Option
      </button>

      <button
        onClick={handleCreatePoll}
        className="btn btn-primary w-full"
        disabled={loading || !program}
      >
        {loading ? 'Creating...' : 'Create Poll'}
      </button>

      {result && <div className="mt-2 text-sm">{result}</div>}
    </div>
  );
}
