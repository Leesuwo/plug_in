import { Page } from 'playwright'
import type { PluginScraper, CrawledPluginData } from '../types'

/**
 * Solid State Logic 선택자 상수
 * HTML 구조 분석 기반 정확한 선택자
 */
const SELECTORS = {
  // 플러그인 아이템 컨테이너: a.cb-image-content-highlight
  ITEM: 'a.cb-image-content-highlight',
  
  // 플러그인 제목: div.content > div.h3.color-alpha
  TITLE: 'div.content div.h3.color-alpha',
  
  // 플러그인 설명: div.content > p.color-beta
  DESCRIPTION: 'div.content p.color-beta',
  
  // 이미지: div.top > div.image (background-image CSS 속성 사용)
  IMAGE: 'div.top div.image',
  
  // 상세페이지 URL: a.cb-image-content-highlight의 href 속성
  LINK: 'a.cb-image-content-highlight',
}

/**
 * Solid State Logic 플러그인 스크래퍼
 * Strategy Pattern: PluginScraper 인터페이스 구현
 */
export const solidStateLogicScraper: PluginScraper = {
  name: 'Solid State Logic',
  baseUrl: 'https://solidstatelogic.com',
  
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
          // 플러그인 제목 추출 (HTML 내 <br> 태그를 공백으로 변환)
          const titleElement = item.querySelector(sel.TITLE) as HTMLElement | null
          let name = titleElement?.textContent?.trim() || ''
          
          // <br> 태그로 인한 여러 줄바꿈을 단일 공백으로 정리
          if (name) {
            name = name.replace(/\s+/g, ' ').trim()
          }
          
          if (!name || name === `Plugin ${index + 1}`) {
            return null
          }

          // 플러그인 설명 추출
          const descElement = item.querySelector(sel.DESCRIPTION)
          const description = descElement?.textContent?.trim() || ''

          // 이미지 URL 추출: background-image CSS 속성에서 추출
          // 인라인 스타일 또는 computed style 모두 확인
          const imageElement = item.querySelector(sel.IMAGE) as HTMLElement | null
          let imageUrl = ''
          
          if (imageElement) {
            // 먼저 인라인 스타일에서 추출 시도 (더 정확함)
            const inlineStyle = imageElement.getAttribute('style') || ''
            const inlineMatch = inlineStyle.match(/background-image\s*:\s*url\(['"]?([^'"]+)['"]?\)/)
            if (inlineMatch && inlineMatch[1]) {
              imageUrl = inlineMatch[1]
            } else {
              // 인라인 스타일이 없으면 computed style에서 추출
              const bgImage = window.getComputedStyle(imageElement).backgroundImage
              const urlMatch = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/)
              if (urlMatch && urlMatch[1]) {
                imageUrl = urlMatch[1]
              }
            }
          }
          
          // 이미지 URL 정규화
          if (imageUrl) {
            if (imageUrl.startsWith('//')) {
              imageUrl = `https:${imageUrl}`
            } else if (imageUrl.startsWith('/')) {
              imageUrl = `https://solidstatelogic.com${imageUrl}`
            }
            // 이미 http:// 또는 https://로 시작하면 그대로 사용
          }

          // 상세페이지 URL 추출 및 정규화
          const linkElement = item as HTMLAnchorElement
          let link = linkElement?.getAttribute('href') || ''
          if (link && !link.startsWith('http')) {
            link = `https://solidstatelogic.com${link}`
          }

          // Solid State Logic은 가격 정보가 HTML에 없음 (상세 페이지에서 확인 필요)
          return {
            name,
            developer: 'Solid State Logic', // 고정값
            description: description || undefined,
            price: null, // 가격 정보 없음
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
