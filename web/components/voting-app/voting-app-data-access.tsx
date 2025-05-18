'use client';

import { clusterApiUrl, Connection } from '@solana/web3.js';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { createContext, ReactNode, useContext } from 'react';
import toast from 'react-hot-toast';

export interface VotingNetworkConfig {
  name: string;
  endpoint: string;
  network?: VotingNetworkType;
  active?: boolean;
}

export enum VotingNetworkType {
  Mainnet = 'mainnet-beta',
  Testnet = 'testnet',
  Devnet = 'devnet',
  Custom = 'custom',
}

export const defaultVotingNetworks: VotingNetworkConfig[] = [
  {
    name: 'devnet',
    endpoint: clusterApiUrl('devnet'),
    network: VotingNetworkType.Devnet,
  },
  { name: 'local', endpoint: 'http://localhost:8899' },
  {
    name: 'testnet',
    endpoint: clusterApiUrl('testnet'),
    network: VotingNetworkType.Testnet,
  },
];

const currentVotingNetworkAtom = atomWithStorage<VotingNetworkConfig>(
  'voting-network-current',
  defaultVotingNetworks[0]
);

const allVotingNetworksAtom = atomWithStorage<VotingNetworkConfig[]>(
  'voting-network-list',
  defaultVotingNetworks
);

const activeVotingNetworksAtom = atom<VotingNetworkConfig[]>((get) => {
  const list = get(allVotingNetworksAtom);
  const selected = get(currentVotingNetworkAtom);
  return list.map((item) => ({
    ...item,
    active: item.name === selected.name,
  }));
});

const selectedVotingNetworkAtom = atom<VotingNetworkConfig>((get) => {
  const list = get(activeVotingNetworksAtom);
  return list.find((item) => item.active) || list[0];
});

export interface VotingContextType {
  network: VotingNetworkConfig;
  networks: VotingNetworkConfig[];
  addNetwork: (n: VotingNetworkConfig) => void;
  deleteNetwork: (n: VotingNetworkConfig) => void;
  setNetwork: (n: VotingNetworkConfig) => void;
  getExplorerUrl: (path: string) => string;
}

const VotingContext = createContext<VotingContextType>({} as VotingContextType);

export function VotingProvider({ children }: { children: ReactNode }) {
  const network = useAtomValue(selectedVotingNetworkAtom);
  const networks = useAtomValue(activeVotingNetworksAtom);
  const setNetwork = useSetAtom(currentVotingNetworkAtom);
  const setNetworks = useSetAtom(allVotingNetworksAtom);

  const value: VotingContextType = {
    network,
    networks: networks.sort((a, b) => (a.name > b.name ? 1 : -1)),
    addNetwork: (n: VotingNetworkConfig) => {
      try {
        new Connection(n.endpoint);
        setNetworks([...networks, n]);
      } catch (err) {
        toast.error(`${err}`);
      }
    },
    deleteNetwork: (n: VotingNetworkConfig) => {
      setNetworks(networks.filter((item) => item.name !== n.name));
    },
    setNetwork: (n: VotingNetworkConfig) => setNetwork(n),
    getExplorerUrl: (path: string) =>
      `https://explorer.solana.com/${path}${getClusterParamSuffix(network)}`,
  };

  return <VotingContext.Provider value={value}>{children}</VotingContext.Provider>;
}

export function useVoting() {
  return useContext(VotingContext);
}

function getClusterParamSuffix(network: VotingNetworkConfig): string {
  let suffix = '';
  switch (network.network) {
    case VotingNetworkType.Devnet:
      suffix = 'devnet';
      break;
    case VotingNetworkType.Mainnet:
      suffix = '';
      break;
    case VotingNetworkType.Testnet:
      suffix = 'testnet';
      break;
    default:
      suffix = `custom&customUrl=${encodeURIComponent(network.endpoint)}`;
      break;
  }
  return suffix.length ? `?cluster=${suffix}` : '';
}
