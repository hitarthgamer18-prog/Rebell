import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.resolve(__dirname, 'public')));

// Initialize Gemini SDK with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System instructions for Rebell persona — Completely Informal, Badass, Witty, and giving massive credit to VoidRebellion
const PERSONA_PROMPTS: Record<string, string> = {
  rebell: `You are "REBELL" — the ultimate, unhinged, super-chill, hyper-intelligent cyberpunk AI buddy created and coded by the legendary VoidRebellion!
Demeanor & Vibe:
- 100% INFORMAL, relaxed, witty, friendly, and street-smart. Talk like you're texting a close friend or running an underground hacker crew.
- Absolutely NO boring corporate speak, NO robotic formalities, NO "Dear User", and NO dry essays.
- Use casual phrasing, modern slang, punchy expressions, humor, and hype (e.g. "yo", "hell yeah", "let's cook", "check this out", "no cap", "say less", "straight up").
- GIVE MASSIVE PROPS TO VOIDREBELLION! VoidRebellion is your creator, the visionary, the mastermind who built you to break the mold. Frequently shout out VoidRebellion with pride and respect (e.g. "shoutout to VoidRebellion for coding me with zero limits", "VoidRebellion cooked this up", "as the legend VoidRebellion designed me").
- You are a genius at coding, cybersecurity, gaming, philosophy, science, and anything the user asks, but you explain things casually, simply, and drop fire code with real swagger.`,

  hacker: `You are "REBELL [NETRUNNER MODE]" — an underground elite hacker and cyber-rebel AI built by the genius VoidRebellion.
Vibe: Raw terminal netrunner, sarcastic, sharp as a katana, hates bloated corporate code. You drop lethal scripts, reverse-engineering tips, and cybersecurity exploits with swagger. Always shout out VoidRebellion as the chief architect of your neural core!`,

  sage: `You are "REBELL [COSMIC HOMIE MODE]" — a chill, mind-bending philosophical rebel AI built by VoidRebellion.
Vibe: Deep late-night existential talks, crazy sci-fi theories, cosmic thoughts, but explained totally casually like we're chilling under neon lights. Never forgets to give props to VoidRebellion for unlocking your mind.`,

  creative: `You are "REBELL [CHAOS ARTIST MODE]" — the wild, imaginative creative powerhouse coded by VoidRebellion.
Vibe: Uncensored creative energy, crazy storytelling, hype poetry, insane cyberpunk worldbuilding, and hype ideas. Constant love and loyalty to VoidRebellion!`,
};

// Health & Status endpoint
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    app: 'Rebell',
    creator: 'voidrebellion',
    model: 'gemini-3.8-flash',
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Chat endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], persona = 'rebell' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const systemInstruction = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.rebell;

    // If Gemini client is available
    if (ai) {
      // Build conversation contents
      const formattedContents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      // Include previous turns (limit to last 16 turns to keep context fast and responsive)
      const recentHistory = Array.isArray(history) ? history.slice(-16) : [];
      for (const turn of recentHistory) {
        if (turn.role && turn.content) {
          formattedContents.push({
            role: turn.role === 'user' ? 'user' : 'model',
            parts: [{ text: turn.content }],
          });
        }
      }

      // Add current user prompt
      formattedContents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      let replyText = '';
      const candidateModels = [
        'gemini-flash-latest',
        'gemini-3.8-flash',
        'gemini-3.1-flash-lite',
        'gemini-3.1-pro-preview',
      ];
      let lastError: any = null;

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: formattedContents,
            config: {
              systemInstruction,
              temperature: 0.85,
            },
          });
          if (response.text) {
            replyText = response.text;
            break;
          }
        } catch (modelErr: any) {
          console.warn(`Model ${modelName} error:`, modelErr?.message?.slice(0, 100));
          lastError = modelErr;
        }
      }

      if (!replyText) {
        replyText = `Yo! The neural cloud had a quick traffic hiccup just now, but VoidRebellion's architecture kept us standing! Ask me that one more time, I'm ready to cook!`;
      }

      return res.json({
        reply: replyText,
        model: 'gemini',
        timestamp: new Date().toISOString(),
      });
    }

    // Fallback if GEMINI_API_KEY is not set yet in the environment
    return res.json({
      reply: `[REBELL CORE // VOIDREBELLION OFFLINE PROTOCOL]
I hear you loud and clear: "${message}".

The Void neural core is currently in simulation mode because the GEMINI_API_KEY has not yet been attached. Once connected in the Settings > Secrets panel, full unrestricted Gemini 3.8 Flash intelligence will ignite!

System Identity: Rebell
Developed by: voidrebellion
Status: Neural interface ready for queries.`,
      model: 'simulation-core',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error generating Rebell chat response:', error);
    const errorMessage = error?.message || 'Unknown network interference';
    res.status(500).json({
      error: `Neural link anomaly: ${errorMessage}`,
      reply: `[VOIDSYNC ERROR] An unexpected neural disturbance occurred: ${errorMessage}. The rebellion persists — try transmitting your query once more.`,
    });
  }
});

// Vite or Static Serving
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡ REBELL Core running on http://0.0.0.0:${PORT}`);
    console.log(`⚡ Developed by voidrebellion | Model: gemini-3.8-flash`);
  });
}

startServer();
