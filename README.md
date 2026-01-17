![Grok Earth](app/assets/GrokEarth.png)
## Mission & Vision
>_A wise man once said, "To understand the universe, one must first understand the Earth."_

Grok Earth provides the first open-source world explorer, as a mission control

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

<img width="3440" height="1327" alt="Screenshot 2026-01-17 at 19 57 03" src="https://github.com/user-attachments/assets/e9e99a42-97ad-4e99-92ca-388d03914e11" />

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

<img width="3439" height="1322" alt="Screenshot 2026-01-17 at 19 59 01" src="https://github.com/user-attachments/assets/5b359b45-7bd6-4d62-ba6e-d5e563b271c2" />


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

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ 
- **npm** or **yarn**
- **Mapbox API Key** - Get one at [mapbox.com](https://www.mapbox.com/)
- **xAI API Key** - For Grok integration
- **Polymarket API Key** (optional) - For prediction markets

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   
   Create an `.env.local` file in the root directory:
   ```env
   MAPBOX_API_KEY=your_mapbox_api_key
   X_AI_API_KEY=your_xai_api_key
   X_API_KEY=your_xai_api_key
   ```

4. **Build the application**
   ```bash
   npm run build && npm run start
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 🎨 Design Philosophy

- **Mission Control Aesthetic** - Command center feel with dark themes
- **High-Quality UI/UX** - Premium, polished interface
- **Floating Cards** - Information cards that appear contextually
- **Filterable Content** - Users control what information is displayed
- **Real-time Updates** - LIVE indicators and streaming data
- **Smooth Animations** - Fluid transitions and interactions
- **3D Visualization** - Immersive globe experience


**Built with ❤️ to start understanding the universe**
