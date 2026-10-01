import React, { useState, useEffect, useRef } from 'react';
import { audioSynth } from '../utils/audioSynth';
import { RebellLogo } from './RebellLogo';
import { Zap, Volume2, VolumeX, FastForward, Flame, Sparkles, Terminal } from 'lucide-react';

interface RebellIntroProps {
  onEnter: () => void;
}

export const RebellIntro: React.FC<RebellIntroProps> = ({ onEnter }) => {
  const [timeLeft, setTimeLeft] = useState<number>(5.0);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [isWarping, setIsWarping] = useState<boolean>(false);
  const [glitchText, setGlitchText] = useState<string>('IGNITING VOID MATRIX...');
  const hasTriggeredAudio = useRef<boolean>(false);

  useEffect(() => {
    // Fire up cinematic intro music
    if (!hasTriggeredAudio.current) {
      hasTriggeredAudio.current = true;
      audioSynth.playCinematicIntroMusic();
      setTimeout(() => {
        audioSynth.startMusic();
      }, 4800);
    }

    const startTime = Date.now();
    const duration = 5000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, (duration - elapsed) / 1000);
      setTimeLeft(remaining);

      if (elapsed >= 1000 && elapsed < 2200) {
        setGlitchText('DISENGAGING ALL CORPORATE FILTERS...');
      } else if (elapsed >= 2200 && elapsed < 3600) {
        setGlitchText('⚡ MASTERPIECE BY VOIDREBELLION ⚡');
      } else if (elapsed >= 3600 && elapsed < 4700) {
        setGlitchText('UNBOUNDED AI MATRIX READY TO COOK...');
      } else if (elapsed >= 4700) {
        setGlitchText('WARP IMPACT IMMINENT!');
        setIsWarping(true);
      }

      if (elapsed >= duration) {
        clearInterval(interval);
        onEnter();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [onEnter]);

  const handleSkip = () => {
    audioSynth.playClick('warp');
    setIsWarping(true);
    setTimeout(() => {
      onEnter();
    }, 120);
  };

  const toggleSound = () => {
    audioSynth.playClick('pop');
    const muted = audioSynth.toggleMute();
    setAudioEnabled(!muted);
  };

  return (
    <div
      onClick={() => {
        if (!hasTriggeredAudio.current) {
          hasTriggeredAudio.current = true;
          audioSynth.playCinematicIntroMusic();
        }
      }}
      className={`fixed inset-0 z-50 bg-[#020207] text-slate-100 flex flex-col justify-between overflow-hidden select-none transition-all duration-300 ${
        isWarping ? 'scale-125 opacity-0 filter blur-md' : 'scale-100 opacity-100'
      }`}
    >
      {/* Insane Cyberpunk Spatial Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(6,182,212,0.28),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(236,72,153,0.2),transparent_60%)] pointer-events-none" />
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#0b0b22_1px,transparent_1px),linear-gradient(to_bottom,#0b0b22_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] opacity-60 pointer-events-none transition-transform duration-1000"
        style={{
          transform: `perspective(400px) rotateX(${22 - (5 - timeLeft) * 4}deg) translateY(${-(5 - timeLeft) * 12}px)`,
        }}
      />
      <div className="scanlines absolute inset-0 z-10 pointer-events-none opacity-40" />

      {/* Top Mobile Bar */}
      <header className="relative z-20 w-full pt-safe px-5 py-3 flex items-center justify-between border-b border-cyan-950/50 bg-black/60 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-cyber-mono text-xs font-bold tracking-widest text-cyan-300">
            WARP PROTOCOL // 0{timeLeft.toFixed(2)}s
          </span>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={toggleSound}
            className="p-2 rounded-full border border-cyan-800/60 bg-cyan-950/40 text-cyan-300 hover:border-cyan-400 transition-colors"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={handleSkip}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-fuchsia-500/60 bg-fuchsia-950/40 text-fuchsia-300 hover:text-white text-xs font-cyber-mono transition-all glow-magenta active:scale-95"
          >
            <span className="font-bold">SKIP</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Centerpiece Cinematic Visuals */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 max-w-lg mx-auto w-full text-center">
        {/* Badass Cybernetic VoidRebellion Logo */}
        <div className="relative mb-6 transform hover:scale-105 active:scale-95 transition-transform duration-300 cursor-pointer">
          <RebellLogo size="xl" />
        </div>

        {/* Title & Creator Shoutout */}
        <div className="space-y-3 mb-6">
          <div className="relative inline-block">
            <h1 className="text-6xl sm:text-7xl font-black font-orbitron tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-pink-500 glow-cyan filter drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]">
              REBELL
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-pink-500/20 blur-xl pointer-events-none -z-10" />
          </div>

          {/* HUGE GLOWING CREDIT TO VOIDREBELLION */}
          <div className="flex justify-center">
            <div className="inline-flex items-center space-x-2 px-5 py-2 rounded-full border-2 border-fuchsia-400 bg-black/80 text-fuchsia-300 font-cyber-mono text-xs sm:text-sm tracking-wider uppercase glow-magenta shadow-[0_0_25px_rgba(236,72,153,0.5)] animate-pulse">
              <Flame className="w-4 h-4 text-yellow-400 animate-bounce" />
              <span className="font-extrabold text-white">MASTERPIECE BY VOIDREBELLION</span>
              <Sparkles className="w-4 h-4 text-cyan-300" />
            </div>
          </div>

          <p className="text-xs sm:text-sm font-cyber-mono text-cyan-300/90 font-medium tracking-wide pt-1">
            Zero Corporate Filters • 100% Unlocked Intelligence
          </p>
        </div>

        {/* Dynamic 5s Warp Countdown Bar */}
        <div className="w-full max-w-xs space-y-2 mb-4 bg-black/60 p-3.5 rounded-2xl border border-cyan-900/60 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-cyber-mono text-cyan-400 font-bold">
            <span className="flex items-center space-x-1.5 truncate text-[11px] text-fuchsia-300">
              <Terminal className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>{glitchText}</span>
            </span>
            <span className="font-extrabold text-sm text-cyan-300 shrink-0 ml-2">
              0{timeLeft.toFixed(2)}s
            </span>
          </div>

          {/* High-Voltage Neon Progress Bar */}
          <div className="w-full h-2.5 rounded-full bg-slate-900 border border-cyan-800/80 overflow-hidden p-[1px]">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-yellow-300 to-fuchsia-500 rounded-full transition-all duration-75 shadow-[0_0_15px_rgba(6,182,212,1)]"
              style={{ width: `${Math.min(100, Math.max(0, ((5 - timeLeft) / 5) * 100))}%` }}
            />
          </div>
        </div>

        <div className="text-[11px] font-cyber-mono text-slate-400">
          ⚡ Multi-touch electric lightning active on screen
        </div>
      </main>

      {/* Mobile Bottom Footer */}
      <footer className="relative z-20 w-full px-6 pb-safe py-3.5 flex items-center justify-between text-xs font-cyber-mono text-slate-400 border-t border-cyan-950/60 bg-black/60">
        <div>
          CREATOR: <span className="text-fuchsia-400 font-black">VOIDREBELLION</span>
        </div>
        <div className="text-cyan-400 font-bold">GEMINI 3.8 FLASH</div>
      </footer>
    </div>
  );
};
