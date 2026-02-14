import { Page } from 'playwright'
import type { PluginScraper, CrawledPluginData } from '../types'

/**
 * Slate Digital 선택자 상수
 * HTML 구조 분석 기반 정확한 선택자
 */
const SELECTORS = {
  // 플러그인 아이템 컨테이너
  ITEM: '.plugin-item.plugin-item-boxed-2',
  
  // 플러그인 제목: h3.plugin-item-title
  TITLE: 'h3.plugin-item-title',
  
  // 플러그인 설명: p.plugin-item-description
  DESCRIPTION: 'p.plugin-item-description',
  
  // 이미지: .plugin-item-img img
  IMAGE: '.plugin-item-img img',
  
  // 상세페이지 URL: 이미지 링크 우선 (이미지 링크가 더 정확함)
  // HTML 구조: .plugin-item-box2 > a 또는 .plugin-item-img의 부모 a
  IMAGE_LINK: '.plugin-item-box2 > a, .plugin-item-img',
  
  // 제목 링크 (이미지 링크가 없을 경우 대체용)
  TITLE_LINK: 'h3.plugin-item-title a',
  
  // 무한 스크롤 로딩 인디케이터 (있는 경우)
  LOADING: '.loading, [class*="loading"], [class*="spinner"]',
}

/**
 * Slate Digital 플러그인 스크래퍼
 * Strategy Pattern: PluginScraper 인터페이스 구현
 * 무한 스크롤 지원
 */
export const slateDigitalScraper: PluginScraper = {
  name: 'Slate Digital',
  baseUrl: 'https://slatedigital.com',
  
  async scrape(page: Page): Promise<CrawledPluginData[]> {
    // runner에서 이미 올바른 URL로 이동했으므로 여기서는 이동하지 않음

    // Resilience: 메인 리스트 컨테이너가 로드될 때까지 대기
    await page.waitForSelector(SELECTORS.ITEM, {
      timeout: 10000,
    }).catch(() => {
      console.log('플러그인 카드를 찾을 수 없습니다.')
    })

    // Anti-Bot: 동적 콘텐츠 로딩을 위한 랜덤 딜레이
    const delay = Math.random() * 1000 + 500
    await page.waitForTimeout(delay)

    // Performance: page.evaluate()를 사용하여 브라우저 컨텍스트에서 한 번에 모든 데이터 추출
    return await page.evaluate((sel) => {
      const items = document.querySelectorAll(sel.ITEM)
      
      return Array.from(items).map((item, index) => {
        try {
          // 플러그인 제목 추출
          const titleElement = item.querySelector(sel.TITLE) as HTMLElement | null
          const titleLink = titleElement?.querySelector('a') as HTMLAnchorElement | null
          const name = titleElement?.textContent?.trim() || titleLink?.textContent?.trim() || `Plugin ${index + 1}`

          if (!name || name === `Plugin ${index + 1}`) {
            return null
          }

          // 플러그인 설명 추출
          const descElement = item.querySelector(sel.DESCRIPTION)
          const description = descElement?.textContent?.trim() || ''

          // 이미지 URL 추출 및 정규화
          const imgElement = item.querySelector(sel.IMAGE) as HTMLImageElement | null
          let imageUrl = imgElement?.getAttribute('src') || imgElement?.getAttribute('data-src') || ''
          
          // 이미지 URL 정규화
          if (imageUrl) {
            if (imageUrl.startsWith('//')) {
              imageUrl = `https:${imageUrl}`
            } else if (imageUrl.startsWith('/')) {
              imageUrl = `https://slatedigital.com${imageUrl}`
            }
            // 이미 http:// 또는 https://로 시작하면 그대로 사용
          }

          // 상세페이지 URL 추출: 이미지 링크 우선 사용
          // HTML 구조상 이미지 링크가 더 정확한 상품 URL을 제공
          const imageLinkElement = item.querySelector(sel.IMAGE_LINK) as HTMLAnchorElement | null
          const imageLinkParent = imgElement?.closest('a') as HTMLAnchorElement | null
          const linkElement = imageLinkElement || imageLinkParent || titleLink
          
          let link = linkElement?.getAttribute('href') || ''
          if (link && !link.startsWith('http')) {
            link = `https://slatedigital.com${link}`
          }

          // Slate Digital은 구독 모델이므로 가격 정보가 없음
          // Complete Access Bundle 또는 All Access Pass 형태
          return {
            name,
            developer: 'Slate Digital', // 고정값
            description: description || undefined,
            price: null, // 구독 모델이므로 가격 없음
            originalPrice: null,
            currency: 'USD',
            imageUrl: imageUrl || undefined,
            sourceUrl: link || undefined,
          } as CrawledPluginData
        } catch (error) {
          console.error(`플러그인 추출 오류:`, error)
          return null
        }
      }).filter((item): item is CrawledPluginData => item !== null)
    }, SELECTORS)
  },
}
