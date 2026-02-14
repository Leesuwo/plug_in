/**
 * 오디오 플러그인을 위한 핵심 타입 정의
 */

export type PluginFormat = 'VST' | 'VST3' | 'AU' | 'AAX' | 'CLAP' | 'Standalone'

export type PluginCategory =
  | 'Synthesizer'
  | 'Effect'
  | 'Instrument'
  | 'Drum Machine'
  | 'Sampler'
  | 'Utility'
  | 'MIDI'
  | 'Other'

export interface Plugin {
  id: string
  name: string
  developer: string
  description?: string
  formats: PluginFormat[]
  category: PluginCategory
  tags: string[]
  price?: number
  currency?: string
  website?: string
  imageUrl?: string
  rating?: number
  reviewCount?: number
  releaseDate?: Date
  lastUpdated?: Date
  source: 'Plugin Alliance' | 'Slate Digital' | 'Solid State Logic' 
  sourceUrl?: string
}

export interface PluginFilter {
  category?: PluginCategory
  format?: PluginFormat
  developer?: string
  tags?: string[]
  minRating?: number
  priceRange?: {
    min?: number
    max?: number
  }
  searchQuery?: string
}

export interface PluginSortOption {
  field: 'name' | 'developer' | 'rating' | 'releaseDate' | 'price'
  direction: 'asc' | 'desc'
}
