export interface WallpaperPreset {
  id: string;
  name: string;
  category: string;
  url: string;
  thumb: string;
}

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: 'sonoma-sunset',
    name: 'Sonoma Horizon',
    category: 'Apple macOS',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2560&q=85',
    thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=75',
  },
  {
    id: 'sequoia-mist',
    name: 'Sequoia Forest',
    category: 'Natura',
    url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=2560&q=85',
    thumb: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=400&q=75',
  },
  {
    id: 'crimson-aura',
    name: 'Crimson',
    category: 'Abstrakcja',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=2560&q=85',
    thumb: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=400&q=75',
  },
  {
    id: 'dark-waves',
    name: 'Deep Obsidian',
    category: 'Minimalizm',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2560&q=85',
    thumb: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=75',
  },
  {
    id: 'campus-arch',
    name: 'Nowoczesna Architektura',
    category: 'Kampus',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2560&q=85',
    thumb: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=75',
  },
  {
    id: 'cyber-neon',
    name: 'Neon Cyberpunk',
    category: 'Vibrant',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=2560&q=85',
    thumb: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=75',
  },
];
