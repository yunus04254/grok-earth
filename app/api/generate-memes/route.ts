import { createXai, XaiProviderOptions } from '@ai-sdk/xai';
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

    // Combined step: Search for viral memes AND generate location-specific prompts in one call
    const memePromptGeneration = await generateText({
      model,
      prompt: `Search for current viral meme formats trending worldwide (2025), then create 1 EXTREMELY FUNNY meme prompt about "${city}".

Use current viral meme formats like Drake Pointing, Distracted Boyfriend, Woman Yelling at Cat, Expanding Brain, Surprised Pikachu, or other trending formats.

Return JSON object (NO markdown, ONLY valid JSON):
{
  "prompt": "detailed image prompt for meme about ${city}",
  "memeFormat": "viral meme format name",
  "humorStyle": "relatable/absurd/ironic"
}

Make prompt HILARIOUS, specific to ${city} (culture, food, landmarks, stereotypes), use viral formats, include text overlays.`,
      providerOptions: {
        xai: {
          searchParameters: {
            mode: 'on',
            returnCitations: false, // Faster without citations
            sources: [{ type: 'web' }],
          },
        } satisfies XaiProviderOptions,
      },
      temperature: 0.8, // Slightly higher for more creativity
      maxTokens: 800, // Limit tokens for faster response
    });

    // Parse meme prompt
    let memePrompt: {
      prompt: string;
      memeFormat: string;
      humorStyle: string;
    } | null = null;

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

    if (!memePrompt) {
      throw new Error('Failed to generate meme prompt');
    }

    // Generate the actual image
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
    let imageUrl: string | undefined;
    let revisedPrompt: string | undefined;

    if (imageResult.data && Array.isArray(imageResult.data) && imageResult.data.length > 0) {
      imageUrl = imageResult.data[0].url || imageResult.data[0].image_url;
      revisedPrompt = imageResult.data[0].revised_prompt;
    } else if (imageResult.url || imageResult.image_url) {
      imageUrl = imageResult.url || imageResult.image_url;
      revisedPrompt = imageResult.revised_prompt;
    }

    if (!imageUrl) {
      throw new Error('Failed to extract image URL from response');
    }

    const images = [{
      url: imageUrl,
      memeFormat: memePrompt.memeFormat || 'Viral Meme',
      humorStyle: memePrompt.humorStyle || 'funny',
      revisedPrompt,
    }];

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
