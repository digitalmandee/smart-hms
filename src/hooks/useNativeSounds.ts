import { Capacitor } from '@capacitor/core';
import { useCallback, useRef } from 'react';

type SoundType = 'notification' | 'success' | 'error' | 'alert' | 'click' | 'refresh';

// Sound configuration with Web Audio API frequencies
const soundConfig: Record<SoundType, { frequency: number; duration: number; type: OscillatorType }> = {
  notification: { frequency: 880, duration: 150, type: 'sine' },
  success: { frequency: 523.25, duration: 200, type: 'sine' },
  error: { frequency: 220, duration: 300, type: 'square' },
  alert: { frequency: 660, duration: 400, type: 'triangle' },
  click: { frequency: 1000, duration: 50, type: 'sine' },
  refresh: { frequency: 440, duration: 100, type: 'sine' }
};

export function useNativeSounds() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isNative = Capacitor.isNativePlatform();

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback(async (type: SoundType, volume: number = 0.3) => {
    try {
      const config = soundConfig[type];
      const audioContext = getAudioContext();
      
      // Resume context if suspended (required for mobile browsers)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = config.type;
      oscillator.frequency.setValueAtTime(config.frequency, audioContext.currentTime);

      // Create envelope for smoother sound
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + config.duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + config.duration / 1000);
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }, [getAudioContext]);

  const playSuccessSound = useCallback(() => {
    // Play a pleasant two-tone success sound
    const playTone = async (freq: number, delay: number) => {
      try {
        const audioContext = getAudioContext();
        if (audioContext.state === 'suspended') await audioContext.resume();

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + delay);

        gainNode.gain.setValueAtTime(0, audioContext.currentTime + delay);
        gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + delay + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + delay + 0.15);

        oscillator.start(audioContext.currentTime + delay);
        oscillator.stop(audioContext.currentTime + delay + 0.15);
      } catch (e) {
        console.warn('Success sound failed:', e);
      }
    };

    playTone(523.25, 0); // C5
    playTone(659.25, 0.1); // E5
  }, [getAudioContext]);

  const playErrorSound = useCallback(() => {
    playSound('error', 0.2);
  }, [playSound]);

  const playClickSound = useCallback(() => {
    playSound('click', 0.1);
  }, [playSound]);

  const playNotificationSound = useCallback(() => {
    playSound('notification', 0.25);
  }, [playSound]);

  const playAlertSound = useCallback(() => {
    playSound('alert', 0.3);
  }, [playSound]);

  return {
    isAvailable: true, // Web Audio API is widely supported
    isNative,
    playSound,
    playSuccessSound,
    playErrorSound,
    playClickSound,
    playNotificationSound,
    playAlertSound
  };
}
