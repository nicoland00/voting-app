'use client';

import { useVoting } from './voting-app-data-access';

interface ClusterUiModalProps {
  show: boolean;
  hideModal: () => void;
}

export function ClusterUiModal({ show, hideModal }: ClusterUiModalProps) {
  const { addNetwork } = useVoting();

  if (!show) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Add Cluster</h3>
        <div className="py-4">
          <input
            type="text"
            placeholder="Cluster Name"
            className="input input-bordered w-full"
          />
          <input
            type="text"
            placeholder="Endpoint URL"
            className="input input-bordered w-full mt-4"
          />
        </div>
        <div className="modal-action">
          <button className="btn" onClick={hideModal}>
            Cancel
          </button>
          <button className="btn btn-primary">Add</button>
        </div>
      </div>
    </div>
  );
}

export function ClusterUiTable() {
  const { networks, deleteNetwork, setNetwork } = useVoting();

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Endpoint</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {networks.map((network) => (
            <tr key={network.name}>
              <td>{network.name}</td>
              <td>{network.endpoint}</td>
              <td>
                <button
                  className="btn btn-xs btn-primary mr-2"
                  onClick={() => setNetwork(network)}
                >
                  Select
                </button>
                <button
                  className="btn btn-xs btn-error"
                  onClick={() => deleteNetwork(network)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 