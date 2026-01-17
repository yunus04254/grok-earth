// API route to fetch ephemeral tokens for xAI Voice Agent
// Following: https://docs.x.ai/docs/guides/voice/agent

export async function POST(req: Request) {
  try {
    const XAI_API_KEY = process.env.X_AI_API_KEY;
    
    if (!XAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'X_AI_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://api.x.ai/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${XAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expires_after: { seconds: 300 } // 5 minutes
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('xAI token fetch failed:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch token' }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in voice-token route:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
