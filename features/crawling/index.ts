import { chromium, Browser, Page } from 'playwright'
import { validateCrawledPlugin, type CrawledPluginRaw } from './schemas'
import type { Plugin } from '@/features/plugins/types'

/**
 * 오디오 플러그인 데이터 추출을 위한 기본 크롤러 클래스
 * 다양한 플러그인 소스(KVR, Splice 등)에 대한 공통 기능 제공
 */
/**
 * User-Agent 로테이션을 위한 배열
 * 봇 탐지 방지를 위해 다양한 브라우저 User-Agent 사용
 */
const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
]

/**
 * 랜덤 User-Agent 선택
 * 봇 탐지 방지를 위해 매 요청마다 다른 User-Agent 사용
 */
function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

/**
 * 랜덤 딜레이 생성 (밀리초)
 * 인간의 행동 패턴을 모방하기 위해 랜덤한 대기 시간 생성
 * @param min - 최소 딜레이 (ms)
 * @param max - 최대 딜레이 (ms)
 */
function randomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export class PluginCrawler {
  protected browser: Browser | null = null
  protected context: Awaited<ReturnType<Browser['newContext']>> | null = null

  /**
   * 크롤링을 위한 브라우저 인스턴스 초기화
   * 크롤링 작업 전에 반드시 호출해야 함
   * Anti-Bot: 랜덤 User-Agent로 브라우저 컨텍스트 생성
   */
  async init(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
    })
    // User-Agent 로테이션을 위한 브라우저 컨텍스트 생성
    this.context = await this.browser.newContext({
      userAgent: getRandomUserAgent(),
    })
  }

  /**
   * 브라우저 리소스 정리
   * 크롤링 작업 완료 후 호출해야 함
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
   * 새로운 페이지 인스턴스 생성
   * 병렬 크롤링 작업에 유용함
   * User-Agent 로테이션을 적용하여 봇 탐지 방지
   */
  protected async newPage(): Promise<Page> {
    if (!this.context) {
      throw new Error('Browser context not initialized. Call init() first.')
    }
    // 매 페이지마다 새로운 User-Agent로 컨텍스트 재생성 (봇 탐지 방지)
    const page = await this.context.newPage()
    return page
  }
}

/**
 * KVR Audio 플러그인 크롤러
 * KVR Audio 데이터베이스에서 플러그인 정보를 스크래핑함
 */
export class KVRCrawler extends PluginCrawler {
  private readonly baseUrl = 'https://www.kvraudio.com'

  /**
   * KVR Audio에서 플러그인 데이터 크롤링
   * @param limit - 크롤링할 최대 플러그인 수 (선택사항)
   */
  async crawlPlugins(limit?: number): Promise<any[]> {
    const page = await this.newPage()
    const plugins: any[] = []

    try {
      // KVR Audio 플러그인 페이지로 이동
      await page.goto(`${this.baseUrl}/plugins`, {
        waitUntil: 'networkidle',
      })

      // 플러그인 데이터 추출
      // TODO: KVR의 HTML 구조에 기반한 실제 스크래핑 로직 구현 필요
      console.log('KVR crawler initialized. Implement scraping logic here.')

      return plugins
    } finally {
      await page.close()
    }
  }
}

/**
 * Splice 플러그인 크롤러
 * Splice 마켓플레이스에서 플러그인 정보를 스크래핑함
 */
export class SpliceCrawler extends PluginCrawler {
  private readonly baseUrl = 'https://splice.com'

  /**
   * Splice에서 플러그인 데이터 크롤링
   * @param limit - 크롤링할 최대 플러그인 수 (선택사항)
   */
  async crawlPlugins(limit?: number): Promise<any[]> {
    const page = await this.newPage()
    const plugins: any[] = []

    try {
      // Splice 플러그인 페이지로 이동
      await page.goto(`${this.baseUrl}/plugins`, {
        waitUntil: 'networkidle',
      })

      // 플러그인 데이터 추출
      // TODO: Splice의 HTML 구조에 기반한 실제 스크래핑 로직 구현 필요
      console.log('Splice crawler initialized. Implement scraping logic here.')

      return plugins
    } finally {
      await page.close()
    }
  }
}

/**
 * Plugin Alliance 플러그인 크롤러
 * Plugin Alliance 웹사이트에서 플러그인 정보를 스크래핑함
 */
export class PluginAllianceCrawler extends PluginCrawler {
  private readonly baseUrl = 'https://www.plugin-alliance.com'

  /**
   * Plugin Alliance에서 플러그인 데이터 크롤링
   * @param maxPages - 크롤링할 최대 페이지 수 (기본값: 10)
   * @param minDelay - 페이지 간 최소 지연 시간(ms, 기본값: 1500ms)
   * @param maxDelay - 페이지 간 최대 지연 시간(ms, 기본값: 3000ms)
   */
  async crawlPlugins(
    maxPages: number = 10,
    minDelay: number = 1500,
    maxDelay: number = 3000
  ): Promise<Plugin[]> {
    const page = await this.newPage()
    const plugins: Plugin[] = []

    try {
      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        console.log(`크롤링 중: 페이지 ${pageNum}/${maxPages}`)
        
        // 페이지로 이동
        const url = `${this.baseUrl}/collections/all-products?page=${pageNum}`
        await page.goto(url, {
          waitUntil: 'networkidle',
          timeout: 30000,
        })

        // 페이지 로딩 대기 (플러그인 카드가 렌더링될 때까지)
        // Resilience: waitForSelector를 사용하여 데이터 추출 전 요소가 로드되었는지 확인
        await page.waitForSelector('[class*="product"], [class*="card"], article', {
          timeout: 10000,
        }).catch(() => {
          console.log(`페이지 ${pageNum}에서 플러그인 카드를 찾을 수 없습니다.`)
        })

        // 추가 안정성을 위한 짧은 대기 (동적 콘텐츠 로딩 대기)
        await page.waitForTimeout(randomDelay(500, 1000))

        // 플러그인 데이터 추출
        // Performance: page.evaluate()를 사용하여 한 번에 모든 데이터를 추출 (Locator 루프보다 효율적)
        const pagePluginsRaw = await page.evaluate(() => {
          const pluginElements: unknown[] = []
          
          // 다양한 선택자 시도 (사이트 구조에 따라 변경될 수 있음)
          const selectors = [
            'article[class*="product"]',
            'div[class*="product-card"]',
            'div[class*="product-item"]',
            '[data-product-id]',
            '.product',
          ]

          let cards: Element[] = []
          for (const selector of selectors) {
            cards = Array.from(document.querySelectorAll(selector))
            if (cards.length > 0) break
          }

          // DOM 구조를 분석하여 플러그인 정보 추출
          cards.forEach((card, index) => {
            try {
              // 이름 추출
              const nameElement = card.querySelector('h2, h3, [class*="title"], [class*="name"]') ||
                                card.querySelector('a[href*="/products/"]')
              const name = nameElement?.textContent?.trim() || `Plugin ${index + 1}`

              // 가격 추출
              const priceElement = card.querySelector('[class*="price"], [class*="cost"]')
              const priceText = priceElement?.textContent?.trim() || ''
              const priceMatch = priceText.match(/\$?([\d,]+\.?\d*)/)
              const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : null

              // 할인가 추출
              const salePriceElement = card.querySelector('[class*="sale"], [class*="discount"]')
              const salePriceText = salePriceElement?.textContent?.trim() || ''
              const salePriceMatch = salePriceText.match(/\$?([\d,]+\.?\d*)/)
              const salePrice = salePriceMatch ? parseFloat(salePriceMatch[1].replace(/,/g, '')) : null

              // 브랜드/벤더 추출
              const vendorElement = card.querySelector('[class*="vendor"], [class*="brand"]')
              const vendor = vendorElement?.textContent?.trim() || ''

              // 설명 추출
              const descElement = card.querySelector('[class*="description"], [class*="desc"], p')
              const description = descElement?.textContent?.trim() || ''

              // 이미지 URL 추출
              const imgElement = card.querySelector('img')
              const imageUrl = imgElement?.getAttribute('src') || imgElement?.getAttribute('data-src') || ''

              // 링크 추출
              const linkElement = card.querySelector('a[href*="/products/"]')
              const link = linkElement?.getAttribute('href') || ''

              if (name && name !== `Plugin ${index + 1}`) {
                pluginElements.push({
                  name,
                  developer: vendor,
                  description: description,
                  price: salePrice || price,
                  originalPrice: price,
                  currency: 'USD',
                  imageUrl: imageUrl.startsWith('http') ? imageUrl : imageUrl ? `https://www.plugin-alliance.com${imageUrl}` : '',
                  sourceUrl: link.startsWith('http') ? link : link ? `https://www.plugin-alliance.com${link}` : '',
                })
              }
            } catch (error) {
              console.error(`플러그인 추출 오류:`, error)
            }
          })

          return pluginElements
        })

        // Zod를 사용하여 크롤링된 데이터 검증
        // Data Integrity: 모든 외부 데이터는 Zod 스키마로 검증하여 타입 안전성 보장
        const validatedPlugins: Plugin[] = []
        for (const rawPlugin of pagePluginsRaw) {
          try {
            const validated = validateCrawledPlugin(rawPlugin, 'Plugin Alliance')
            
            // 검증된 데이터를 Plugin 인터페이스로 변환
            const plugin: Plugin = {
              id: `${validated.name}-${validated.developer}-${Date.now()}-${Math.random()}`.replace(/\s+/g, '-').toLowerCase(),
              name: validated.name,
              developer: validated.developer || 'Unknown',
              description: validated.description || undefined,
              formats: [], // Plugin Alliance 페이지에서 직접 추출 불가능하므로 빈 배열
              category: 'Other', // 기본값, 추후 분류 로직 추가 가능
              tags: [],
              price: validated.price ?? undefined,
              currency: validated.currency || 'USD',
              imageUrl: validated.imageUrl || undefined,
              source: 'Plugin Alliance',
              sourceUrl: validated.sourceUrl || undefined,
            }
            validatedPlugins.push(plugin)
          } catch (error) {
            console.warn(`플러그인 검증 실패:`, error)
            // 검증 실패한 데이터는 건너뜀 (Data Integrity 보장)
          }
        }

        if (validatedPlugins.length === 0) {
          console.log(`페이지 ${pageNum}에서 유효한 플러그인을 찾을 수 없습니다. 크롤링 종료.`)
          break
        }

        plugins.push(...validatedPlugins)
        console.log(`페이지 ${pageNum}에서 ${validatedPlugins.length}개의 플러그인을 검증했습니다. (총 ${plugins.length}개)`)

        // Anti-Bot: 마지막 페이지가 아니면 랜덤 딜레이 대기 (인간의 행동 패턴 모방)
        if (pageNum < maxPages) {
          const delay = randomDelay(minDelay, maxDelay)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }

      return plugins
    } finally {
      await page.close()
    }
  }
}

/**
 * 크롤링 작업의 메인 진입점
 * npm run crawl 명령으로 실행 가능
 */
async function main() {
  const crawler = new PluginAllianceCrawler()
  
  try {
    await crawler.init()
    console.log('Plugin Alliance 크롤링 시작...')
    // 랜덤 딜레이 범위: 1500ms ~ 3000ms (인간의 행동 패턴 모방)
    const plugins = await crawler.crawlPlugins(10, 1500, 3000)
    console.log(`\n크롤링 완료: 총 ${plugins.length}개의 플러그인을 수집했습니다.`)
    console.log('\n샘플 데이터 (최대 3개):')
    console.log(JSON.stringify(plugins.slice(0, 3), null, 2))
  } catch (error) {
    console.error('크롤링 오류:', error)
    process.exit(1)
  } finally {
    await crawler.close()
  }
}

// 직접 실행된 경우에만 실행
if (require.main === module) {
  main()
}
