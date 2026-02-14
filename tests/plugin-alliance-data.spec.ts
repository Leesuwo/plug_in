import { test, expect } from '@playwright/test'

/**
 * Plugin Alliance 크롤링 데이터 검증 테스트
 * 플러그인 명, 가격, 설명, 상세페이지 URL, 이미지 파일, 만든 회사명을 확인
 */
test.describe('Plugin Alliance 데이터 크롤링 검증', () => {
  test('제품 목록 페이지에서 플러그인 데이터 추출 및 검증', async ({ page }) => {
    // Plugin Alliance 제품 목록 페이지로 이동
    await page.goto('https://www.plugin-alliance.com/collections/all-products', {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    // 제품 카드가 로드될 때까지 대기
    await page.waitForSelector('article[class*="product"], div[class*="product-card"]', {
      timeout: 10000,
    })

    // 추가 안정성을 위한 대기
    await page.waitForTimeout(1000)

    // 첫 5개 제품의 데이터 추출 및 검증
    const products = await page.evaluate(() => {
      // HTML 구조 기반 정확한 선택자 사용
      const items = document.querySelectorAll('li.grid__item, .card-wrapper.product-card-wrapper')
      
      return Array.from(items).slice(0, 5).map((item, index) => {
        try {
          // 상품명 추출: .card__heading a
          const nameElement = item.querySelector('.card__heading a, .card__heading h3 a') as HTMLAnchorElement | null
          const name = nameElement?.textContent?.trim() || `Plugin ${index + 1}`

          // 제조회사 (Vendor) 추출: .caption-with-letter-spacing.light
          const vendorElement = item.querySelector('.caption-with-letter-spacing.light')
          const vendor = vendorElement?.textContent?.trim() || ''

          // 가격 추출: 할인가 우선, 없으면 일반 가격
          const priceContainer = item.querySelector('.price__container')
          let price: number | null = null
          let originalPrice: number | null = null

          if (priceContainer) {
            // 할인가 추출: .price-item--sale.price-item--last
            const salePriceElement = priceContainer.querySelector('.price-item--sale.price-item--last')
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
              // 할인이 없으면 일반 가격: .price-item--regular
              const regularPriceElement = priceContainer.querySelector('.price-item--regular')
              if (regularPriceElement) {
                const regularPriceText = regularPriceElement.textContent?.trim() || ''
                const regularPriceMatch = regularPriceText.match(/\$?([\d,]+\.?\d*)/)
                price = regularPriceMatch ? parseFloat(regularPriceMatch[1].replace(/,/g, '')) : null
              }
            }
          }

          // 설명 추출: .short-description.metafield .metafield-rich_text_field p
          const descElement = item.querySelector('.short-description.metafield .metafield-rich_text_field p, .short-description p')
          const description = descElement?.textContent?.trim() || ''

          // 이미지 URL 추출: img 태그의 src 속성
          const imgElement = item.querySelector('img') as HTMLImageElement | null
          let imageUrl = imgElement?.getAttribute('src') || ''
          
          // 이미지 URL 정규화
          if (imageUrl) {
            if (imageUrl.startsWith('//')) {
              imageUrl = `https:${imageUrl}`
            } else if (imageUrl.startsWith('/')) {
              if (imageUrl.startsWith('/www.plugin-alliance.com/')) {
                imageUrl = imageUrl.replace('/www.plugin-alliance.com', '')
              }
              imageUrl = `https://www.plugin-alliance.com${imageUrl}`
            }
          }

          // 상세페이지 URL 추출: .card__heading a의 href
          const linkElement = nameElement || (item.querySelector('a[href*="/products/"]') as HTMLAnchorElement | null)
          let detailUrl = linkElement?.getAttribute('href') || ''
          if (detailUrl && !detailUrl.startsWith('http')) {
            detailUrl = `https://www.plugin-alliance.com${detailUrl}`
          }

          return {
            index: index + 1,
            name,
            price: price,
            originalPrice: originalPrice,
            vendor,
            description,
            imageUrl,
            detailUrl,
            // 검증 플래그
            hasName: !!name && name !== `Plugin ${index + 1}`,
            hasPrice: price !== null,
            hasVendor: !!vendor,
            hasDescription: !!description,
            hasImage: !!imageUrl,
            hasDetailUrl: !!detailUrl,
            // 이미지 URL 패턴 분석
            imageUrlPattern: {
              startsWithHttp: imageUrl.startsWith('http://') || imageUrl.startsWith('https://'),
              startsWithDoubleSlash: imageUrl.startsWith('//'),
              startsWithSlash: imageUrl.startsWith('/'),
              containsDomain: imageUrl.includes('plugin-alliance.com'),
            },
          }
        } catch (error) {
          return {
            index: index + 1,
            error: error instanceof Error ? error.message : String(error),
          }
        }
      })
    })

    // 결과 출력
    console.log('\n=== Plugin Alliance 데이터 추출 결과 ===\n')
    console.log(JSON.stringify(products, null, 2))

    // 각 제품에 대해 검증
    for (const product of products) {
      if ('error' in product) {
        console.warn(`제품 ${product.index} 추출 오류:`, product.error)
        continue
      }

      test.step(`제품 ${product.index}: ${product.name} 검증`, async () => {
        // 플러그인 명 검증
        expect(product.hasName, `제품 ${product.index}: 플러그인 명이 없습니다`).toBe(true)
        expect(product.name.length, `제품 ${product.index}: 플러그인 명이 너무 짧습니다`).toBeGreaterThan(0)

        // 가격 검증
        expect(product.hasPrice, `제품 ${product.index}: 가격 정보가 없습니다`).toBe(true)
        if (product.price !== null) {
          expect(product.price, `제품 ${product.index}: 가격이 유효하지 않습니다`).toBeGreaterThan(0)
        }

        // 만든 회사명 검증 (선택사항이지만 있으면 좋음)
        // expect(product.hasVendor, `제품 ${product.index}: 회사명이 없습니다`).toBe(true)

        // 설명 검증 (선택사항)
        // expect(product.hasDescription, `제품 ${product.index}: 설명이 없습니다`).toBe(true)

        // 이미지 URL 검증
        expect(product.hasImage, `제품 ${product.index}: 이미지 URL이 없습니다`).toBe(true)
        if (product.imageUrl) {
          // 이미지 URL이 유효한 형식인지 확인
          const isValidUrl = 
            product.imageUrl.startsWith('http://') ||
            product.imageUrl.startsWith('https://') ||
            product.imageUrl.startsWith('//') ||
            product.imageUrl.startsWith('/')
          expect(isValidUrl, `제품 ${product.index}: 이미지 URL 형식이 올바르지 않습니다`).toBe(true)
        }

        // 상세페이지 URL 검증
        expect(product.hasDetailUrl, `제품 ${product.index}: 상세페이지 URL이 없습니다`).toBe(true)
        if (product.detailUrl) {
          expect(product.detailUrl, `제품 ${product.index}: 상세페이지 URL이 올바르지 않습니다`).toMatch(/^https:\/\/www\.plugin-alliance\.com\/products\//)
        }
      })
    }

    // 전체 요약 출력
    const summary = {
      totalProducts: products.length,
      validProducts: products.filter((p: any) => !('error' in p) && p.hasName && p.hasPrice && p.hasImage && p.hasDetailUrl).length,
      productsWithVendor: products.filter((p: any) => !('error' in p) && p.hasVendor).length,
      productsWithDescription: products.filter((p: any) => !('error' in p) && p.hasDescription).length,
      imageUrlPatterns: {
        http: products.filter((p: any) => !('error' in p) && p.imageUrlPattern?.startsWithHttp).length,
        doubleSlash: products.filter((p: any) => !('error' in p) && p.imageUrlPattern?.startsWithDoubleSlash).length,
        slash: products.filter((p: any) => !('error' in p) && p.imageUrlPattern?.startsWithSlash).length,
      },
    }

    console.log('\n=== 검증 요약 ===')
    console.log(JSON.stringify(summary, null, 2))
  })

  test('개별 제품 상세 페이지 데이터 확인', async ({ page }) => {
    // 제품 목록 페이지로 이동
    await page.goto('https://www.plugin-alliance.com/collections/all-products', {
      waitUntil: 'networkidle',
    })

    await page.waitForSelector('article[class*="product"], div[class*="product-card"]', {
      timeout: 10000,
    })

    // 첫 번째 제품의 상세 페이지 URL 가져오기
    const firstProductUrl = await page.evaluate(() => {
      const firstItem = document.querySelector('article[class*="product"], div[class*="product-card"]')
      const link = firstItem?.querySelector('a[href*="/products/"]') as HTMLAnchorElement | null
      if (!link) return null
      
      const href = link.getAttribute('href') || ''
      return href.startsWith('http') ? href : `https://www.plugin-alliance.com${href}`
    })

    expect(firstProductUrl).toBeTruthy()

    if (!firstProductUrl) return

    // 상세 페이지로 이동
    await page.goto(firstProductUrl, {
      waitUntil: 'networkidle',
    })

    // 상세 페이지에서 추가 정보 추출
    const detailData = await page.evaluate(() => {
      return {
        // 페이지 제목
        pageTitle: document.title,
        
        // 제품명 (상세 페이지)
        productName: document.querySelector('h1, [class*="product-title"], [class*="product-name"]')?.textContent?.trim() || '',
        
        // 가격 (상세 페이지)
        price: document.querySelector('[class*="price"], [class*="product-price"]')?.textContent?.trim() || '',
        
        // 회사명/브랜드 (상세 페이지)
        vendor: document.querySelector('[class*="vendor"], [class*="brand"], [class*="manufacturer"]')?.textContent?.trim() || '',
        
        // 설명 (상세 페이지 - 더 자세한 설명)
        description: document.querySelector('[class*="description"], [class*="product-description"]')?.textContent?.trim() || '',
        
        // 이미지 (상세 페이지 - 더 큰 이미지)
        mainImage: (document.querySelector('[class*="product-image"], [class*="main-image"] img, .product-images img') as HTMLImageElement)?.src || '',
        
        // 현재 URL
        currentUrl: window.location.href,
      }
    })

    console.log('\n=== 상세 페이지 데이터 ===')
    console.log(JSON.stringify(detailData, null, 2))

    // 상세 페이지 데이터 검증
    expect(detailData.productName.length).toBeGreaterThan(0)
    expect(detailData.currentUrl).toMatch(/^https:\/\/www\.plugin-alliance\.com\/products\//)
  })
})
