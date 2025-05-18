'use client';

import { useState } from 'react';
import { AppHero } from '../ui/ui-layout';
import { VotingUiModal } from './voting-app-ui';
import { VotingUiTable } from './voting-app-ui';

export default function VotingFeature() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <AppHero
        title="Voting Networks"
        subtitle="Manage and select your voting environments on Solana"
      >
        <VotingUiModal
          show={showModal}
          hideModal={() => setShowModal(false)}
        />
        <button
          className="btn btn-xs lg:btn-md btn-primary"
          onClick={() => setShowModal(true)}
        >
          Add Voting Network
        </button>
      </AppHero>
      <VotingUiTable />
    </div>
  );
}
