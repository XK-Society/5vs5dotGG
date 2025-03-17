// src/services/audioCommentaryService.ts
import { Commentary } from '@/simulation/types';

// Mock audio sources - in a real implementation, these would be generated dynamically
const AUDIO_SAMPLES = {
  early_game: [
    '/audio/commentary/early_game_1.mp3',
    '/audio/commentary/early_game_2.mp3',
    '/audio/commentary/early_game_3.mp3',
  ],
  mid_game: [
    '/audio/commentary/mid_game_1.mp3',
    '/audio/commentary/mid_game_2.mp3',
    '/audio/commentary/mid_game_3.mp3',
  ],
  late_game: [
    '/audio/commentary/late_game_1.mp3',
    '/audio/commentary/late_game_2.mp3',
    '/audio/commentary/late_game_3.mp3',
  ],
  excitement: {
    1: '/audio/commentary/excitement_1.mp3',
    2: '/audio/commentary/excitement_2.mp3',
    3: '/audio/commentary/excitement_3.mp3',
    4: '/audio/commentary/excitement_4.mp3',
    5: '/audio/commentary/excitement_5.mp3',
  }
};

/**
 * Service for generating or retrieving audio commentary
 * In a real implementation, this would connect to a text-to-speech API
 */
class AudioCommentaryService {
  /**
   * Generate audio for a given commentary
   * This is a mock implementation that returns a simulated URL
   */
  async generateAudio(commentary: Commentary): Promise<string> {
    // In a real implementation, you would:
    // 1. Call Claude API with the commentary text and excitement level
    // 2. Process the API response
    // 3. Convert text to speech
    // 4. Return the audio URL
    
    console.log(`Generating audio for: "${commentary.text}" (Excitement: ${commentary.excitement})`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Select an appropriate sample based on game phase and excitement
    let audioUrl;
    
    // Select based on game phase
    if (commentary.phase === 'early_game') {
      audioUrl = AUDIO_SAMPLES.early_game[Math.floor(Math.random() * AUDIO_SAMPLES.early_game.length)];
    } else if (commentary.phase === 'mid_game') {
      audioUrl = AUDIO_SAMPLES.mid_game[Math.floor(Math.random() * AUDIO_SAMPLES.mid_game.length)];
    } else {
      audioUrl = AUDIO_SAMPLES.late_game[Math.floor(Math.random() * AUDIO_SAMPLES.late_game.length)];
    }
    
    // If we have excitement-specific audio, use that instead
    if (commentary.excitement >= 1 && commentary.excitement <= 5) {
      const excitementAudio = AUDIO_SAMPLES.excitement[commentary.excitement as 1|2|3|4|5];
      if (excitementAudio) {
        audioUrl = excitementAudio;
      }
    }
    
    // If no real audio is available, use a beep sound
    if (!audioUrl) {
      // Fallback to a beep sound
      return 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...';
    }
    
    return audioUrl;
  }
  
  /**
   * A more realistic implementation using the Web Speech API
   * This works in modern browsers but doesn't produce audio files
   */
  speakCommentary(commentary: Commentary): void {
    // Check if the Web Speech API is available
    if ('speechSynthesis' in window) {
      // Create a new speech synthesis utterance
      const utterance = new SpeechSynthesisUtterance(commentary.text);
      
      // Set voice properties based on excitement
      utterance.volume = Math.min(1, 0.6 + (commentary.excitement * 0.1)); // 0.7-1.0
      utterance.rate = Math.min(1.3, 0.9 + (commentary.excitement * 0.1));  // 0.9-1.3
      utterance.pitch = Math.min(1.2, 0.8 + (commentary.excitement * 0.1)); // 0.8-1.2
      
      // Get available voices and try to select a good one
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Try to find an English male voice
        const englishVoices = voices.filter(voice => 
          voice.lang.includes('en') && voice.name.includes('Male')
        );
        
        if (englishVoices.length > 0) {
          utterance.voice = englishVoices[0];
        }
      }
      
      // Speak the commentary
      window.speechSynthesis.speak(utterance);
    } else {
      console.log('Web Speech API not supported in this browser');
    }
  }
}

export default new AudioCommentaryService();