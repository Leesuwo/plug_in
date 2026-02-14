# Audio Plugin Archive

A comprehensive platform for discovering and exploring VST/AU audio plugins used in music production, mixing, and mastering.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS, Framer Motion
- **UI Library**: shadcn/ui (Radix UI based)
- **Icons**: Lucide React
- **Data Fetching**: Playwright (for scraping)
- **State Management**: Zustand

## Design Theme

- **Vibe**: Professional DAW-inspired dark mode (Logic Pro X / Ableton Live style)
- **Layout**: Apple-style Bento Grid layout
- **Colors**: Deep dark background (#0a0a0a) with neon accents (Cyan/Purple)
- **Typography**: Inter (Clean Sans-serif)

## Project Structure

```
src/
  app/              # Next.js App Router pages
  components/
    ui/             # shadcn/ui components
    layout/         # Header, Sidebar, Footer
  features/
    plugins/        # Main domain: List, Detail, Filter logic
    crawling/       # Scrapers for KVR, Splice, etc.
    ranking/        # Top charts logic
  lib/              # Utils, Constants
  hooks/            # Global hooks
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Crawling

Run the crawler to fetch plugin data:

```bash
npm run crawl
```

## Features

- 🎹 Plugin browsing and search
- 📊 Rankings and charts
- 🔍 Advanced filtering
- 📱 Responsive design
- 🌙 Dark mode optimized

## License

MIT
