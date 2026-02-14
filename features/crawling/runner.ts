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
   * 무한 스크롤 처리 (최적화된 버전)
   * 점진적 스크롤과 로딩 감지를 통해 모든 콘텐츠를 안정적으로 로드
   * 
   * @param page - Playwright 페이지 객체
   * @param itemSelector - 아이템을 식별하는 CSS 선택자 (예: '.plugin-item')
   * @param maxScrolls - 최대 스크롤 횟수 (기본값: 50)
   * @param minDelay - 최소 스크롤 간 딜레이 (ms, 기본값: 2000)
   * @param maxDelay - 최대 스크롤 간 딜레이 (ms, 기본값: 4000)
   * @param noChangeThreshold - 연속으로 변화가 없을 때 종료하는 횟수 (기본값: 3)
   */
  private async handleInfiniteScroll(
    page: Page,
    itemSelector: string,
    maxScrolls: number = 50,
    minDelay: number = 2000,
    maxDelay: number = 4000,
    noChangeThreshold: number = 3
  ): Promise<void> {
    let previousItemCount = 0
    let scrollCount = 0
    let noChangeCount = 0

    while (scrollCount < maxScrolls) {
      // 현재 아이템 수 확인
      const currentItemCount = await page.evaluate((selector) => {
        return document.querySelectorAll(selector).length
      }, itemSelector)

      // 아이템 수가 증가하지 않으면 카운트 증가
      if (currentItemCount === previousItemCount && scrollCount > 0) {
        noChangeCount++
        
        // 연속으로 변화가 없으면 종료 (더 정확한 종료 조건)
        if (noChangeCount >= noChangeThreshold) {
          console.log(`[무한 스크롤] ${noChangeThreshold}회 연속 변화 없음. 크롤링 종료. (${currentItemCount}개 아이템)`)
          break
        }
      } else {
        // 아이템이 증가했으면 카운트 리셋
        noChangeCount = 0
      }

      previousItemCount = currentItemCount

      // 점진적 스크롤: 한 번에 끝까지가 아니라 조금씩 스크롤 (더 자연스러움)
      await page.evaluate(() => {
        // 현재 스크롤 위치에서 80% 정도만 스크롤 (더 부드러운 스크롤)
        const scrollHeight = document.documentElement.scrollHeight
        const clientHeight = document.documentElement.clientHeight
        const currentScroll = window.scrollY || window.pageYOffset
        
        // 다음 스크롤 위치 계산 (현재 위치 + 화면 높이의 80%)
        const nextScroll = currentScroll + (clientHeight * 0.8)
        const maxScroll = scrollHeight - clientHeight
        
        window.scrollTo({
          top: Math.min(nextScroll, maxScroll),
          behavior: 'smooth'
        })
      })

      // 랜덤 딜레이 (Anti-Bot: 인간의 행동 패턴 모방)
      const delay = randomDelay(minDelay, maxDelay)
      await page.waitForTimeout(delay)

      // 로딩 인디케이터가 사라질 때까지 대기 (있는 경우)
      try {
        // 로딩 인디케이터가 있으면 사라질 때까지 대기 (더 긴 대기 시간)
        await page.waitForSelector('.loading, [class*="loading"], [class*="spinner"]', {
          state: 'hidden',
          timeout: 8000
        }).catch(() => {
          // 로딩 인디케이터가 없으면 무시
        })
      } catch {
        // 로딩 인디케이터가 없어도 계속 진행
      }

      // 네트워크가 안정될 때까지 대기 (더 긴 대기 시간으로 안정성 향상)
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {
        // 타임아웃은 무시 (콘텐츠가 이미 로드되었을 수 있음)
      })

      scrollCount++
      console.log(`[무한 스크롤] 스크롤 ${scrollCount}/${maxScrolls} 완료 (${currentItemCount}개 아이템, 변화 없음: ${noChangeCount}/${noChangeThreshold})`)
    }

    if (scrollCount >= maxScrolls) {
      console.log(`[무한 스크롤] 최대 스크롤 횟수(${maxScrolls})에 도달했습니다.`)
    }
  }

  /**
   * 스크래퍼 실행
   * Strategy Pattern: 인터페이스를 통해 다양한 스크래퍼 실행
   * 무한 스크롤 지원 (Slate Digital 등)
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
      // Slate Digital은 무한 스크롤이므로 단일 페이지 처리
      const isInfiniteScroll = scraper.name === 'Slate Digital'
      
      if (isInfiniteScroll) {
        console.log(`[${scraper.name}] 무한 스크롤 크롤링 시작...`)
        
        // 페이지 이동
        await page.goto(`${scraper.baseUrl}/plugins`, {
          waitUntil: 'networkidle',
          timeout: 30000,
        })

        // 무한 스크롤 처리 (스크래퍼별 선택자 전달)
        // Slate Digital의 경우 '.plugin-item.plugin-item-boxed-2' 선택자 사용
        await this.handleInfiniteScroll(
          page,
          '.plugin-item.plugin-item-boxed-2', // Slate Digital 전용 선택자
          50, // 최대 스크롤 횟수
          2000, // 최소 딜레이 (더 긴 대기 시간)
          4000, // 최대 딜레이 (더 긴 대기 시간)
          3 // 연속 변화 없음 임계값
        )

        // Resilience: 스크래퍼가 데이터를 추출할 수 있도록 대기
        await page.waitForTimeout(randomDelay(500, 1000))

        // Strategy Pattern: 스크래퍼의 scrape 메서드 호출
        const rawData = await scraper.scrape(page)

        // 데이터 추출 실패 시 즉시 중단
        if (!rawData || rawData.length === 0) {
          console.log(`[${scraper.name}] 데이터를 추출할 수 없습니다.`)
        } else {
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

          plugins.push(...validatedPlugins)
          crawledData.push(...validatedCrawledData)
          console.log(`[${scraper.name}] ${validatedPlugins.length}개의 플러그인을 검증했습니다.`)
        }
      } else {
        // 일반 페이지네이션 처리 (Plugin Alliance 등)
        // Solid State Logic은 단일 페이지 크롤링
        const isSinglePage = scraper.name === 'Solid State Logic'
        
        if (isSinglePage) {
          // Solid State Logic은 단일 페이지 크롤링
          console.log(`[${scraper.name}] 단일 페이지 크롤링 시작...`)
          
          // Solid State Logic 플러그인 목록 페이지
          const url = `${scraper.baseUrl}/products/ssl-plug-ins`
          
          console.log(`[${scraper.name}] ${url} 크롤링 시작...`)
          await page.goto(url, {
            waitUntil: 'networkidle',
            timeout: 30000,
          })
          
          // 선택자 확인
          const itemCount = await page.locator('a.cb-image-content-highlight').count()
          if (itemCount === 0) {
            console.log(`[${scraper.name}] 플러그인 아이템을 찾을 수 없습니다.`)
          } else {
            console.log(`[${scraper.name}] ${itemCount}개의 아이템 발견`)
          }
          
          // Resilience: 스크래퍼가 데이터를 추출할 수 있도록 대기
          await page.waitForTimeout(randomDelay(500, 1000))
          
          // Strategy Pattern: 스크래퍼의 scrape 메서드 호출
          const rawData = await scraper.scrape(page)
          
          // 데이터 추출 실패 시 즉시 중단
          if (!rawData || rawData.length === 0) {
            console.log(`[${scraper.name}] 데이터를 추출할 수 없습니다.`)
          } else {
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
            
            plugins.push(...validatedPlugins)
            crawledData.push(...validatedCrawledData)
            console.log(`[${scraper.name}] ${validatedPlugins.length}개의 플러그인을 검증했습니다.`)
          }
        } else {
          // 일반 페이지네이션 처리 (Plugin Alliance 등)
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
