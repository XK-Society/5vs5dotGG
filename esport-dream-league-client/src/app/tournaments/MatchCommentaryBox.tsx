'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Commentary } from '@/simulation/types';
import audioCommentaryService from '@/services/audioCommentaryService';

interface MatchCommentaryBoxProps {
  commentary: Commentary | null;
  audioUrl: string | null;
  isPlaying: boolean;
}

const MatchCommentaryBox: React.FC<MatchCommentaryBoxProps> = ({
  commentary,
  audioUrl,
  isPlaying
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Handle audio playback when commentary changes or play state changes
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [audioUrl, isPlaying]);
  
  // Use Web Speech API for commentary when a new commentary appears
  useEffect(() => {
    if (commentary && isPlaying) {
      // Don't use Web Speech if we already have audio
      if (!audioUrl) {
        setIsSpeaking(true);
        audioCommentaryService.speakCommentary(commentary);
        
        // Rough estimate of speech duration based on text length and excitement
        const wordCount = commentary.text.split(' ').length;
        const baseDuration = wordCount * 200; // ~200ms per word
        const excitementFactor = 1 - (commentary.excitement * 0.05); // Higher excitement = slightly faster
        const estimatedDuration = baseDuration * excitementFactor;
        
        // Reset speaking state after estimated duration
        const timer = setTimeout(() => {
          setIsSpeaking(false);
        }, estimatedDuration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [commentary, isPlaying, audioUrl]);
  
  // Get background color based on excitement level
  const getExcitementColor = (level: number) => {
    switch (level) {
      case 5: return 'bg-gradient-to-r from-red-700 to-red-800'; // Most exciting
      case 4: return 'bg-gradient-to-r from-orange-700 to-orange-800';
      case 3: return 'bg-gradient-to-r from-yellow-700 to-yellow-800';
      case 2: return 'bg-gradient-to-r from-green-800 to-green-900';
      default: return 'bg-gradient-to-r from-blue-800 to-blue-900'; // Least exciting
    }
  };
  
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2 text-white">Commentary</h3>
      
      {/* Commentary display */}
      {commentary ? (
        <div 
          className={`${getExcitementColor(commentary.excitement)} rounded-lg p-4 text-white relative overflow-hidden`}
        >
          {/* Excitement level indicator */}
          <div className="absolute top-0 right-0 text-xs px-2 py-1 bg-black bg-opacity-50 rounded-bl-lg">
            {commentary.time}m • Excitement: {commentary.excitement}/5
          </div>
          
          {/* Speaking animation */}
          {isSpeaking && (
            <div className="absolute top-2 left-2 flex space-x-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '600ms' }}></div>
            </div>
          )}
          
          {/* Display commentator names and text */}
          <div className="pt-6">
            <p className="text-lg font-semibold">{commentary.text}</p>
          </div>
          
          {/* Audio element (hidden) */}
          <audio ref={audioRef} className="hidden">
            <source src={audioUrl || ''} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
          
          {/* Audio controls */}
          <div className="mt-4 flex justify-end space-x-2">
            {/* Web Speech API button */}
            <button 
              onClick={() => audioCommentaryService.speakCommentary(commentary)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2"
              title="Text-to-Speech"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* Audio file play/pause button */}
            {audioUrl && (
              <button 
                onClick={() => {
                  if (audioRef.current) {
                    if (audioRef.current.paused) {
                      audioRef.current.play();
                    } else {
                      audioRef.current.pause();
                    }
                  }
                }}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2"
                title="Play/Pause Audio"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  {audioRef.current?.paused ? (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gray-700 rounded-lg p-4 text-gray-400 text-center">
          No commentary available yet
        </div>
      )}
    </div>
  );
};

export default MatchCommentaryBox;