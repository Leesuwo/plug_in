import { getAdminClient } from '@/lib/supabase/admin'
import type { CrawledPluginData } from '../types'
import type { Database } from '@/src/types/supabase'

type PluginInsert = Database['public']['Tables']['plugins']['Insert']

/**
 * 크롤링된 플러그인 데이터를 Supabase에 저장
 * Service Role Key를 사용하여 RLS를 우회하고 데이터를 저장합니다
 * 
 * @param plugins - 저장할 크롤링된 플러그인 데이터 배열
 * @param source - 플러그인 소스 (예: 'Plugin Alliance', 'KVR')
 * @returns 저장된 플러그인 수와 건너뛴 플러그인 수
 */
export async function savePluginsBatch(
  plugins: CrawledPluginData[],
  source: string
): Promise<{ saved: number; skipped: number; errors: number }> {
  // Lazy initialization: 환경 변수가 로드된 후에 클라이언트 생성
  const adminClient = getAdminClient()
  
  let savedCount = 0
  let skippedCount = 0
  let errorCount = 0

  console.log(`\n[Storage] Supabase에 ${plugins.length}개의 플러그인 저장 중...`)

  for (const plugin of plugins) {
    try {
      // source_url이 있으면 중복 체크를 위해 사용, 없으면 name + developer + source 조합 사용
      let existingPlugin: { id: string } | null = null

      if (plugin.sourceUrl) {
        // source_url로 중복 체크 (가장 확실한 방법)
        const { data } = await adminClient
          .from('plugins')
          .select('id')
          .eq('source_url', plugin.sourceUrl)
          .single()

        existingPlugin = data || null
      }

      // source_url이 없거나 찾지 못한 경우, name + developer + source 조합으로 체크
      if (!existingPlugin) {
        const { data } = await adminClient
          .from('plugins')
          .select('id')
          .eq('name', plugin.name)
          .eq('developer', plugin.developer || 'Unknown')
          .eq('source', source)
          .single()

        existingPlugin = data || null
      }

      // DB에 저장할 데이터 형식으로 변환
      const pluginData: PluginInsert = {
        name: plugin.name,
        developer: plugin.developer || 'Unknown',
        description: plugin.description || null,
        price: plugin.price ?? null,
        currency: plugin.currency || 'USD',
        image_url: plugin.imageUrl || null,
        source_url: plugin.sourceUrl || null,
        source: source,
        updated_at: new Date().toISOString(),
      }

      if (existingPlugin) {
        // 기존 플러그인 업데이트
        const { error: updateError } = await adminClient
          .from('plugins')
          .update(pluginData)
          .eq('id', existingPlugin.id)

        if (updateError) {
          console.warn(`[Storage] 플러그인 업데이트 실패 (${plugin.name}):`, updateError.message)
          errorCount++
        } else {
          savedCount++
        }
        skippedCount++
      } else {
        // 새 플러그인 삽입
        const { error: insertError } = await adminClient
          .from('plugins')
          .insert(pluginData)

        if (insertError) {
          console.warn(`[Storage] 플러그인 저장 실패 (${plugin.name}):`, insertError.message)
          errorCount++
        } else {
          savedCount++
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error(`[Storage] 플러그인 처리 중 오류 (${plugin.name}):`, errorMsg)
      errorCount++
    }
  }

  console.log(`\n[Storage] 저장 완료: ${savedCount}개 저장, ${skippedCount}개 건너뜀, ${errorCount}개 오류`)

  return {
    saved: savedCount,
    skipped: skippedCount,
    errors: errorCount,
  }
}
