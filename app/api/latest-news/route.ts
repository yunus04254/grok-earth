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

    // Use grok-4-1-fast for better search capabilities
    const model = xai('grok-4-1-fast');

    // Calculate date for last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const fromDate = yesterday.toISOString().split('T')[0];

    // Use generateText with search enabled - search will include X/Twitter results
    const result = await generateText({
      model,
      prompt: `Find the latest news and breaking stories about ${city} from the past 24 hours. 
      
Search X (Twitter) and news websites for recent posts, news articles, and updates related to ${city}. Focus on breaking news, major events, and significant updates. Prioritize X/Twitter posts and news articles from the past 24 hours.

Return a JSON array of news stories with this EXACT format (NO markdown, NO explanation, ONLY valid JSON):
[
  {
    "headline": "Brief headline of the news story",
    "summary": "A concise 2-3 sentence summary of the story",
    "url": "URL to the original source/article if available, or X post URL",
    "timestamp": "When the story was posted (e.g., '2 hours ago', 'Today', 'Yesterday')"
  }
]

Include 5-10 of the most relevant and recent news stories. Prioritize breaking news, major events, and significant updates.
If a URL is not available, use the X post URL or set to null.`,
      providerOptions: {
        xai: {
          searchParameters: {
            mode: 'on',
            returnCitations: true,
            sources: [{ type: 'web' }, { type: 'x' }], // Try both web and X search
            fromDate: fromDate, // Last 24 hours
          },
        } satisfies XaiProviderOptions,
      },
      temperature: 0.3,
    });

    // Parse the JSON response
    let newsStories;
    try {
      // Remove any markdown code blocks if present
      let jsonText = result.text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      newsStories = JSON.parse(jsonText);
      
      // Ensure it's an array
      if (!Array.isArray(newsStories)) {
        newsStories = [newsStories];
      }
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      console.error('Raw response:', result.text);
      
      return new Response(
        JSON.stringify({ 
          error: true, 
          message: 'Unable to parse news stories. Please try again.',
          rawResponse: result.text.substring(0, 500) // Include first 500 chars for debugging
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return the news stories
    return new Response(
      JSON.stringify({ 
        stories: newsStories,
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in latest-news:', error);

    return new Response(
      JSON.stringify({ 
        error: true, 
        message: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
