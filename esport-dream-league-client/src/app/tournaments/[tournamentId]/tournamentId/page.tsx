// src/app/tournaments/[tournamentId]/tournamentId/page.tsx
'use client';

import { use } from 'react';
import TournamentDetailComponent from '../TournamentDetailComponent';

export default function TournamentDetailPage({ params }: { params: Promise<{ tournamentId: string }> }) {
  // Properly unwrap params using React.use()
  const { tournamentId } = use(params);
  return <TournamentDetailComponent tournamentId={tournamentId} />;
}