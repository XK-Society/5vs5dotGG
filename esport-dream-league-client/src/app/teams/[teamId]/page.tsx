// src/app/teams/[teamId]/page.tsx
'use client';

import TeamDetailComponent from './TeamDetailComponent';
import { use } from 'react';

export default function TeamDetailPage({ params }: { params: Promise<{ teamId: string }> }) {
  // Properly unwrap params using React.use()
  const { teamId } = use(params);
  return <TeamDetailComponent teamId={teamId} />;
}