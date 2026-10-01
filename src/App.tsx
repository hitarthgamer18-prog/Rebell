/**
 * REBELL — Developed by voidrebellion
 * High-performance cyberpunk AI chat companion & interactive terminal
 */

import React, { useState } from 'react';
import { TouchParticleCanvas } from './components/TouchParticleCanvas';
import { RebellIntro } from './components/RebellIntro';
import { ChatInterface } from './components/ChatInterface';

export default function App() {
  const [showIntro, setShowIntro] = useState<boolean>(true);

  return (
    <div className="relative min-h-screen w-full bg-[#05050a] text-slate-100 overflow-hidden font-rajdhani">
      {/* Global Hardware-Accelerated Touch & Mobile Tap Particle Canvas (Ultra Low RAM) */}
      <TouchParticleCanvas />

      {/* Intro or Main Chat Terminal */}
      {showIntro ? (
        <RebellIntro onEnter={() => setShowIntro(false)} />
      ) : (
        <ChatInterface onReplayIntro={() => setShowIntro(true)} />
      )}
    </div>
  );
}
