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
      prompt: `Search for current viral meme formats trending worldwide (2025), then create 3 EXTREMELY FUNNY meme prompts about "${city}".

Use current viral meme formats like Drake Pointing, Distracted Boyfriend, Woman Yelling at Cat, Expanding Brain, Surprised Pikachu, or other trending formats.

Return JSON array (NO markdown, ONLY valid JSON):
[
  {
    "prompt": "detailed image prompt for meme 1 about ${city}",
    "memeFormat": "viral meme format name",
    "humorStyle": "relatable/absurd/ironic"
  },
  {
    "prompt": "detailed image prompt for meme 2 about ${city}",
    "memeFormat": "viral meme format name",
    "humorStyle": "relatable/absurd/ironic"
  },
  {
    "prompt": "detailed image prompt for meme 3 about ${city}",
    "memeFormat": "viral meme format name",
    "humorStyle": "relatable/absurd/ironic"
  }
]

Make prompts HILARIOUS, specific to ${city} (culture, food, landmarks, stereotypes), use viral formats, include text overlays.`,
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

    // Parse meme prompts
    let memePrompts: Array<{
      prompt: string;
      memeFormat: string;
      humorStyle: string;
    }> = [];

    try {
      let cleanedResponse = memePromptGeneration.text.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      memePrompts = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Error parsing meme prompts:', parseError);
      // Fallback prompts
      memePrompts = [
        {
          prompt: `A hilarious viral meme about ${city} using the Drake pointing format. Left panel shows Drake disapproving something generic, right panel shows Drake approving something specific and funny about ${city}. Include bold text overlays with funny captions about ${city}'s unique characteristics, culture, or stereotypes. Make it extremely funny and shareable.`,
          memeFormat: 'Drake Pointing',
          humorStyle: 'relatable',
        },
        {
          prompt: `A funny viral meme about ${city} using the Distracted Boyfriend format. Show a person looking away from something normal toward something absurdly specific to ${city}. Include text overlays that are hilarious and reference ${city}'s culture, food, weather, or local quirks. Make it genuinely funny and relatable.`,
          memeFormat: 'Distracted Boyfriend',
          humorStyle: 'ironic',
        },
        {
          prompt: `An absurd and hilarious meme about ${city} using the Woman Yelling at Cat format. Show a dramatic scene with text overlays that are extremely funny and specific to ${city}. Reference local stereotypes, landmarks, or cultural elements in a humorous way. Make it shareable and genuinely amusing.`,
          memeFormat: 'Woman Yelling at Cat',
          humorStyle: 'absurd',
        },
      ];
    }

    // Step 3: Generate the actual images using the prompts
    const imagePromises = memePrompts.map(({ prompt }) =>
      fetch('https://api.x.ai/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.X_AI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'grok-2-image-1212',
          prompt: prompt,
          image_format: 'url',
          n: 1,
        }),
      }).then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Image generation failed: ${res.status} - ${errorText}`);
        }
        return res.json();
      })
    );

    const imageResults = await Promise.all(imagePromises);

    // Extract image URLs
    const images: Array<{
      url: string;
      memeFormat: string;
      humorStyle: string;
      revisedPrompt?: string;
    }> = [];

    imageResults.forEach((result, index) => {
      let imageUrl: string | undefined;
      let revisedPrompt: string | undefined;

      if (result.data && Array.isArray(result.data) && result.data.length > 0) {
        imageUrl = result.data[0].url || result.data[0].image_url;
        revisedPrompt = result.data[0].revised_prompt;
      } else if (result.url || result.image_url) {
        imageUrl = result.url || result.image_url;
        revisedPrompt = result.revised_prompt;
      }

      if (imageUrl) {
        images.push({
          url: imageUrl,
          memeFormat: memePrompts[index]?.memeFormat || 'Viral Meme',
          humorStyle: memePrompts[index]?.humorStyle || 'funny',
          revisedPrompt,
        });
      }
    });

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
