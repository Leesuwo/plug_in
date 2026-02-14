import { Page } from 'playwright'
import type { PluginScraper, CrawledPluginData } from '../types'

/**
 * Plugin Alliance 선택자 상수
 * HTML 구조 분석 기반 정확한 선택자
 */
const SELECTORS = {
  // 제품 카드 컨테이너
  ITEM: 'li.grid__item, .card-wrapper.product-card-wrapper',
  
  // 상품명: .card__heading h3 a 또는 .card__heading a
  TITLE: '.card__heading a, .card__heading h3 a',
  
  // 제조회사 (Vendor): .caption-with-letter-spacing.light
  VENDOR: '.caption-with-letter-spacing.light',
  
  // 가격: 할인가 우선, 없으면 일반 가격
  PRICE_SALE: '.price-item--sale.price-item--last',
  PRICE_REGULAR: '.price-item--regular',
  PRICE_CONTAINER: '.price__container',
  
  // 설명: .short-description.metafield .metafield-rich_text_field p
  DESCRIPTION: '.short-description.metafield .metafield-rich_text_field p, .short-description p',
  
  // 이미지: img 태그의 src 속성
  IMAGE: 'img',
  
  // 상세페이지 URL: .card__heading a 또는 a.full-unstyled-link
  LINK: '.card__heading a, a.full-unstyled-link[href*="/products/"]',
}

/**
 * Plugin Alliance 플러그인 스크래퍼
 * Strategy Pattern: PluginScraper 인터페이스 구현
 */
export const pluginAllianceScraper: PluginScraper = {
  name: 'Plugin Alliance',
  baseUrl: 'https://www.plugin-alliance.com',
  
  async scrape(page: Page): Promise<CrawledPluginData[]> {
    // runner에서 이미 올바른 URL로 이동했으므로 여기서는 이동하지 않음
    // page 파라미터가 포함된 URL로 이미 이동한 상태

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
          // 상품명 추출
          const nameElement = item.querySelector(sel.TITLE) as HTMLAnchorElement | null
          const name = nameElement?.textContent?.trim() || `Plugin ${index + 1}`

          if (!name || name === `Plugin ${index + 1}`) {
            return null
          }

          // 제조회사 (Vendor) 추출
          const vendorElement = item.querySelector(sel.VENDOR)
          const vendor = vendorElement?.textContent?.trim() || ''

          // 가격 추출 - 할인가 우선, 없으면 일반 가격
          const priceContainer = item.querySelector(sel.PRICE_CONTAINER)
          let price: number | null = null
          let originalPrice: number | null = null

          if (priceContainer) {
            // 할인가 추출
            const salePriceElement = priceContainer.querySelector(sel.PRICE_SALE)
            if (salePriceElement) {
              const salePriceText = salePriceElement.textContent?.trim() || ''
              const salePriceMatch = salePriceText.match(/\$?([\d,]+\.?\d*)/)
              price = salePriceMatch ? parseFloat(salePriceMatch[1].replace(/,/g, '')) : null
              
              // 원래 가격 추출 (할인 시 <s> 태그 안에 있음)
              const regularPriceElement = priceContainer.querySelector('s.price-item--regular, .price-item--regular')
              if (regularPriceElement) {
                const regularPriceText = regularPriceElement.textContent?.trim() || ''
                const regularPriceMatch = regularPriceText.match(/\$?([\d,]+\.?\d*)/)
                originalPrice = regularPriceMatch ? parseFloat(regularPriceMatch[1].replace(/,/g, '')) : null
              }
            } else {
              // 할인이 없으면 일반 가격
              const regularPriceElement = priceContainer.querySelector(sel.PRICE_REGULAR)
              if (regularPriceElement) {
                const regularPriceText = regularPriceElement.textContent?.trim() || ''
                const regularPriceMatch = regularPriceText.match(/\$?([\d,]+\.?\d*)/)
                price = regularPriceMatch ? parseFloat(regularPriceMatch[1].replace(/,/g, '')) : null
              }
            }
          }

          // 설명 추출
          const descElement = item.querySelector(sel.DESCRIPTION)
          const description = descElement?.textContent?.trim() || ''

          // 이미지 URL 추출 및 정규화
          const imgElement = item.querySelector(sel.IMAGE) as HTMLImageElement | null
          let imageUrl = imgElement?.getAttribute('src') || ''
          
          // 이미지 URL 정규화: //로 시작하면 https: 추가, /로 시작하면 도메인 추가
          if (imageUrl) {
            if (imageUrl.startsWith('//')) {
              imageUrl = `https:${imageUrl}`
            } else if (imageUrl.startsWith('/')) {
              // 중복 도메인 제거: /www.plugin-alliance.com/... 형태 처리
              if (imageUrl.startsWith('/www.plugin-alliance.com/')) {
                imageUrl = imageUrl.replace('/www.plugin-alliance.com', '')
              }
              imageUrl = `https://www.plugin-alliance.com${imageUrl}`
            }
            // 이미 http:// 또는 https://로 시작하면 그대로 사용
          }

          // 상세페이지 URL 추출 및 정규화
          const linkElement = nameElement || (item.querySelector(sel.LINK) as HTMLAnchorElement | null)
          let link = linkElement?.getAttribute('href') || ''
          if (link && !link.startsWith('http')) {
            link = `https://www.plugin-alliance.com${link}`
          }

          return {
            name,
            developer: vendor || undefined,
            description: description || undefined,
            price: price || null,
            originalPrice: originalPrice || null,
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
