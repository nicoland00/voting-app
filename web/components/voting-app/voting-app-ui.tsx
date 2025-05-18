'use client';

import { useConnection } from '@solana/wallet-adapter-react';
import { IconTrash } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { AppModal } from '../ui/ui-layout';
import {
  VotingNetworkType,
  useVoting,
} from './voting-app-data-access';
import { Connection } from '@solana/web3.js';

export function ExplorerLink({
  path,
  label,
  className,
}: {
  path: string;
  label: string;
  className?: string;
}) {
  const { getExplorerUrl } = useVoting();
  return (
    <a
      href={getExplorerUrl(path)}
      target="_blank"
      rel="noopener noreferrer"
      className={className ? className : `link font-mono`}
    >
      {label}
    </a>
  );
}

export function VotingChecker({ children }: { children: ReactNode }) {
  const { network } = useVoting();
  const { connection } = useConnection();

  const query = useQuery({
    queryKey: ['version', { network, endpoint: connection.rpcEndpoint }],
    queryFn: () => connection.getVersion(),
    retry: 1,
  });

  if (query.isLoading) return null;
  if (query.isError || !query.data) {
    return (
      <div className="alert alert-warning text-warning-content/80 rounded-none flex justify-center">
        <span>
          Error connecting to network <strong>{network.name}</strong>
        </span>
        <button
          className="btn btn-xs btn-neutral"
          onClick={() => query.refetch()}
        >
          Refresh
        </button>
      </div>
    );
  }

  return children;
}

export function VotingUiSelect() {
  const { networks, setNetwork, network } = useVoting();
  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-primary rounded-btn">
        {network.name}
      </label>
      <ul
        tabIndex={0}
        className="menu dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-52 mt-4"
      >
        {networks.map((item) => (
          <li key={item.name}>
            <button
              className={`btn btn-sm ${
                item.active ? 'btn-primary' : 'btn-ghost'
              }`}
              onClick={() => setNetwork(item)}
            >
              {item.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function VotingUiModal({
  hideModal,
  show,
}: {
  hideModal: () => void;
  show: boolean;
}) {
  const { addNetwork } = useVoting();
  const [name, setName] = useState('');
  const [network, setNetwork] = useState<VotingNetworkType | undefined>();
  const [endpoint, setEndpoint] = useState('');

  return (
    <AppModal
      title={'Add Voting Network'}
      hide={hideModal}
      show={show}
      submit={() => {
        try {
          new Connection(endpoint);
          if (name) {
            addNetwork({ name, network, endpoint });
            hideModal();
          } else {
            console.log('Invalid name');
          }
        } catch {
          console.log('Invalid endpoint');
        }
      }}
      submitLabel="Save"
    >
      <input
        type="text"
        placeholder="Name"
        className="input input-bordered w-full"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Endpoint"
        className="input input-bordered w-full"
        value={endpoint}
        onChange={(e) => setEndpoint(e.target.value)}
      />
      <select
        className="select select-bordered w-full"
        value={network}
        onChange={(e) => setNetwork(e.target.value as VotingNetworkType)}
      >
        <option value={undefined}>Select a network</option>
        <option value={VotingNetworkType.Devnet}>Devnet</option>
        <option value={VotingNetworkType.Testnet}>Testnet</option>
        <option value={VotingNetworkType.Mainnet}>Mainnet</option>
      </select>
    </AppModal>
  );
}

export function VotingUiTable() {
  const { networks, setNetwork, deleteNetwork } = useVoting();
  return (
    <div className="overflow-x-auto">
      <table className="table border-4 border-separate border-base-300">
        <thead>
          <tr>
            <th>Name / Network / Endpoint</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {networks.map((item) => (
            <tr key={item.name} className={item?.active ? 'bg-base-200' : ''}>
              <td className="space-y-2">
                <div className="whitespace-nowrap space-x-2">
                  <span className="text-xl">
                    {item?.active ? (
                      item.name
                    ) : (
                      <button
                        title="Select"
                        className="link link-secondary"
                        onClick={() => setNetwork(item)}
                      >
                        {item.name}
                      </button>
                    )}
                  </span>
                </div>
                <span className="text-xs">
                  Network: {item.network ?? 'custom'}
                </span>
                <div className="whitespace-nowrap text-gray-500 text-xs">
                  {item.endpoint}
                </div>
              </td>
              <td className="space-x-2 whitespace-nowrap text-center">
                <button
                  disabled={item?.active}
                  className="btn btn-xs btn-default btn-outline"
                  onClick={() => {
                    if (!window.confirm('Are you sure?')) return;
                    deleteNetwork(item);
                  }}
                >
                  <IconTrash size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
