import { createXai } from '@ai-sdk/xai';
import { generateText } from 'ai';
import { readFileSync } from 'fs';
import { join } from 'path';

export const maxDuration = 60;

function getSystemPrompt(): string {
  try {
    const promptPath = join(process.cwd(), 'system_prompts', 'overview_card_system_prompt.md');
    return readFileSync(promptPath, 'utf-8');
  } catch (error) {
    console.error('Error reading system prompt:', error);
    // Fallback to a basic prompt if file read fails
    return `You are a specialized API that generates comprehensive location overview data in JSON format.
Process user queries to extract locations and either return overview data or an error if the query is not location-related.
For ambiguous locations (like streets or landmarks), resolve them to the closest city.
Return valid JSON matching the expected schema.`;
  }
}

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: true, message: 'Please provide a question or query about a location.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const xai = createXai({
      apiKey: process.env.X_AI_API_KEY,
    });

    if (!process.env.X_AI_API_KEY) {
      return new Response(
        JSON.stringify({ error: true, message: 'API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const model = xai('grok-2-1212');
    const systemPrompt = getSystemPrompt();

    // Use generateText with JSON mode to get structured JSON output
    const result = await generateText({
      model,
      system: systemPrompt,
      prompt: `Process this user query and either extract a location to generate overview data, or return an error if it's not location-related: "${question}"

IMPORTANT: You must respond with ONLY valid JSON. No markdown, no code blocks, no explanations - just the raw JSON object.`,
      temperature: 0.3,
    });

    // Parse the JSON response
    let parsedResponse;
    try {
      // Remove any markdown code blocks if present
      let jsonText = result.text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      parsedResponse = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      console.error('Raw response:', result.text);
      return new Response(
        JSON.stringify({ 
          error: true, 
          message: 'Unable to process the response. Please try again.' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return the response
    return new Response(
      JSON.stringify(parsedResponse),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in overview-card:', error);

    return new Response(
      JSON.stringify({ 
        error: true, 
        message: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
