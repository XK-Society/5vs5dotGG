// src/components/match/match-events.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamAccount } from '@/lib/types/program';
import { SimulatedMatchResult } from '@/lib/simulation/engine';

interface MatchEventsProps {
  matchResult: SimulatedMatchResult;
  teamA: TeamAccount;
  teamB: TeamAccount;
}

export default function MatchEvents({ matchResult, teamA, teamB }: MatchEventsProps) {
  // Sort events by timestamp
  const sortedEvents = [...matchResult.events].sort((a, b) => a.timestamp - b.timestamp);
  
  // Format timestamp for display (mm:ss)
  const formatTimestamp = (timestamp: number): string => {
    const minutes = Math.floor(timestamp / 60);
    const seconds = timestamp % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get event icon based on type
  const getEventIcon = (type: string): string => {
    switch (type) {
      case 'kill':
        return '☠️';
      case 'objective':
        return '🏆';
      case 'teamfight':
        return '⚔️';
      case 'special':
        return '✨';
      default:
        return '📝';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Match Commentary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {matchResult.commentary.map((comment, index) => (
              <div key={index} className="p-4 bg-secondary/30 rounded-lg">
                <p>{comment}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Match Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sortedEvents.map((event, index) => (
              <div 
                key={index} 
                className={`flex items-start p-3 border-l-4 rounded-md ${
                  event.teamIndex === 0 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-red-500 bg-red-500/10'
                }`}
              >
                <div className="mr-3 text-xl">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {event.teamIndex === 0 ? teamA.name : teamB.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Final Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="flex flex-col items-center">
              <span className="text-lg font-medium">{teamA.name}</span>
              <span className={`text-4xl font-bold ${matchResult.winnerIndex === 0 ? 'text-green-500' : 'text-red-500'}`}>
                {matchResult.score[0]}
              </span>
            </div>
            
            <div className="text-2xl font-bold text-muted-foreground">VS</div>
            
            <div className="flex flex-col items-center">
              <span className="text-lg font-medium">{teamB.name}</span>
              <span className={`text-4xl font-bold ${matchResult.winnerIndex === 1 ? 'text-green-500' : 'text-red-500'}`}>
                {matchResult.score[1]}
              </span>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-xl font-medium">
              Winner: {matchResult.winnerIndex === 0 ? teamA.name : teamB.name}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}