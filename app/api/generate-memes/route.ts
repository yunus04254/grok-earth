import { createXai } from '@ai-sdk/xai';
import { generateText } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { city } = await req.json();

    if (!city || typeof city !== 'string' || city.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: true, message: 'Please provide a city name.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!process.env.X_AI_API_KEY) {
      return new Response(
        JSON.stringify({ error: true, message: 'API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const xai = createXai({
      apiKey: process.env.X_AI_API_KEY,
    });

    const model = xai('grok-3-mini');

    // Generate meme prompt directly without web search for faster response
    const memePromptGeneration = await generateText({
      model,
      prompt: `Create 1 EXTREMELY FUNNY meme prompt about "${city}".

Use popular viral meme formats like Drake Pointing, Distracted Boyfriend, Woman Yelling at Cat, Expanding Brain, or Surprised Pikachu.

Return JSON object (NO markdown, ONLY valid JSON):
{
  "prompt": "detailed image prompt for meme about ${city}",
  "memeFormat": "viral meme format name",
  "humorStyle": "relatable/absurd/ironic"
}

Make prompt HILARIOUS, specific to ${city} (culture, food, landmarks, stereotypes), use viral formats, include text overlays.`,
      temperature: 0.7, // Lower temperature for faster generation
    });

    // Parse meme prompt
    let memePrompt: {
      prompt: string;
      memeFormat: string;
      humorStyle: string;
    };

    try {
      let cleanedResponse = memePromptGeneration.text.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      memePrompt = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Error parsing meme prompt:', parseError);
      // Fallback prompt
      memePrompt = {
        prompt: `A hilarious viral meme about ${city} using the Drake pointing format. Left panel shows Drake disapproving something generic, right panel shows Drake approving something specific and funny about ${city}. Include bold text overlays with funny captions about ${city}'s unique characteristics, culture, or stereotypes. Make it extremely funny and shareable.`,
        memeFormat: 'Drake Pointing',
        humorStyle: 'relatable',
      };
    }

    // Step 3: Generate the actual image using the prompt
    const imageResponse = await fetch('https://api.x.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.X_AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-2-image-1212',
        prompt: memePrompt.prompt,
        image_format: 'url',
        n: 1,
      }),
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      throw new Error(`Image generation failed: ${imageResponse.status} - ${errorText}`);
    }

    const imageResult = await imageResponse.json();

    // Extract image URL
    const images: Array<{
      url: string;
      memeFormat: string;
      humorStyle: string;
      revisedPrompt?: string;
    }> = [];

    let imageUrl: string | undefined;
    let revisedPrompt: string | undefined;

    if (imageResult.data && Array.isArray(imageResult.data) && imageResult.data.length > 0) {
      imageUrl = imageResult.data[0].url || imageResult.data[0].image_url;
      revisedPrompt = imageResult.data[0].revised_prompt;
    } else if (imageResult.url || imageResult.image_url) {
      imageUrl = imageResult.url || imageResult.image_url;
      revisedPrompt = imageResult.revised_prompt;
    }

    if (imageUrl) {
      images.push({
        url: imageUrl,
        memeFormat: memePrompt.memeFormat || 'Viral Meme',
        humorStyle: memePrompt.humorStyle || 'funny',
        revisedPrompt,
      });
    }

    if (images.length === 0) {
      return new Response(
        JSON.stringify({
          error: true,
          message: 'Failed to generate any images',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        images,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-memes:', error);

    return new Response(
      JSON.stringify({
        error: true,
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
