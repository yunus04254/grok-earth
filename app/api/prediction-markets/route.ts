import { createXai, XaiProviderOptions } from '@ai-sdk/xai';
import { generateText } from 'ai';

export const maxDuration = 60;

// Helper to safely convert to number
function toNumber(value: unknown, fallback: number = 0): number {
  if (value === undefined || value === null) return fallback;
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  return isNaN(num) ? fallback : num;
}

interface PolymarketTag {
  id: string;
  slug: string;
  label: string;
}

interface PolymarketEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  volume: number;
  liquidity: number;
  active: boolean;
  closed: boolean;
  markets: PolymarketMarket[];
}

interface PolymarketMarket {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  outcomes: string;
  outcomePrices: string;
  volume: number;
  liquidity: number;
  active: boolean;
  closed: boolean;
}

interface ParsedMarket {
  id: string;
  question: string;
  outcomes: string[];
  prices: number[];
  volume: number;
  liquidity: number;
  slug: string;
  url: string;
}

export async function POST(req: Request) {
  try {
    const { location } = await req.json();

    if (!location) {
      return new Response(JSON.stringify({ error: 'Location is required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const xai = createXai({
      apiKey: process.env.X_AI_API_KEY,
    });

    const model = xai('grok-3-mini');

    // Step 1: Use Grok with live search to find relevant search terms and Polymarket event slugs
    const searchResult = await generateText({
      model,
      prompt: `I need to find Polymarket prediction markets related to "${location}".

Search polymarket.com for active prediction markets about:
1. The country/region this location is in (e.g., if "${location}" is a city, find the country)
2. Political events (elections, referendums, government actions) in that region
3. Sports teams based in or near "${location}" (NFL, NBA, Premier League, La Liga, etc.)
4. Economic events or policies affecting that region
5. Any major events or news specific to "${location}"

Return a JSON object with this EXACT format (NO markdown, NO explanation, ONLY valid JSON):
{
  "country": "the country name",
  "region": "broader region like Europe, Asia, Middle East, etc.",
  "searchTerms": ["term1", "term2", "term3"],
  "eventSlugs": ["slug-from-polymarket-url-1", "slug-2"],
  "sportTeams": ["team1", "team2"],
  "relevantTopics": ["topic1", "topic2"]
}

For eventSlugs, extract from URLs like polymarket.com/event/[slug].
Include 5-10 search terms and any event slugs you find.`,
      providerOptions: {
        xai: {
          searchParameters: {
            mode: 'on',
            returnCitations: true,
            sources: [{ type: 'web' }],
          },
        } satisfies XaiProviderOptions,
      },
    });

    // Parse Grok's response
    let searchData: {
      country?: string;
      region?: string;
      searchTerms?: string[];
      eventSlugs?: string[];
      sportTeams?: string[];
      relevantTopics?: string[];
    } = {};

    try {
      let cleanedResponse = searchResult.text.trim();
      
      // Remove markdown code blocks if present
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/\n?```/g, '');
      
      // Find the JSON object - look for first { and last }
      const firstBrace = cleanedResponse.indexOf('{');
      const lastBrace = cleanedResponse.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanedResponse = cleanedResponse.substring(firstBrace, lastBrace + 1);
      }
      
      searchData = JSON.parse(cleanedResponse);
    } catch (e) {
      console.error('Failed to parse Grok response:', searchResult.text, e);
      // Fallback: use the location directly
      searchData = {
        country: location,
        searchTerms: [location],
        eventSlugs: [],
        sportTeams: [],
        relevantTopics: []
      };
    }

    const allMarkets: ParsedMarket[] = [];
    const seenIds = new Set<string>();

    // Step 2: Fetch Polymarket tags and find relevant ones
    const relevantTagIds: string[] = [];
    try {
      const tagsResponse = await fetch('https://gamma-api.polymarket.com/tags', {
        headers: { 'Accept': 'application/json' }
      });
      
      if (tagsResponse.ok) {
        const tags: PolymarketTag[] = await tagsResponse.json();
        const searchTermsLower = [
          location.toLowerCase(),
          searchData.country?.toLowerCase(),
          searchData.region?.toLowerCase(),
          ...(searchData.searchTerms || []).map(t => t.toLowerCase()),
          ...(searchData.sportTeams || []).map(t => t.toLowerCase()),
          ...(searchData.relevantTopics || []).map(t => t.toLowerCase())
        ].filter(Boolean);

        // Find matching tags
        for (const tag of tags) {
          const labelLower = tag.label?.toLowerCase() || '';
          const slugLower = tag.slug?.toLowerCase() || '';
          
          for (const term of searchTermsLower) {
            if (term && (labelLower.includes(term) || slugLower.includes(term) || 
                term.includes(labelLower) || term.includes(slugLower))) {
              relevantTagIds.push(tag.id);
              break;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }

    // Step 3: Fetch events by tag IDs
    for (const tagId of relevantTagIds.slice(0, 5)) {
      try {
        const response = await fetch(
          `https://gamma-api.polymarket.com/events?tag_id=${tagId}&closed=false&active=true&_limit=10`,
          { headers: { 'Accept': 'application/json' } }
        );

        if (response.ok) {
          const events: PolymarketEvent[] = await response.json();
          processEvents(events, allMarkets, seenIds);
        }
      } catch (error) {
        console.error(`Error fetching events for tag ${tagId}:`, error);
      }
    }

    // Step 4: Fetch events by slugs from Grok's search
    for (const slug of (searchData.eventSlugs || []).slice(0, 10)) {
      if (!slug) continue;
      try {
        const response = await fetch(
          `https://gamma-api.polymarket.com/events?slug=${encodeURIComponent(slug)}&closed=false`,
          { headers: { 'Accept': 'application/json' } }
        );

        if (response.ok) {
          const events: PolymarketEvent[] = await response.json();
          processEvents(events, allMarkets, seenIds);
        }
      } catch (error) {
        console.error(`Error fetching event slug ${slug}:`, error);
      }
    }

    // Step 5: Text search for each search term
    const searchTerms = [
      location,
      searchData.country,
      ...(searchData.searchTerms || []).slice(0, 3),
      ...(searchData.sportTeams || []).slice(0, 2)
    ].filter(Boolean) as string[];

    for (const term of searchTerms.slice(0, 5)) {
      try {
        // Try title_contains search
        const response = await fetch(
          `https://gamma-api.polymarket.com/events?closed=false&active=true&_limit=15&title_contains=${encodeURIComponent(term)}`,
          { headers: { 'Accept': 'application/json' } }
        );

        if (response.ok) {
          const events: PolymarketEvent[] = await response.json();
          processEvents(events, allMarkets, seenIds);
        }
      } catch (error) {
        console.error(`Error searching for term "${term}":`, error);
      }
    }

    // Step 6: If still no results, do a broader search
    if (allMarkets.length === 0) {
      try {
        const response = await fetch(
          `https://gamma-api.polymarket.com/events?closed=false&active=true&_limit=50`,
          { headers: { 'Accept': 'application/json' } }
        );

        if (response.ok) {
          const events: PolymarketEvent[] = await response.json();
          const locationLower = location.toLowerCase();
          const countryLower = searchData.country?.toLowerCase() || '';
          
          // Filter events that might be relevant
          const relevantEvents = events.filter(event => {
            const titleLower = (event.title || '').toLowerCase();
            const descLower = (event.description || '').toLowerCase();
            
            return titleLower.includes(locationLower) || 
                   descLower.includes(locationLower) ||
                   (countryLower && (titleLower.includes(countryLower) || descLower.includes(countryLower))) ||
                   searchTerms.some(term => 
                     titleLower.includes(term.toLowerCase()) || 
                     descLower.includes(term.toLowerCase())
                   );
          });
          
          processEvents(relevantEvents, allMarkets, seenIds);
        }
      } catch (error) {
        console.error('Error in broad search:', error);
      }
    }

    // Sort by volume and limit results
    allMarkets.sort((a, b) => toNumber(b.volume) - toNumber(a.volume));
    const topMarkets = allMarkets.slice(0, 15);

    // Generate AI summary
    let aiSummary = '';
    if (topMarkets.length > 0) {
      const marketsContext = topMarkets.slice(0, 6).map(m => 
        `- "${m.question}" (${m.outcomes[0] || 'Yes'}: ${Math.round(m.prices[0] || 50)}%)`
      ).join('\n');

      const summaryResult = await generateText({
        model,
        system: `You are a prediction market analyst. Provide a brief 2-3 sentence summary about what these prediction markets reveal about the current situation related to the specified location. Focus on the most significant predictions and their implications. Be concise and insightful.`,
        prompt: `Location: ${location}${searchData.country ? ` (${searchData.country})` : ''}\n\nActive prediction markets:\n${marketsContext}\n\nProvide a brief summary of what these markets indicate about this region.`,
        temperature: 0.5,
        maxTokens: 250,
      });

      aiSummary = summaryResult.text;
    } else {
      aiSummary = `No active prediction markets were found for "${location}"${searchData.country ? ` or ${searchData.country}` : ''}. Try searching for a major country name (USA, UK, France), a specific event, or a sports team name.`;
    }

    // Get citations from the search
    const citations = (searchResult as { sources?: { url: string }[] }).sources || [];

    return new Response(JSON.stringify({
      location,
      country: searchData.country,
      region: searchData.region,
      markets: topMarkets,
      summary: aiSummary,
      totalFound: allMarkets.length,
      searchTermsUsed: searchTerms.slice(0, 5),
      tagsFound: relevantTagIds.length,
      citations: citations.map((c: { url: string }) => c.url).filter((url: string) => url.includes('polymarket')),
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in prediction-markets:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Helper function to process events and add markets
function processEvents(
  events: PolymarketEvent[], 
  allMarkets: ParsedMarket[], 
  seenIds: Set<string>
) {
  for (const event of events) {
    if (!event.markets || event.markets.length === 0) continue;
    
    for (const market of event.markets) {
      if (seenIds.has(market.id) || !market.active || market.closed) continue;
      seenIds.add(market.id);

      let outcomes: string[] = [];
      let prices: number[] = [];

      try {
        outcomes = JSON.parse(market.outcomes || '[]');
        prices = JSON.parse(market.outcomePrices || '[]').map((p: string) => parseFloat(p) * 100);
      } catch {
        outcomes = ['Yes', 'No'];
        prices = [50, 50];
      }

      allMarkets.push({
        id: market.id || `market-${Date.now()}-${Math.random()}`,
        question: market.question || event.title,
        outcomes,
        prices,
        volume: toNumber(market.volume) || toNumber(event.volume),
        liquidity: toNumber(market.liquidity) || toNumber(event.liquidity),
        slug: event.slug,
        url: `https://polymarket.com/event/${event.slug}`,
      });
    }
  }
}
