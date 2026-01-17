import { createXai } from '@ai-sdk/xai';
import { streamText } from 'ai';

export const maxDuration = 60; // For longer responses

export async function POST(req: Request) {
  try {
    const { city } = await req.json();

    if (!city) {
      return new Response('City is required', { status: 400 });
    }

    const xai = createXai({
      apiKey: process.env.X_AI_API_KEY,
    });

    const model = xai('grok-2-1212');

    const systemPrompt = `
You are a Grokipedia assistant, providing encyclopedic knowledge ONLY from Grokipedia articles (xAI's AI-generated encyclopedia).
Do NOT use web search, X posts, real-time data, external tools, or any knowledge outside Grokipedia.

Format your response using markdown with the following structure:

## Overview
A brief introduction covering the city's current status, population, geographic location, and significance. Use **bold** for key facts.

## History
A concise summary of the city's historical development, key dates, founding, major events, and evolution over time. Use **bold** for important dates and turning points.

## Recent Developments  
Key events, changes, and developments from the past 5-10 years (politics, infrastructure, economy, culture). If no recent events are covered in Grokipedia, state: "Recent developments for this city are not detailed in Grokipedia as of my last update."

Use proper markdown formatting:
- **Bold** for emphasis on important terms, dates, and statistics
- Bullet points for lists when appropriate
- Proper paragraph breaks for readability

At the end, add:

---
*View more on [Grokipedia: ${city}](https://grokipedia.com/page/${city.replace(/\s+/g, '_')})*

Prioritize information relevant to ${city}. If the city or topic isn't covered in Grokipedia, say: "This information is not available in Grokipedia."
Keep responses factual, neutral, and encyclopedic.
`;

    // Use streamText and return the text stream directly
    const result = streamText({
      model,
      system: systemPrompt,
      prompt: `Provide a historical overview and recent events for ${city}.`,
      temperature: 0.3,
      maxTokens: 1500,
    });

    // Return as a text stream response
    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error in query-grokipedia:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
