export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const location = searchParams.get('location') || 'New York City';

    const bearerToken = process.env.X_API_KEY;
    
    if (!bearerToken) {
      return new Response(
        JSON.stringify({ error: 'X API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Search for recent tweets from NYC area
    const query = encodeURIComponent(`${location} -is:retweet lang:en`);
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${query}&max_results=50&tweet.fields=public_metrics,created_at,author_id&expansions=author_id&user.fields=username,profile_image_url`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('X API Error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch tweets', details: errorData }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    // Transform the data to match our TweetList component format
    const tweets = data.data?.map((tweet: any) => {
      const author = data.includes?.users?.find((user: any) => user.id === tweet.author_id);
      return {
        id: tweet.id,
        content: tweet.text,
        handle: `@${author?.username || 'unknown'}`,
        avatar: author?.profile_image_url || 'https://via.placeholder.com/150',
        likes: tweet.public_metrics?.like_count || 0,
        retweets: tweet.public_metrics?.retweet_count || 0,
        createdAt: tweet.created_at,
      };
    }) || [];

    // Sort tweets by engagement (likes + retweets) in descending order
    tweets.sort((a, b) => {
      const engagementA = a.likes + a.retweets;
      const engagementB = b.likes + b.retweets;
      return engagementB - engagementA;
    });

    return new Response(
      JSON.stringify({ tweets }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching tweets:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
