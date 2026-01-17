![Grok Earth](app/assets/GrokEarth.png)
**Mission Control for the planet**
## Mission & Vision
To understand the universe, one must first understand the Earth.

**Themes:**
- **Mission Control** - Centralized command center for global intelligence
- **Know Everything** - Comprehensive information aggregation
- **Seek Everything** - Active exploration and discovery
- **Become Omniscient** - Pursuing xAI's mission of objective truth
- **Understand the Universe** - Deep insights into global events
- **Palantir UI/UX × Starplex** - Enterprise-grade design with futuristic aesthetics
- **LIVE** - Real-time data and updates

<img width="800" height="400" alt="Screenshot 2026-01-17 at 19 41 59" src="https://github.com/user-attachments/assets/d4c2d8ce-2aa2-4ff4-93e4-8950c43bdf47" />


## Features

### Interactive 3D Globe
- **Mapbox-powered 3D globe** with smooth animations and transitions
- **Heatmaps** showing trending areas before focusing on specific regions
- **3D columns** visualizing high-volume hotspots (red zones)
- **Pulsing markers** for active trending locations
- **Automatic fly-to animations** for seamless navigation
- **Double-click to explore** any location on the globe
- **Starlink satellite visualization** (42 satellites as easter eggs)

### Information Cards

#### 🔍 Overview Card
- Weather information
- Location name and basic details
- Current leadership/president
- Quick facts and statistics

#### 📰 Latest News
- Real-time news aggregation for selected regions
- Curated headlines and articles
- Source attribution and timestamps

#### 🐦 Live X Post Feed
- Trending and live X posts in the selected area
- Real-time post updates
- Filterable by region and topic
- Rapidly moving feed under each card when focused

#### 📚 Grokipedia
- In-depth, AI-powered detail of regions and conflicts
- Historical context and background
- Objective truth-focused content
- Comprehensive analysis

#### 🎙️ Grok Radio (Podcast)
- AI voice agent discussing current events
- Voice-powered insights about selected areas
- Real-time audio generation

#### 🎨 Grok Imagine
- AI-generated images related to regions and events
- Visual representations of locations and topics
- Creative visualizations

#### 📈 Prediction Markets
- Local prediction markets (Polymarket API integration)
- Odds and media for geopolitical events
- Market data for controversial regions like Iran, Venezuela, etc.

#### 🛰️ Starlink Satellites
- Interactive 3D satellite visualization
- Click to view satellite details
- Real-time orbital data
- Easter egg: 42 satellites

### User Interface

#### Left Side Panel
- **Filterable card controls** - Toggle visibility of information cards
- **Feature icons** with hover tooltips
- **Active state indicators** - Visual feedback for enabled features
- **Glassmorphism design** - Modern, translucent UI elements

#### Chatbox
- **Bottom-center input** with auto-typing suggestions
- **Natural language queries** - Ask about any location or event
- **Auto-zoom functionality** - Automatically navigates to queried locations
- **Context-aware responses** - Understands geopolitical queries, conflicts, countries, etc.

#### Map Controls
- **Reset view button** - Return to global view
- **Marker key** - Legend explaining map elements
- **Smooth animations** - Fluid transitions between locations

## 🛠️ Technologies

### Core Framework
- **Next.js** - React framework with App Router
- **React 19.2.3** - UI library
- **TypeScript 5** - Type safety

### Mapping & Visualization
- **Mapbox GL JS 3.18.0** - 3D globe and map rendering
- **satellite.js 6.0.2** - Satellite calculations

### UI/UX Libraries
- **shadcn/ui** - Component library
- **Aceternity UI** - Advanced UI components
- **Framer Motion 12.26.2** - Animations
- **Tailwind CSS 4** - Styling
- **Radix UI** - Accessible component primitives

### AI & Data
- **@ai-sdk/xai 3.0.26** - xAI Grok integration
- **@ai-sdk/react 3.0.41** - AI SDK for React
- **ai 6.0.39** - Vercel AI SDK

### Additional Libraries
- **react-markdown 10.1.0** - Markdown rendering
- **lucide-react 0.562.0** - Icons
- **WebSocket (ws 8.18.0)** - Real-time communication

## 📁 Project Structure

```
grok-earth/
├── app/
│   ├── api/                    # API routes
│   │   ├── fetch-tweets/       # X/Twitter data
│   │   ├── generate-image/     # Grok Imagine
│   │   ├── generate-memes/    # Meme generation
│   │   ├── latest-news/        # News aggregation
│   │   ├── overview-card/      # Location overview
│   │   ├── prediction-markets/ # Polymarket integration
│   │   ├── query-grokipedia/   # Grokipedia queries
│   │   ├── satellite-info/     # Starlink data
│   │   ├── trends/             # Trending hotspots
│   │   ├── voice-stream/       # Voice streaming
│   │   └── voice-token/        # Voice token generation
│   ├── components/             # React components
│   │   ├── Globe.tsx           # 3D map component
│   │   ├── SidePanel.tsx       # Left control panel
│   │   ├── OverviewCard.tsx    # Overview information
│   │   ├── Grokipedia.tsx      # Deep insights
│   │   ├── GrokRadio.tsx       # Voice podcast
│   │   ├── PredictionMarkets.tsx # Market data
│   │   ├── GrokImagine.tsx     # Image generation
│   │   ├── LatestNews.tsx      # News feed
│   │   ├── LiveTweetFeed.tsx   # Tweet feed
│   │   ├── StarlinkCard.tsx    # Satellite info
│   │   └── ...
│   ├── hooks/
│   │   └── useStarlink.ts      # Starlink data hook
│   ├── lib/
│   │   ├── types.ts            # TypeScript types
│   │   └── woeid-mapping.ts    # WOEID mappings
│   ├── ClientHome.tsx          # Main client component
│   ├── page.tsx                # Home page
│   └── layout.tsx               # Root layout
├── components/                  # Shared components
│   ├── ui/                     # shadcn components
│   ├── GEButton.tsx
│   ├── GECard.tsx
│   ├── GEInput.tsx
│   ├── GETooltip.tsx
│   ├── GETweetCard.tsx
│   └── TweetList.tsx
├── public/                     # Static assets
│   ├── satellite.glb           # 3D satellite model
│   └── ...
├── system_prompts/             # AI system prompts
│   └── overview_card_system_prompt.md
└── server.js                   # Custom server
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ 
- **npm** or **yarn**
- **Mapbox API Key** - Get one at [mapbox.com](https://www.mapbox.com/)
- **xAI API Key** - For Grok integration
- **Polymarket API Key** (optional) - For prediction markets

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd grok-earth
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   MAPBOX_API_KEY=your_mapbox_api_key
   XAI_API_KEY=your_xai_api_key
   POLYMARKET_API_KEY=your_polymarket_api_key  # Optional
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   
   Or use the custom server:
   ```bash
   npm run dev:next
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 🎮 User Journey Example

1. **User is interested in a geopolitical conflict/country** (e.g., Iran/Venezuela)
2. **User zooms into the area** OR **asks the chatbox** and it auto-zooms there
3. **Once zoomed into the area/it's highlighted:**
   - Floating cards appear around the area with different pieces/categories of information
   - Overview card shows basic facts
   - Grokipedia provides deep historical context
   - Latest News displays current events
   - Live Tweet Feed shows trending social media posts
   - Prediction Markets show relevant market odds
   - Grok Radio provides audio insights

## 🎨 Design Philosophy

- **Mission Control Aesthetic** - Command center feel with dark themes
- **High-Quality UI/UX** - Premium, polished interface
- **Floating Cards** - Information cards that appear contextually
- **Filterable Content** - Users control what information is displayed
- **Real-time Updates** - LIVE indicators and streaming data
- **Smooth Animations** - Fluid transitions and interactions
- **3D Visualization** - Immersive globe experience

## 📡 API Routes

### `/api/trends`
Returns trending hotspots and zones (red hotspots for high volume, blue zones for emerging trends)

### `/api/overview-card`
Generates overview information for a location using Grok AI

### `/api/query-grokipedia`
Deep-dive queries into regions, conflicts, and historical context

### `/api/latest-news`
Fetches latest news articles for a given region

### `/api/fetch-tweets`
Retrieves trending X/Twitter posts for a location

### `/api/prediction-markets`
Fetches prediction market data from Polymarket

### `/api/generate-image`
Generates images using Grok Imagine

### `/api/voice-stream`
Streams AI-generated voice content

### `/api/satellite-info/[id]`
Retrieves Starlink satellite information

## 🎯 Roadmap & Goals

### Implemented ✅
- [x] Interactive 3D globe with Mapbox
- [x] Overview card with basic location info
- [x] Grokipedia deep-dive summaries
- [x] Latest News aggregation
- [x] Live Tweet Feed
- [x] Grok Radio (voice podcast)
- [x] Grok Imagine (image generation)
- [x] Prediction Markets integration
- [x] Starlink satellite visualization
- [x] Heatmaps for trending areas
- [x] 3D columns for hotspots
- [x] Chatbox with auto-zoom
- [x] Filterable card system
- [x] Smooth animations

### Planned 🚧
- [ ] X Live Spaces integration
- [ ] Top creators showcase
- [ ] Enhanced heatmap visualization
- [ ] Pinpoints for specific areas
- [ ] Short-form content previews in cards
- [ ] Enhanced filtering and search
- [ ] User preferences and saved locations
- [ ] Export/share functionality
- [ ] Mobile optimization

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines
- Follow TypeScript best practices
- Use existing component patterns
- Maintain the mission control aesthetic
- Add proper error handling
- Include TypeScript types
- Test your changes thoroughly

## 📝 License

[Add your license here]

## 🙏 Acknowledgments

- **xAI** - For the Grok AI integration and mission inspiration
- **Mapbox** - For the powerful mapping platform
- **shadcn/ui** - For the component library
- **Aceternity UI** - For advanced UI components
- **Polymarket** - For prediction market data

## 📧 Contact

[Add contact information]

---

**Built with ❤️ for understanding the universe**
