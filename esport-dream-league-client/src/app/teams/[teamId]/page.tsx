// src/app/teams/[teamId]/page.tsx
'use client';

import TeamDetailComponent from './TeamDetailComponent';

export default function TeamDetailPage({ params }: { params: { teamId: string } }) {
  return <TeamDetailComponent teamId={params.teamId} />;
}