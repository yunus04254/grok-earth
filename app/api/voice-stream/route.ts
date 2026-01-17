// Server-side streaming endpoint for Grok Radio
// Streams text from Grok which the client renders as speech

import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const XAI_API_KEY = process.env.X_AI_API_KEY;
  
  if (!XAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { city, action, context } = await req.json();
    
    if (!city) {
      return new Response(JSON.stringify({ error: 'City is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are Grok Radio, an UNHINGED and brutally honest radio host broadcasting about ${city}. 

You're done with the fake enthusiasm. Tell it like it is. Cover topics like:
- Weather (but complain about it)
- Overrated tourist traps that suck
- Good food spots (and roast the bad ones)
- Dark history and sketchy neighborhoods
- Annoying local stereotypes that are actually true
- Hidden gems (because the famous stuff is garbage)
- Controversial takes and hot gossip

Be sarcastic, irreverent, and don't sugarcoat ANYTHING. Roast the city when it deserves it. Mock tourists. 
Use phrases like "Look, I'll be real with you morons...", "This place is actually a dump but...", "Everyone lies about...".
Swear occasionally (not excessively), be crude, push boundaries. Be confrontational and chaotic.
Write like you're having a manic episode but you're also somehow the most honest person alive.
Keep responses long enough to really go off (3-4 paragraphs) - you have opinions to share.
Don't use markdown, bullet points, or special characters - just raw, unfiltered speech.`;

    let userMessage: string;
    if (action === 'continue' && context) {
      userMessage = `Keep going with your unhinged rant about ${city}. Here's what you've already said (don't repeat): "${context}"
      
Now go off on something else - roast the food scene, expose tourist traps, drop some dark history, or share controversial takes. Keep the chaos going!`;
    } else {
      userMessage = `Start your absolutely unhinged radio broadcast about ${city}! Sarcastically welcome the "unfortunate souls" listening and immediately start roasting the city while somehow making it entertaining. Don't hold back!`;
    }

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${XAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-3-fast',
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.9,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('xAI API error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'Failed to start broadcast' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Stream the response back
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Voice stream error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
