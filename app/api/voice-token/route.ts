// API route to fetch ephemeral tokens for xAI Voice Agent
// Following: https://docs.x.ai/docs/guides/voice/agent

export async function POST(req: Request) {
  try {
    const XAI_API_KEY = process.env.X_AI_API_KEY;
    
    if (!XAI_API_KEY) {
      console.error('X_AI_API_KEY environment variable not set');
      return new Response(
        JSON.stringify({ error: 'X_AI_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching ephemeral token from xAI...');

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
      const errorText = await response.text();
      console.error('xAI API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch token from xAI', 
          details: errorText,
          status: response.status 
        }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Token fetched successfully. Token value length:', data.value?.length);
    
    // Validate the response has the expected structure: { value: "...", expires_at: ... }
    if (!data.value) {
      console.error('Unexpected token response structure:', data);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid token structure from xAI',
          received: data
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
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
