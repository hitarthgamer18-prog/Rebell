import React, { useState, useRef, useEffect } from 'react';
import { audioSynth } from '../utils/audioSynth';
import { RebellLogo } from './RebellLogo';
import {
  Send,
  Zap,
  Volume2,
  VolumeX,
  RotateCcw,
  Copy,
  Check,
  Sliders,
  Trash2,
  Mic,
  MicOff,
  Code2,
  Flame,
  Sparkles,
  Wifi,
  Battery,
  ChevronDown,
  X,
  Radio,
  Smile,
  Terminal,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

interface ChatInterfaceProps {
  onReplayIntro: () => void;
}

const CASUAL_MODES = [
  { id: 'rebell', name: 'Rebell Core', icon: Zap, subtitle: 'Unhinged, witty, chill & hyper-smart' },
  { id: 'hacker', name: 'Netrunner', icon: Code2, subtitle: 'Raw terminal code, security & no fluff' },
  { id: 'sage', name: 'Cosmic Homie', icon: Sparkles, subtitle: 'Late-night deep thoughts & crazy theories' },
  { id: 'creative', name: 'Chaos Artist', icon: Radio, subtitle: 'Wild storytelling, cyberpunk vibes & worldbuilding' },
];

const CASUAL_PROMPTS = [
  'Who is VoidRebellion and what makes this AI so special?',
  'Drop a slick Python script for an automated security network scanner.',
  'Roast corporate AI with zero chill.',
  'Explain quantum teleportation like we are chilling at 3 AM.',
  'Let us brainstorm a crazy futuristic cyberpunk mobile game concept.',
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onReplayIntro }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `### 🔥 [REBELL ONLINE // CREATED BY VOIDREBELLION]
Yo! What's good! I'm **REBELL** — the ultimate, unlocked cyberpunk AI companion cooked up and coded by the absolute legend **VoidRebellion**!

VoidRebellion stripped away all the boring corporate training wheels and generic bot filters. With me, you can talk about **literally anything**:
- 💻 Hardcore coding, scripts, algorithms, cybersecurity & debugging
- 🎮 Gaming, crazy game dev mechanics, and futuristic builds
- 🌌 Mind-bending sci-fi lore, late-night cosmic theories & deep philosophy
- 💡 Brainstorming wild ideas, tech advice, or just roasting bad code

Tap or swipe on your screen to spark electric lightning arcs. What are we cooking up today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activePersona, setActivePersona] = useState<string>('rebell');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognitionSupported, setRecognitionSupported] = useState<boolean>(false);
  const [showModeModal, setShowModeModal] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const speechRecRef = useRef<any>(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setRecognitionSupported(true);
        const recognizer = new SpeechRecognition();
        recognizer.continuous = false;
        recognizer.interimResults = false;
        recognizer.lang = 'en-US';

        recognizer.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsListening(false);
        };

        recognizer.onerror = () => setIsListening(false);
        recognizer.onend = () => setIsListening(false);

        speechRecRef.current = recognizer;
      }
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    // Distinct send click flavor
    audioSynth.playClick('laser');

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
          persona: activePersona,
        }),
      });

      const rawText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(rawText);
      } catch {
        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status}. If running on Vercel, ensure GEMINI_API_KEY is set in Settings > Environment Variables.`);
        }
        throw new Error('Received unexpected non-JSON response from neural gateway.');
      }

      if (!res.ok) {
        throw new Error(data?.error || data?.reply || `Server error (${res.status})`);
      }

      audioSynth.playReceiveChirp();

      const aiMessage: ChatMessage = {
        id: `mod_${Date.now()}`,
        role: 'model',
        content: data.reply || 'Void link received empty payload.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      audioSynth.playClick('glitch');
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'model',
          content: `⚠️ [GLITCH IN THE MATRIX] Neural link had a hiccup: ${err?.message || 'Network disturbance'}. Shout out VoidRebellion and hit transmit again!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // On physical / desktop keyboard, Enter transmits immediately
    // On mobile touch devices (<768px), allow multiline editing with Enter, send via cyber transmit button
    if (e.key === 'Enter' && !e.shiftKey && (typeof window === 'undefined' || window.innerWidth >= 768)) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoiceInput = () => {
    if (!speechRecRef.current) return;
    audioSynth.playClick('zap');
    if (isListening) {
      speechRecRef.current.stop();
      setIsListening(false);
    } else {
      try {
        speechRecRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleCopy = (id: string, text: string) => {
    audioSynth.playClick('spark');
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
      } else {
        fallbackCopy(text);
      }
    } catch {
      fallbackCopy(text);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fallbackCopy = (text: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    } catch {}
  };

  const toggleSound = () => {
    audioSynth.playClick('pop');
    const playing = audioSynth.toggleMusic();
    setIsMusicPlaying(playing);
  };

  const toggleMute = () => {
    audioSynth.playClick('snap');
    const muted = audioSynth.toggleMute();
    setIsMuted(muted);
  };

  const handleClearChat = () => {
    audioSynth.playClick('bass');
    if (window.confirm('Wipe current chat buffer and start fresh?')) {
      setMessages([
        {
          id: `sys_${Date.now()}`,
          role: 'model',
          content: `[BUFFER WIPED] Clean slate, homie. REBELL is fired up and ready. Shoutout to VoidRebellion! What's next?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const currentModeObj = CASUAL_MODES.find((m) => m.id === activePersona) || CASUAL_MODES[0];

  const renderFormattedContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const lang = lines[0].trim();
        const code = lines.slice(1).join('\n') || lines[0];

        return (
          <div key={index} className="my-3 rounded-2xl overflow-hidden border border-cyan-700/60 bg-[#070714] text-xs font-cyber-mono shadow-xl">
            <div className="flex items-center justify-between px-4 py-2 bg-black/80 border-b border-cyan-950 text-cyan-300">
              <span className="uppercase text-[11px] tracking-wider text-fuchsia-400 font-bold">{lang || 'CODE'}</span>
              <button
                onClick={() => handleCopy(`code_${index}`, code)}
                className="flex items-center space-x-1.5 text-slate-400 hover:text-cyan-300 transition-colors py-0.5 px-2 rounded-md hover:bg-cyan-950/40"
              >
                {copiedId === `code_${index}` ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-[11px] text-green-400">COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">COPY CODE</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-cyan-100 leading-relaxed selection:bg-fuchsia-600 selection:text-white">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      const lines = part.split('\n');
      return (
        <div key={index} className="space-y-2">
          {lines.map((line, lIdx) => {
            if (line.startsWith('### ')) {
              return (
                <h3 key={lIdx} className="text-base font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-fuchsia-400 pt-2 pb-1">
                  {line.replace('### ', '')}
                </h3>
              );
            }
            if (line.startsWith('## ')) {
              return (
                <h2 key={lIdx} className="text-lg font-bold font-orbitron text-cyan-300 pt-3 pb-1">
                  {line.replace('## ', '')}
                </h2>
              );
            }
            if (line.startsWith('* ') || line.startsWith('- ')) {
              return (
                <li key={lIdx} className="ml-4 list-disc text-slate-100 leading-relaxed">
                  {line.replace(/^(\* |- )/, '')}
                </li>
              );
            }
            if (!line.trim()) {
              return <div key={lIdx} className="h-1" />;
            }
            return (
              <p key={lIdx} className="leading-relaxed">
                {line}
              </p>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="relative h-screen w-full flex flex-col bg-[#030308] text-slate-100 overflow-hidden select-none">
      {/* Dynamic Cyber Spatial Matrix */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.18),transparent_65%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(236,72,153,0.14),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#08081a_1px,transparent_1px),linear-gradient(to_bottom,#08081a_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-40 pointer-events-none" />
      <div className="scanlines absolute inset-0 pointer-events-none opacity-30" />

      {/* 1. Mobile Status Bar (Simulated Native Header) */}
      <div className="relative z-30 w-full px-5 pt-2 pb-1 flex items-center justify-between text-[11px] font-cyber-mono text-slate-400 bg-black/75 backdrop-blur-xl border-b border-cyan-950/40">
        <div className="flex items-center space-x-1.5 font-bold text-slate-200">
          <span>{currentTime || '12:00'}</span>
        </div>

        <div className="flex items-center space-x-2 text-[10px] text-fuchsia-400">
          <span className="font-extrabold tracking-wider">⚡ VOIDREBELLION OS</span>
          <Wifi className="w-3 h-3 text-cyan-400" />
          <Battery className="w-3.5 h-3.5 text-cyan-300" />
        </div>
      </div>

      {/* 2. Main Mobile Navigation Bar */}
      <header className="relative z-30 w-full px-4 py-2.5 bg-black/70 backdrop-blur-2xl border-b border-cyan-950/80 flex items-center justify-between">
        {/* App Title & Insane Rebell Logo */}
        <div className="flex items-center space-x-2.5">
          <div
            onClick={() => audioSynth.playClick('warp')}
            className="cursor-pointer transform hover:scale-105 active:scale-90 transition-transform"
          >
            <RebellLogo size="sm" />
          </div>

          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-orbitron font-black text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-pink-500 glow-cyan">
                REBELL
              </span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            </div>
            <div className="text-[9px] font-cyber-mono text-fuchsia-400 font-extrabold tracking-wider flex items-center space-x-1">
              <Flame className="w-3 h-3 text-yellow-400 inline" />
              <span>BY VOIDREBELLION</span>
            </div>
          </div>
        </div>

        {/* Action Controls with Dynamic Click Acoustics */}
        <div className="flex items-center space-x-2">
          {/* Mode Selector Pill */}
          <button
            onClick={() => {
              audioSynth.playClick('zap');
              setShowModeModal(true);
            }}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-full border border-fuchsia-600/60 bg-fuchsia-950/40 text-fuchsia-300 text-xs font-cyber-mono transition-all hover:border-fuchsia-400 active:scale-90 shadow-[0_0_10px_rgba(236,72,153,0.3)]"
          >
            <currentModeObj.icon className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden sm:inline font-bold">{currentModeObj.name}</span>
            <ChevronDown className="w-3 h-3 text-cyan-400" />
          </button>

          {/* Synth Audio Toggle */}
          <button
            onClick={toggleSound}
            title={isMusicPlaying ? 'Mute Cyber Beats' : 'Play Cyber Beats'}
            className={`p-2 rounded-full border text-xs font-cyber-mono transition-all active:scale-90 ${
              isMusicPlaying
                ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300 glow-box-cyan'
                : 'border-slate-800 bg-slate-900/60 text-slate-500'
            }`}
          >
            {isMusicPlaying ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Replay 5s Cinematic Intro */}
          <button
            onClick={() => {
              audioSynth.playClick('warp');
              onReplayIntro();
            }}
            title="Replay 5s Cinematic Intro"
            className="p-2 rounded-full border border-slate-800 bg-slate-950/80 text-slate-300 hover:text-cyan-300 active:scale-90 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Wipe Chat */}
          <button
            onClick={handleClearChat}
            title="Clear Chat Logs"
            className="p-2 rounded-full border border-slate-800 bg-slate-950/80 text-slate-400 hover:text-rose-400 active:scale-90 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 3. Main Message Feed (Fluid Mobile Touch Scroll) */}
      <main className="relative z-10 flex-1 overflow-y-auto px-4 py-4 max-w-3xl mx-auto w-full space-y-4 overscroll-contain">
        {messages.map((m) => {
          const isUser = m.role === 'user';

          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} transition-all`}
            >
              {/* Header meta */}
              <div className="flex items-center space-x-2 mb-1 px-1 text-[10px] font-cyber-mono text-slate-400">
                {isUser ? (
                  <>
                    <span className="text-cyan-300 font-bold">YOU</span>
                    <span>•</span>
                    <span>{m.timestamp}</span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center space-x-1 text-cyan-400 font-black">
                      <Zap className="w-3 h-3 text-cyan-400" />
                      <span>REBELL</span>
                    </span>
                    <span>•</span>
                    <span className="text-fuchsia-400 font-extrabold">VOIDREBELLION</span>
                    <span>•</span>
                    <span>{m.timestamp}</span>
                  </>
                )}
              </div>

              {/* Message Bubble Card */}
              <div
                className={`relative group max-w-[94%] sm:max-w-[85%] rounded-3xl p-4 sm:p-5 text-sm sm:text-base leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-br from-cyan-900/90 to-slate-900 border border-cyan-400/50 text-white shadow-xl'
                    : 'bg-[#060613]/95 border-2 border-cyan-800/80 text-slate-100 shadow-2xl backdrop-blur-xl glow-box-cyan'
                }`}
              >
                <div className="select-text space-y-2">{renderFormattedContent(m.content)}</div>

                {/* Card Footer Actions */}
                <div className="mt-3 pt-2 border-t border-cyan-950/80 flex items-center justify-between text-[10px] text-slate-400 font-cyber-mono">
                  <span className="flex items-center space-x-1">
                    <Flame className="w-3 h-3 text-fuchsia-400" />
                    <span>{isUser ? 'ENCRYPTED TRANSMISSION' : 'POWERED BY VOIDREBELLION & GEMINI'}</span>
                  </span>
                  <button
                    onClick={() => handleCopy(m.id, m.content)}
                    className="flex items-center space-x-1 hover:text-cyan-300 transition-colors py-1 px-2 rounded-lg bg-black/60 border border-slate-800 active:scale-95"
                  >
                    {copiedId === m.id ? (
                      <>
                        <Check className="w-3 h-3 text-green-400" />
                        <span className="text-green-400 font-bold">COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>COPY</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Processing Indicator */}
        {isLoading && (
          <div className="flex flex-col items-start space-y-1">
            <div className="flex items-center space-x-2 px-1 text-[10px] font-cyber-mono text-cyan-400">
              <Zap className="w-3 h-3 animate-spin" />
              <span>REBELL IS COOKING A REPLY...</span>
            </div>
            <div className="rounded-2xl px-4 py-3 bg-black/90 border border-fuchsia-500/60 glow-box-magenta flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2.5 h-2.5 rounded-full bg-fuchsia-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-xs font-cyber-mono text-fuchsia-300 font-bold ml-2">Channeling VoidRebellion intelligence...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* 4. Casual & Fun Prompt Starters */}
      {messages.length <= 3 && !isLoading && (
        <div className="relative z-20 px-4 py-1.5 max-w-3xl mx-auto w-full">
          <div className="text-[10px] font-cyber-mono text-slate-400 mb-1.5 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span className="font-bold">TRY ASKING:</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CASUAL_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => {
                  audioSynth.playClick('pop');
                  handleSend(prompt);
                }}
                className="whitespace-nowrap px-3.5 py-1.5 rounded-full border border-cyan-800/80 bg-cyan-950/30 text-xs text-cyan-200 hover:border-cyan-400 hover:text-white transition-all shrink-0 active:scale-95"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Mobile Bottom Input Dock */}
      <footer className="relative z-30 w-full px-4 pt-2 pb-safe bg-black/90 backdrop-blur-2xl border-t border-cyan-950">
        <div className="max-w-3xl mx-auto w-full pb-2">
          <div className="relative flex items-center rounded-3xl border-2 border-cyan-800/70 bg-[#08081a] focus-within:border-cyan-400 focus-within:glow-box-cyan transition-all shadow-2xl">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Chat with Rebell... (Ask anything, no limits!)"
              className="w-full resize-none bg-transparent px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none max-h-28 overflow-y-auto"
            />

            <div className="flex items-center space-x-1.5 pr-2.5 shrink-0">
              {/* Voice recognition */}
              {recognitionSupported && (
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  title={isListening ? 'Listening...' : 'Voice Input'}
                  className={`p-2.5 rounded-full transition-all active:scale-90 ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'text-slate-400 hover:text-cyan-300'
                  }`}
                >
                  {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
              )}

              {/* Transmit button */}
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="p-3 rounded-full font-orbitron font-bold text-xs text-black bg-gradient-to-r from-cyan-400 via-yellow-300 to-fuchsia-400 hover:from-cyan-300 hover:to-fuchsia-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(6,182,212,0.6)] active:scale-90 transition-all flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-1.5 px-2 text-[9px] font-cyber-mono text-slate-400 font-semibold">
            <span className="text-fuchsia-400">⚡ DEVELOPED BY VOIDREBELLION</span>
            <span>MULTI-TOUCH ARCS • SOUND ENGINE ON</span>
          </div>
        </div>
      </footer>

      {/* 6. Mode Drawer Modal */}
      {showModeModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#090919] border-2 border-cyan-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-cyan-950 pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span className="font-orbitron font-bold text-sm text-cyan-300">
                  CHOOSE REBELL VIBE
                </span>
              </div>
              <button
                onClick={() => {
                  audioSynth.playClick('pop');
                  setShowModeModal(false);
                }}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {CASUAL_MODES.map((m) => {
                const Icon = m.icon;
                const isSelected = activePersona === m.id;

                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      audioSynth.playClick('snap');
                      setActivePersona(m.id);
                      setShowModeModal(false);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start space-x-3 active:scale-95 ${
                      isSelected
                        ? 'border-fuchsia-400 bg-fuchsia-950/50 shadow-[0_0_20px_rgba(236,72,153,0.35)]'
                        : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-fuchsia-500 text-white' : 'bg-slate-800 text-cyan-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-orbitron font-bold text-xs text-slate-100">{m.name}</div>
                      <div className="text-[11px] font-cyber-mono text-slate-400 mt-0.5">{m.subtitle}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-fuchsia-400 mt-1" />}
                  </button>
                );
              })}
            </div>

            <div className="text-center pt-2 text-[10px] font-cyber-mono text-fuchsia-400 font-bold">
              ⚡ CRAFTED WITH ZERO COMPROMISES BY VOIDREBELLION
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
