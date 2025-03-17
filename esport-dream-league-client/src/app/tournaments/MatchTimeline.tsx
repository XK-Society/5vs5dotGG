'use client';

import React from 'react';
import { SimulationEvent } from '@/simulation/types';

interface MatchTimelineProps {
  events: SimulationEvent[];
  currentTime: number;
  duration: number;
  onTimeChange: (time: number) => void;
}

const MatchTimeline: React.FC<MatchTimelineProps> = ({
  events,
  currentTime,
  duration,
  onTimeChange
}) => {
  // Calculate percentage position for events and current time
  const getPositionPercent = (time: number) => (time / duration) * 100;
  
  // Event colors based on type
  const getEventColor = (event: SimulationEvent) => {
    const teamColor = event.favoredTeam === 'teamA' ? 'bg-blue-600' : 'bg-red-600';
    
    if (event.type === 'objective') {
      return `${teamColor}`;
    } else if (event.type === 'teamfight') {
      return `${teamColor} border-2 border-white`;
    } else {
      return `${teamColor} opacity-70`;
    }
  };
  
  // Event size based on impact
  const getEventSize = (event: SimulationEvent) => {
    return event.impact === 3 ? 'h-5 w-5' :
           event.impact === 2 ? 'h-4 w-4' : 'h-3 w-3';
  };
  
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2 text-white">Match Timeline</h3>
      
      {/* Timeline bar */}
      <div className="relative h-8 bg-gray-700 rounded-lg mb-2">
        {/* Game phases */}
        <div className="absolute inset-y-0 left-0 w-1/3 bg-gray-600 bg-opacity-50 rounded-l-lg"></div>
        <div className="absolute inset-y-0 left-1/3 w-1/3 bg-gray-600 bg-opacity-30"></div>
        <div className="absolute inset-y-0 left-2/3 right-0 bg-gray-600 bg-opacity-10 rounded-r-lg"></div>
        
        {/* Phase labels */}
        <div className="absolute inset-0 flex text-xs text-gray-400">
          <div className="w-1/3 text-center my-auto">Early Game</div>
          <div className="w-1/3 text-center my-auto">Mid Game</div>
          <div className="w-1/3 text-center my-auto">Late Game</div>
        </div>
        
        {/* Event markers */}
        {events.map((event, index) => (
          <div
            key={index}
            className={`absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${getEventColor(event)} ${getEventSize(event)}`}
            style={{ 
              left: `${getPositionPercent(event.time)}%`,
              top: '50%'
            }}
            title={`${event.time}m - ${event.description}`}
            onClick={() => onTimeChange(event.time)}
          />
        ))}
        
        {/* Current time marker */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white transform -translate-x-1/2"
          style={{ left: `${getPositionPercent(currentTime)}%` }}
        />
      </div>
      
      {/* Time markers */}
      <div className="flex justify-between text-xs text-gray-400">
        <span>0:00</span>
        <span>{Math.ceil(duration / 3)}:00</span>
        <span>{Math.ceil(2 * duration / 3)}:00</span>
        <span>{duration}:00</span>
      </div>
      
      {/* Time scrubber */}
      <div className="mt-4">
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={(e) => onTimeChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-2 text-xs text-gray-400">
        <div className="flex items-center">
          <div className="h-3 w-3 bg-blue-600 rounded-full mr-1"></div>
          <span>Team A Event</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 bg-red-600 rounded-full mr-1"></div>
          <span>Team B Event</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 bg-blue-600 border-2 border-white rounded-full mr-1"></div>
          <span>Teamfight</span>
        </div>
        <div className="flex items-center">
          <div className="h-4 w-4 bg-blue-600 rounded-full mr-1"></div>
          <span>Major Event</span>
        </div>
      </div>
    </div>
  );
};

export default MatchTimeline;