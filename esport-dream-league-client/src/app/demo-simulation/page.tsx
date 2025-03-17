'use client';

import React, { useState } from 'react';
import { getMockTournamentData } from '@/services/mockTournamentService';
import TournamentSimulator from '@/app/tournaments/TournamentSimulator';
import TournamentMatchViewer from '@/app/tournaments/TournamentMatchViewer';
import Link from 'next/link';

export default function DemoSimulationPage() {
  const { tournament, teams, teamAPlayers, teamBPlayers } = getMockTournamentData();
  
  const [showMatchViewer, setShowMatchViewer] = useState(false);
  const [showBracket, setShowBracket] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <header className="border-b border-gray-800 bg-gray-900 mb-6">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="text-xl font-bold text-yellow-500 mr-2">5VS5</div>
                <div className="text-xl font-bold text-blue-400">dotGG</div>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-gray-400 hover:text-blue-400">Home</Link>
              <Link href="/players" className="text-gray-400 hover:text-blue-400">Players</Link>
              <Link href="/teams" className="text-gray-400 hover:text-blue-400">Teams</Link>
              <Link href="/tournaments" className="text-gray-400 hover:text-blue-400">Tournaments</Link>
            </nav>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Tournament Simulation Demo</h1>
        <p className="mb-6 text-gray-400">
          This is a demonstration of the tournament simulation feature with mock data. You can see both the match simulator and the tournament bracket.
        </p>
        
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-bold mb-2">{tournament.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-400">Entry Fee</p>
              <p>{(tournament.entryFee / 1_000_000_000).toFixed(2)} SOL</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Prize Pool</p>
              <p>{(tournament.prizePool / 1_000_000_000).toFixed(2)} SOL</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Teams</p>
              <p>{tournament.registeredTeams.length}/{tournament.maxTeams}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {teams.map((team, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="h-12 w-12 bg-blue-900 rounded-full flex items-center justify-center text-lg font-bold mr-3">
                  {team.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{team.name}</h3>
                  <p className="text-sm text-gray-400">Win Rate: {Math.round((team.statistics.wins / team.statistics.matchesPlayed) * 100)}%</p>
                </div>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Team Synergy</span>
                  <span>{team.statistics.synergyScore}/100</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${team.statistics.synergyScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mb-6 flex flex-wrap gap-4">
          <button 
            onClick={() => {
              setShowMatchViewer(true);
              setShowBracket(false);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            View Single Match Simulation
          </button>
          
          <button 
            onClick={() => {
              setShowBracket(true);
              setShowMatchViewer(false);
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            View Tournament Bracket
          </button>
        </div>
        
        {showMatchViewer && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Match Simulation</h2>
            <p className="mb-4 text-gray-400">
              This is a demonstration of a single match simulation with live commentary.
            </p>
            
            <TournamentMatchViewer
              teamA={teams[0]}
              teamB={teams[1]}
              teamAPlayers={teamAPlayers}
              teamBPlayers={teamBPlayers}
              autoPlay={true}
            />
          </div>
        )}
        
        {showBracket && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Tournament Bracket</h2>
            <p className="mb-4 text-gray-400">
              This demonstrates the tournament bracket and simulation.
            </p>
            
            <TournamentSimulator 
              tournament={tournament}
              registeredTeams={teams}
            />
          </div>
        )}
      </div>
    </div>
  );
}