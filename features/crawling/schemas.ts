import { z } from 'zod'

/**
 * 크롤링된 원시 데이터 검증을 위한 Zod 스키마
 * Plugin Alliance에서 추출한 데이터의 구조를 정의
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

// 검증된 플러그인 데이터를 Plugin 인터페이스로 변환하기 위한 헬퍼
export function validateCrawledPlugin(
  raw: unknown,
  source: 'Plugin Alliance' | 'KVR' | 'Splice'
): CrawledPluginRaw {
  return CrawledPluginRawSchema.parse(raw)
}
