/**
 * 애플리케이션 전역 상수
 */

export const APP_NAME = 'Audio Plugin Archive'
export const APP_VERSION = '0.1.0'

export const PLUGIN_FORMATS = [
  'VST',
  'VST3',
  'AU',
  'AAX',
  'CLAP',
  'Standalone',
] as const

export const PLUGIN_CATEGORIES = [
  'Synthesizer',
  'Effect',
  'Instrument',
  'Drum Machine',
  'Sampler',
  'Utility',
  'MIDI',
  'Other',
] as const
