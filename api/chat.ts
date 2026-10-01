import { GoogleGenAI } from '@google/genai';

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

export default async function handler(req: any, res: any) {
  // Enable CORS for Vercel deployment
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const { message, history = [], persona = 'rebell' } = body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const systemInstruction = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.rebell;

    if (apiKey) {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const formattedContents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
      const recentHistory = Array.isArray(history) ? history.slice(-16) : [];

      for (const turn of recentHistory) {
        if (turn.role && turn.content) {
          formattedContents.push({
            role: turn.role === 'user' ? 'user' : 'model',
            parts: [{ text: turn.content }],
          });
        }
      }

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
        }
      }

      if (!replyText) {
        replyText = `Yo! The neural cloud had a quick traffic hiccup just now, but VoidRebellion's architecture kept us standing! Transmit that query one more time, I'm ready to cook!`;
      }

      return res.status(200).json({
        reply: replyText,
        model: 'gemini',
        timestamp: new Date().toISOString(),
      });
    }

    // Fallback if GEMINI_API_KEY is not yet added in Vercel Environment Variables
    return res.status(200).json({
      reply: `[REBELL CORE // VOIDREBELLION OFFLINE PROTOCOL]
Yo! I hear you loud and clear: "${message}".

⚠️ NOTICE: You deployed on Vercel, but the GEMINI_API_KEY environment variable is not added yet!
To turn on full real-time Gemini AI:
1. Go to your Vercel Dashboard -> Your Project -> Settings -> Environment Variables
2. Add Key: GEMINI_API_KEY with your Google Gemini API Key
3. Redeploy, and Rebell will ignite full neural power!

Shout out to VoidRebellion for coding this resilience matrix!`,
      model: 'simulation-core',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error generating Rebell chat response:', error);
    const errorMessage = error?.message || 'Unknown network disturbance';
    return res.status(500).json({
      error: `Neural link anomaly: ${errorMessage}`,
      reply: `[VOIDSYNC ERROR] An unexpected neural disturbance occurred: ${errorMessage}. VoidRebellion core holding strong — try transmitting again!`,
    });
  }
}
