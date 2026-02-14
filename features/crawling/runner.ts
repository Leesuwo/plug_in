import { chromium, Browser, Page } from 'playwright'
import type { PluginScraper, CrawledPluginData } from './types'
import { getRandomUserAgent, randomDelay } from './base'
import { validateCrawledPlugin } from './schemas'
import type { Plugin } from '@/features/plugins/types'

/**
 * 스크래퍼 실행 옵션
 */
export interface ScraperRunOptions {
  maxPages?: number
  minDelay?: number
  maxDelay?: number
}

/**
 * 스크래퍼 실행 결과
 */
export interface ScraperRunResult {
  plugins: Plugin[]
  crawledData: CrawledPluginData[]
  totalPages: number
  errors: string[]
}

/**
 * 스크래퍼 실행기
 * Strategy Pattern: 다양한 스크래퍼를 동일한 방식으로 실행
 */
export class ScraperRunner {
  private browser: Browser | null = null
  private context: Awaited<ReturnType<Browser['newContext']>> | null = null

  /**
   * 브라우저 초기화
   * Anti-Bot: 랜덤 User-Agent로 브라우저 컨텍스트 생성
   */
  async init(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
    })
    this.context = await this.browser.newContext({
      userAgent: getRandomUserAgent(),
    })
  }

  /**
   * 브라우저 리소스 정리
   */
  async close(): Promise<void> {
    if (this.context) {
      await this.context.close()
      this.context = null
    }
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  /**
   * 새로운 페이지 생성
   */
  private async newPage(): Promise<Page> {
    if (!this.context) {
      throw new Error('Browser context not initialized. Call init() first.')
    }
    return await this.context.newPage()
  }

  /**
   * 스크래퍼 실행
   * Strategy Pattern: 인터페이스를 통해 다양한 스크래퍼 실행
   */
  async run(
    scraper: PluginScraper,
    options: ScraperRunOptions = {}
  ): Promise<ScraperRunResult> {
    const {
      maxPages = 10,
      minDelay = 1500,
      maxDelay = 3000,
    } = options

    const page = await this.newPage()
    const plugins: Plugin[] = []
    const crawledData: CrawledPluginData[] = []
    const errors: string[] = []

    try {
      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        console.log(`[${scraper.name}] 크롤링 중: 페이지 ${pageNum}/${maxPages}`)

        try {
          // 페이지 이동
          const url = pageNum === 1
            ? `${scraper.baseUrl}/collections/all-products`
            : `${scraper.baseUrl}/collections/all-products?page=${pageNum}`
          
          await page.goto(url, {
            waitUntil: 'networkidle',
            timeout: 30000,
          })

          // Resilience: 스크래퍼가 데이터를 추출할 수 있도록 대기
          await page.waitForTimeout(randomDelay(500, 1000))

          // Strategy Pattern: 스크래퍼의 scrape 메서드 호출
          const rawData = await scraper.scrape(page)

          // 데이터 추출 실패 시 즉시 중단
          if (!rawData || rawData.length === 0) {
            console.log(`[${scraper.name}] 페이지 ${pageNum}에서 데이터를 추출할 수 없습니다. 크롤링 즉시 중단.`)
            break
          }

          // Data Integrity: Zod를 사용하여 모든 외부 데이터 검증
          const validatedPlugins: Plugin[] = []
          const validatedCrawledData: CrawledPluginData[] = []
          for (const rawPlugin of rawData) {
            try {
              const validated = validateCrawledPlugin(rawPlugin, scraper.name)
              
              // 검증된 크롤링 데이터 저장 (DB 저장용)
              validatedCrawledData.push(validated)
              
              // 검증된 데이터를 Plugin 인터페이스로 변환 (UI 표시용)
              const plugin: Plugin = {
                id: `${validated.name}-${validated.developer || 'Unknown'}-${Date.now()}-${Math.random()}`
                  .replace(/\s+/g, '-')
                  .toLowerCase(),
                name: validated.name,
                developer: validated.developer || 'Unknown',
                description: validated.description || undefined,
                formats: [], // 스크래퍼에서 추출 불가능한 경우 빈 배열
                category: 'Other', // 기본값, 추후 분류 로직 추가 가능
                tags: [],
                price: validated.price ?? undefined,
                currency: validated.currency || 'USD',
                imageUrl: validated.imageUrl || undefined,
                source: scraper.name as Plugin['source'],
                sourceUrl: validated.sourceUrl || undefined,
              }
              validatedPlugins.push(plugin)
            } catch (error) {
              const errorMsg = `플러그인 검증 실패: ${error instanceof Error ? error.message : String(error)}`
              console.warn(errorMsg)
              errors.push(errorMsg)
            }
          }

          // 검증된 플러그인이 없으면 즉시 중단
          if (validatedPlugins.length === 0) {
            console.log(`[${scraper.name}] 페이지 ${pageNum}에서 유효한 플러그인을 찾을 수 없습니다. 크롤링 즉시 중단.`)
            break
          }

          plugins.push(...validatedPlugins)
          crawledData.push(...validatedCrawledData)
          console.log(`[${scraper.name}] 페이지 ${pageNum}에서 ${validatedPlugins.length}개의 플러그인을 검증했습니다. (총 ${plugins.length}개)`)

          // Anti-Bot: 마지막 페이지가 아니면 랜덤 딜레이 대기
          if (pageNum < maxPages) {
            const delay = randomDelay(minDelay, maxDelay)
            await new Promise(resolve => setTimeout(resolve, delay))
          }
        } catch (error) {
          const errorMsg = `페이지 ${pageNum} 크롤링 오류: ${error instanceof Error ? error.message : String(error)}`
          console.error(errorMsg)
          errors.push(errorMsg)
          
          // 연속 오류 발생 시 중단
          if (errors.length >= 3) {
            console.log(`[${scraper.name}] 연속 오류 발생으로 크롤링 중단.`)
            break
          }
        }
      }

      return {
        plugins,
        crawledData,
        totalPages: maxPages,
        errors,
      }
    } finally {
      await page.close()
    }
  }
}
