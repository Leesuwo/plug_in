import { Page } from 'playwright'

/**
 * 크롤링된 플러그인 원시 데이터 타입
 * 스크래퍼에서 반환하는 검증 전 데이터
 */
export interface CrawledPluginData {
  name: string
  developer?: string
  description?: string
  price?: number | null
  originalPrice?: number | null
  currency?: string
  imageUrl?: string
  sourceUrl?: string
}

/**
 * 플러그인 스크래퍼 인터페이스
 * Strategy Pattern: 모든 스크래퍼는 이 인터페이스를 구현해야 함
 */
export interface PluginScraper {
  name: string
  baseUrl: string
  
  /**
   * 페이지에서 플러그인 데이터를 추출
   * Performance: page.evaluate()를 사용하여 브라우저 컨텍스트에서 실행
   * Normalization: 데이터 정규화(가격, URL 등)는 스크래퍼 내부에서 수행
   */
  scrape(page: Page): Promise<CrawledPluginData[]>
}
