export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt, n = 1 } = await req.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: true, message: 'Please provide a prompt for image generation.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!process.env.X_AI_API_KEY) {
      return new Response(
        JSON.stringify({ error: true, message: 'API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://api.x.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.X_AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-2-image-1212',
        prompt: prompt.trim(),
        image_format: 'url',
        n: Math.min(Math.max(1, n), 3), // Clamp between 1 and 3
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Grok Image API error:', errorText);
      return new Response(
        JSON.stringify({ 
          error: true, 
          message: `Image generation failed: ${response.status}` 
        }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    // Handle different possible response structures
    // xAI API might return data directly or in a data array
    let imageUrls: string[] = [];
    let revisedPrompts: (string | undefined)[] = [];
    
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      imageUrls = data.data.map((item: any) => item.url || item.image_url).filter(Boolean);
      revisedPrompts = data.data.map((item: any) => item.revised_prompt);
    } else if (data.url || data.image_url) {
      imageUrls = [data.url || data.image_url].filter(Boolean);
      revisedPrompts = [data.revised_prompt];
    }
    
    if (imageUrls.length === 0) {
      console.error('Unexpected API response structure:', JSON.stringify(data, null, 2));
      return new Response(
        JSON.stringify({ 
          error: true, 
          message: 'Unexpected response format from image generation API' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Return the image URLs array
    return new Response(
      JSON.stringify({
        success: true,
        imageUrls,
        revisedPrompts,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-image:', error);

    return new Response(
      JSON.stringify({ 
        error: true, 
        message: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
