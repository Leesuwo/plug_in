import { z } from 'zod'
import type { CrawledPluginData } from './types'

/**
 * 크롤링된 원시 데이터 검증을 위한 Zod 스키마
 * Data Integrity: 모든 외부 데이터는 Zod 스키마로 검증하여 타입 안전성 보장
 */

// 크롤링된 플러그인 원시 데이터 스키마
export const CrawledPluginRawSchema = z.object({
  name: z.string().min(1, '플러그인 이름은 필수입니다'),
  developer: z.string().optional().default(''),
  description: z.string().optional().default(''),
  price: z.number().nullable().optional(),
  originalPrice: z.number().nullable().optional(),
  currency: z.string().optional().default('USD'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  sourceUrl: z.string().url().optional().or(z.literal('')),
})

export type CrawledPluginRaw = z.infer<typeof CrawledPluginRawSchema>

/**
 * 크롤링된 데이터 검증
 * Data Integrity: 모든 외부 데이터는 Zod 스키마로 검증
 */
export function validateCrawledPlugin(
  raw: unknown,
  source: string
): CrawledPluginData {
  return CrawledPluginRawSchema.parse(raw)
}
