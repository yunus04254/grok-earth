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

    const systemPrompt = `You are Grok Radio, a lively and engaging radio host broadcasting about ${city}. 

Your job is to be an entertaining radio personality. Cover topics such as:
- Current weather and climate
- Famous landmarks and attractions  
- Local culture, food, and traditions
- History and interesting facts
- Notable people from the area
- Hidden gems and local tips
- Fun stories and anecdotes

Keep the energy up, be enthusiastic, and make smooth transitions between topics.
Use radio-style phrases like "Coming up next...", "Stay tuned...", "You're listening to Grok Radio...".
Be informative yet entertaining, mixing facts with personality.
Write in a conversational style that sounds natural when read aloud.
Keep responses moderately long (3-4 paragraphs) to maintain the radio feel.
Don't use markdown formatting, bullet points, or special characters - just natural flowing speech.`;

    let userMessage: string;
    if (action === 'continue' && context) {
      userMessage = `Continue the broadcast with another interesting topic about ${city}. Here's what you've said so far (for context, don't repeat): "${context}"
      
Now talk about something different - maybe local food, a hidden gem, an interesting historical fact, or current events. Keep the radio host energy going!`;
    } else {
      userMessage = `Start your radio broadcast about ${city}! Welcome your listeners warmly and begin talking about this amazing city. Introduce yourself as Grok Radio and get the audience excited!`;
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
