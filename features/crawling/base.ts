import { chromium, Browser, Page } from 'playwright'

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
export function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

/**
 * 랜덤 딜레이 생성 (밀리초)
 * 인간의 행동 패턴을 모방하기 위해 랜덤한 대기 시간 생성
 * @param min - 최소 딜레이 (ms)
 * @param max - 최대 딜레이 (ms)
 */
export function randomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 오디오 플러그인 데이터 추출을 위한 기본 크롤러 클래스
 * 다양한 플러그인 소스에 대한 공통 기능 제공
 */
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
