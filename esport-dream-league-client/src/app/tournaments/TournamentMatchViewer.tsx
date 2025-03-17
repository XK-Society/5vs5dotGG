'use client';

import React, { useState, useEffect } from 'react';
import { TeamAccount, PlayerAccount } from '@/types/program-types';
import matchSimulationService from '@/services/matchSimulationService';
import { SimulationEvent, MatchStats, Commentary } from '@/simulation/types';
import MatchTimeline from './MatchTimeline';
import MatchCommentaryBox from './MatchCommentaryBox';
import MatchScoreboard from './MatchScoreboard';

interface TournamentMatchViewerProps {
  teamA: TeamAccount;
  teamB: TeamAccount;
  teamAPlayers: PlayerAccount[];
  teamBPlayers: PlayerAccount[];
  onMatchComplete?: (winner: TeamAccount, score: [number, number]) => void;
  autoPlay?: boolean;
}

const TournamentMatchViewer: React.FC<TournamentMatchViewerProps> = ({
  teamA,
  teamB,
  teamAPlayers,
  teamBPlayers,
  onMatchComplete,
  autoPlay = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [matchData, setMatchData] = useState<{
    winner: TeamAccount;
    loser: TeamAccount;
    score: [number, number];
    events: SimulationEvent[];
    stats: MatchStats;
    commentary: Commentary[];
  } | null>(null);
  
  const [currentTime, setCurrentTime] = useState(0);
  const [currentEvent, setCurrentEvent] = useState<SimulationEvent | null>(null);
  const [currentCommentary, setCurrentCommentary] = useState<Commentary | null>(null);
  const [commentaryAudio, setCommentaryAudio] = useState<string | null>(null);
  
  // Simulate the match on component mount
  useEffect(() => {
    const simulateMatch = async () => {
      setIsLoading(true);
      try {
        // Run the match simulation
        const result = await matchSimulationService.simulateMatch(
          teamA,
          teamB,
          teamAPlayers,
          teamBPlayers
        );
        
        setMatchData(result);
        
        // Notify parent component if callback provided
        if (onMatchComplete) {
          onMatchComplete(result.winner, result.score);
        }
        
        // Auto start playback if enabled
        if (autoPlay) {
          setIsPlaying(true);
        }
      } catch (error) {
        console.error('Error simulating match:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    simulateMatch();
  }, [teamA, teamB, teamAPlayers, teamBPlayers, onMatchComplete, autoPlay]);
  
  // Control playback
  useEffect(() => {
    if (!isPlaying || !matchData || isLoading) return;
    
    const maxTime = matchData.stats.duration;
    
    // Update match time
    const timer = setInterval(() => {
      setCurrentTime(prevTime => {
        // Stop at the end of the match
        if (prevTime >= maxTime) {
          setIsPlaying(false);
          return maxTime;
        }
        return prevTime + 1;
      });
    }, 1000); // 1 second per game minute for faster playback
    
    return () => clearInterval(timer);
  }, [isPlaying, matchData, isLoading]);
  
  // Update current event and commentary based on time
  useEffect(() => {
    if (!matchData) return;
    
    // Find the latest event before the current time
    const activeEvent = [...matchData.events]
      .reverse()
      .find(event => event.time <= currentTime) || null;
    
    // Find the latest commentary before the current time
    const activeCommentary = [...matchData.commentary]
      .reverse()
      .find(comment => comment.time <= currentTime) || null;
    
    setCurrentEvent(activeEvent);
    
    // Only update commentary and load audio if it's a new commentary
    if (activeCommentary && 
        (!currentCommentary || currentCommentary.time !== activeCommentary.time)) {
      setCurrentCommentary(activeCommentary);
      
      // Generate audio for new commentary
      const generateAudio = async () => {
        try {
          const audioUrl = await matchSimulationService.generateCommentaryAudio(activeCommentary);
          setCommentaryAudio(audioUrl);
        } catch (error) {
          console.error('Error generating commentary audio:', error);
        }
      };
      
      generateAudio();
    }
  }, [currentTime, matchData, currentCommentary]);
  
  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-white">Simulating match between {teamA.name} and {teamB.name}...</p>
        </div>
      </div>
    );
  }
  
  if (!matchData) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-white">Error simulating match. Please try again.</p>
      </div>
    );
  }
  
  const { winner, loser, score, events, stats, commentary } = matchData;
  
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {/* Match header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="h-16 w-16 bg-blue-900 rounded-full flex items-center justify-center text-xl font-bold mr-3">
            {teamA.name.charAt(0)}
          </div>
          <h3 className="text-xl font-bold">{teamA.name}</h3>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold mb-1">{score[0]} - {score[1]}</div>
          <div className="text-sm text-gray-400">Match Time: {currentTime}/{stats.duration} mins</div>
        </div>
        
        <div className="flex items-center">
          <h3 className="text-xl font-bold">{teamB.name}</h3>
          <div className="h-16 w-16 bg-red-900 rounded-full flex items-center justify-center text-xl font-bold ml-3">
            {teamB.name.charAt(0)}
          </div>
        </div>
      </div>
      
      {/* Match result banner if game is complete */}
      {currentTime >= stats.duration && (
        <div className={`mb-6 p-4 rounded-lg text-center text-white ${winner.name === teamA.name ? 'bg-blue-700' : 'bg-red-700'}`}>
          <h3 className="text-xl font-bold">{winner.name} Wins!</h3>
          <p>Final Score: {score[0]} - {score[1]}</p>
        </div>
      )}
      
      {/* Match controls */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setCurrentTime(Math.max(0, currentTime - 5))}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          -5 mins
        </button>
        
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        
        <button
          onClick={() => setCurrentTime(Math.min(stats.duration, currentTime + 5))}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          +5 mins
        </button>
        
        <button
          onClick={() => setCurrentTime(0)}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Restart
        </button>
      </div>
      
      {/* Match timeline */}
      <MatchTimeline 
        events={events} 
        currentTime={currentTime} 
        duration={stats.duration}
        onTimeChange={setCurrentTime}
      />
      
      {/* Current commentary */}
      <MatchCommentaryBox
        commentary={currentCommentary}
        audioUrl={commentaryAudio}
        isPlaying={isPlaying}
      />
      
      {/* Match scoreboard/stats */}
      <MatchScoreboard
        teamA={teamA}
        teamB={teamB}
        teamAPlayers={teamAPlayers}
        teamBPlayers={teamBPlayers}
        matchStats={stats}
        currentTime={currentTime}
      />
    </div>
  );
};

export default TournamentMatchViewer;