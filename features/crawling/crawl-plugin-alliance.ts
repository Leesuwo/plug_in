import { ScraperRunner } from './runner'
import { pluginAllianceScraper } from './scrapers/plugin-alliance'
import { savePluginsBatch } from './services/storage'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local')})

/**
 * Plugin Alliance 크롤링 전용 진입점
 * npm run crawl:plugin-alliance 명령으로 실행 가능
 */
async function main() {
  const runner = new ScraperRunner()
  
  try {
    await runner.init()
    console.log('Plugin Alliance 크롤링 시작...')
    
    // Strategy Pattern: 스크래퍼를 실행기에 전달하여 실행
    const result = await runner.run(pluginAllianceScraper, {
      maxPages: 10,
      minDelay: 1500,
      maxDelay: 3000,
    })

    console.log(`\n크롤링 완료: 총 ${result.plugins.length}개의 플러그인을 수집했습니다.`)
    
    if (result.errors.length > 0) {
      console.log(`\n경고: ${result.errors.length}개의 오류가 발생했습니다.`)
    }

    console.log('\n샘플 데이터 (최대 3개):')
    console.log(JSON.stringify(result.plugins.slice(0, 3), null, 2))

    // Supabase에 저장 (Service Role Key를 사용하여 RLS 우회)
    if (result.crawledData.length > 0) {
      const storageResult = await savePluginsBatch(
        result.crawledData,
        pluginAllianceScraper.name
      )
      console.log(`\n저장 결과: ${storageResult.saved}개 저장, ${storageResult.skipped}개 건너뜀, ${storageResult.errors}개 오류`)
    } else {
      console.log('\n저장할 데이터가 없습니다.')
    }
  } catch (error) {
    console.error('크롤링 오류:', error)
    process.exit(1)
  } finally {
    await runner.close()
  }
}

// 직접 실행된 경우에만 실행
if (require.main === module) {
  main()
}
